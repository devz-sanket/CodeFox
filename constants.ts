
import { Language } from './types';

export const LANGUAGE_OPTIONS = [
  { id: Language.PYTHON, name: 'Python' },
  { id: Language.JAVASCRIPT, name: 'JavaScript' },
  { id: Language.CPP, name: 'C++' },
  { id: Language.JAVA, name: 'Java' },
];

export const DEFAULT_CODE: Record<Language, string> = {
  [Language.PYTHON]: `# Python: Incorrect print syntax
print "Hello, World!"
`,
  [Language.JAVASCRIPT]: `// JavaScript: Using a variable before declaration
console.log(myVar);
let myVar = 10;
`,
  [Language.CPP]: `// C++: Missing semicolon
#include <iostream>

int main() {
    std::cout << "Hello, World!"
    return 0;
}
`,
  [Language.JAVA]: `// Java: Incorrect method name
public class Main {
    public static void main(String[] args) {
        String greeting = "Hello, World!";
        System.out.println(greeting.subtring(0, 5));
    }
}
`,
};
