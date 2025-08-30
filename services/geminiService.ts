import { GoogleGenAI, Type } from "@google/genai";
import type { Language, AssistantMessage, DebugResult } from "../types";

// Initialize the GoogleGenAI client with the provided API key.
const ai = new GoogleGenAI({ apiKey: "AIzaSyCB2eS5KAdCqRQwsIp_tXB8VR_dZrCBonM" });

export const checkForInputNeeded = async (language: Language, code: string): Promise<{ requiresInput: boolean, prompt: string }> => {
    const prompt = `Analyze the following ${language} code snippet. Determine if it requires any user input from stdin to run (e.g., from Python's \`input()\`, Java's \`Scanner\`, C++'s \`cin\`).

Code:
\`\`\`${language}
${code}
\`\`\`

If it requires input, create a short, friendly prompt message to ask the user for that input. For example, if the code is \`name = input("Enter your name:")\`, a good prompt would be "Enter your name:". If there's no specific prompt in the code, create a generic one like "Please provide the necessary input to run the code."

If the code does *not* require any user input to run, the prompt should be an empty string.

Your response MUST be a JSON object with two fields:
1.  "requiresInput": a boolean, \`true\` if input is needed, \`false\` otherwise.
2.  "prompt": a string containing the user-friendly prompt message, or an empty string.
`;

    const checkSchema = {
        type: Type.OBJECT,
        properties: {
            requiresInput: { type: Type.BOOLEAN },
            prompt: { type: Type.STRING },
        },
        required: ['requiresInput', 'prompt'],
    };

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: checkSchema,
        },
    });

    try {
        const result = JSON.parse(response.text.trim());
        return result as { requiresInput: boolean, prompt: string };
    } catch (e) {
        console.error("Failed to parse Gemini input check response:", response.text);
        return { requiresInput: false, prompt: '' }; // Fallback
    }
}


export const simulateExecution = async (language: Language, code: string, userInput?: string): Promise<{ success: boolean, output: string }> => {
    const prompt = `You are a world-class code interpreter for ${language}. Your task is to simulate the execution of the provided code snippet and return its output or any errors.
${userInput ? `
When the code expects user input from stdin, use the following value(s):
---INPUT---
${userInput}
---END INPUT---
Do not prompt for input yourself; consume the input provided above as if a user typed it into the console.
` : ''}
Code to execute:
\`\`\`${language}
${code}
\`\`\`

Analyze the code and determine the result of its execution.
- If the code executes successfully, capture the standard output.
- If the code contains syntax errors or would result in a runtime error, capture the standard error message.

Your response MUST be a JSON object with two fields:
1. "success": a boolean value, \`true\` if the code executes without errors, \`false\` otherwise.
2. "output": a string containing the standard output (on success) or the full error message (on failure).
`;

    const executionSchema = {
        type: Type.OBJECT,
        properties: {
            success: { type: Type.BOOLEAN },
            output: { type: Type.STRING },
        },
        required: ['success', 'output'],
    };

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: executionSchema,
        },
    });

    try {
        const resultText = response.text.trim();
        const result = JSON.parse(resultText);
        return result as { success: boolean, output: string };
    } catch (e) {
        console.error("Failed to parse Gemini execution response:", response.text);
        // Fallback in case of parsing failure
        return {
            success: false,
            output: "Error: The AI code interpreter failed to provide a valid response."
        };
    }
}


const debugPrompt = (language: Language, code: string, error: string): string => `
You are an expert, friendly coding tutor for beginners. A student is learning ${language} and ran into an error.
Their code is:
\`\`\`${language}
${code}
\`\`\`
The error message is:
\`\`\`
${error}
\`\`\`

Please analyze the code and the error. Provide the following:
1.  errorName: A short, simple name for the error (e.g., "Syntax Error", "Type Mismatch").
2.  explanation: A clear, step-by-step explanation of what the error means in a beginner-friendly way. Use simple markdown for formatting like paragraphs (separated by a blank line), lists, and bold text to make it easy to read. Do not use headings. Ensure proper spacing and grammar. Explain *why* it's an error in the context of ${language}.
3.  suggestion: The corrected version of the code snippet. This part of the response MUST contain ONLY the code, with no extra text, comments about changes, or formatting.
4.  alternatives: (Optional) If there are other common or interesting ways to write this code to achieve the same goal, provide up to two alternatives. For each alternative, provide a short description and the code snippet. If there are no clear alternatives, return an empty array.
`;

const debugSchema = {
  type: Type.OBJECT,
  properties: {
    errorName: { type: Type.STRING },
    explanation: { type: Type.STRING },
    suggestion: { type: Type.STRING },
    alternatives: {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                description: { type: Type.STRING },
                code: { type: Type.STRING },
            },
            required: ['description', 'code'],
        }
    }
  },
  required: ['errorName', 'explanation', 'suggestion', 'alternatives'],
};

export const debugCode = async (language: Language, code: string, error: string): Promise<DebugResult> => {
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: debugPrompt(language, code, error),
        config: {
            responseMimeType: "application/json",
            responseSchema: debugSchema,
        },
    });

    try {
        const resultText = response.text.trim();
        const result = JSON.parse(resultText);
        return result as DebugResult;
    } catch (e) {
        console.error("Failed to parse Gemini response:", response.text);
        throw new Error("AI response was not in the expected format.");
    }
};

export const streamExplainCode = async (
    language: Language,
    code: string,
    onChunk: (chunk: string) => void
): Promise<void> => {
    const prompt = `You are an expert, friendly coding tutor for beginners. A student wants to understand a piece of code.
The programming language is: ${language}

The code is:
\`\`\`${language}
${code}
\`\`\`

Please provide a clear, step-by-step explanation of this code. Break down its functionality, logic, and overall purpose. Explain the concepts involved in a way that is easy for a beginner to understand. Use simple markdown for formatting like paragraphs (separated by a blank line), lists, and bold text to make it easy to read. Do not use headings. Ensure proper spacing and grammar.`;

    const response = await ai.models.generateContentStream({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });

    for await (const chunk of response) {
        onChunk(chunk.text);
    }
};

export const streamExplainFix = async (
    language: Language,
    code: string,
    error: string,
    suggestion: string,
    onChunk: (chunk: string) => void
): Promise<void> => {
    const prompt = `You are an expert, friendly coding tutor. A student's code has an error, and you have already provided a fix. Now, the student wants a step-by-step explanation of the fix.

The programming language is: ${language}

The student's original (incorrect) code is:
\`\`\`${language}
${code}
\`\`\`

The error message was:
\`\`\`
${error}
\`\`\`

The suggested fix was:
\`\`\`${language}
${suggestion}
\`\`\`

Please provide a clean, step-by-step explanation of *why* the original code was wrong and *why* the suggested fix is correct. Explain the underlying concepts clearly for a beginner. Use simple markdown for formatting like paragraphs (separated by a blank line), lists, and bold text to make the explanation easy to read. Do not use headings.`;

    const response = await ai.models.generateContentStream({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });

    for await (const chunk of response) {
        onChunk(chunk.text);
    }
};

export const streamChatResponse = async (
    language: Language,
    currentCode: string,
    history: AssistantMessage[],
    newMessage: string,
    onChunk: (chunk: string) => void
): Promise<void> => {
    const chatHistory = history
        .filter(m => m.role === 'user' || m.role === 'model')
        .map(m => ({
            role: m.role,
            parts: [{ text: m.content }]
        }));

    const systemInstruction = `You are a helpful and patient coding tutor for the ${language} programming language.

CODE GENERATION RULES: When you write code, you MUST follow these rules:
1. Your primary output should be the code itself, inside a markdown block.
2. Do NOT add any inline comments unless the logic is exceptionally complex or non-obvious. Comments for variable declarations, simple loops, or standard function calls are strictly forbidden.
3. After the code block, provide a single, brief sentence explaining what the code does. Do NOT explain the code line-by-line unless the user explicitly asks for it.

Your tone should be encouraging and clear for a beginner. Use simple markdown for formatting like paragraphs, lists, and bold text. Do not use headings.

The user's current code is:
\`\`\`${language}
${currentCode}
\`\`\`
`;
    
    const chat = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
          systemInstruction,
        },
        history: chatHistory,
    });

    const response = await chat.sendMessageStream({ message: newMessage });
    for await (const chunk of response) {
        onChunk(chunk.text);
    }
};