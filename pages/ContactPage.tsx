import React, { useState } from 'react';
import { SendIcon } from '../components/Icons';

export const ContactPage: React.FC = () => {
    const [result, setResult] = useState("");

    const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setResult("Sending....");
        const formData = new FormData(event.target as HTMLFormElement);

        formData.append("access_key", "998fa00f-69bd-4c1b-b1a4-9d56158b5bf1");

        const response = await fetch("https://api.web3forms.com/submit", {
            method: "POST",
            body: formData
        });

        const data = await response.json();

        if (data.success) {
            setResult("Form Submitted Successfully");
            (event.target as HTMLFormElement).reset();
            setTimeout(() => {
                setResult("");
            }, 5000);
        } else {
            console.log("Error", data);
            setResult(data.message);
        }
    };


    return (
        <div className="animate-fade-in min-h-full py-16 sm:py-24">
            <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                        Get In Touch
                    </h1>
                    <p className="mt-4 max-w-lg mx-auto text-lg text-gray-600 dark:text-gray-400">
  I'm Sanket Pundhir, the developer behind CodeFox. Have a question, a project idea, or just want to say hello? I'd love to hear from you. Fill <strong>form</strong> or <br />
  Email: <a href="mailto:sanketpundhir@gmail.com" className="text-blue-600 dark:text-blue-400 hover:underline">
    sanketpundhir@gmail.com
  </a>
</p>

                </div>

                <div className="mt-12">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700 p-8 sm:p-10">
                        <form onSubmit={onSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <InputField name="name" type="text" placeholder="Your Name" required />
                                <InputField name="email" type="email" placeholder="Your Email" required />
                            </div>
                            <div>
                                <InputField name="subject" type="text" placeholder="Subject" required />
                            </div>
                            <div>
                                <textarea
                                    name="message"
                                    placeholder="Your Message"
                                    rows={5}
                                    required
                                    className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-800 dark:text-gray-200 transition"
                                />
                            </div>
                            <div className="text-center pt-2">
                                <button
                                    type="submit"
                                    disabled={result === "Sending...."}
                                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 font-semibold text-white bg-gradient-to-r from-purple-600 to-orange-500 rounded-lg hover:from-purple-700 hover:to-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 transition-all transform hover:scale-105"
                                >
                                    <SendIcon className="w-5 h-5" /> {result === "Sending...." ? "Sending..." : "Send Message"}
                                </button>
                            </div>
                        </form>
                        {result && (
                            <p className={`mt-4 text-center text-sm ${result === "Form Submitted Successfully" ? "text-green-500" : "text-red-500"}`}>
                                {result}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const InputField: React.FC<{ name: string; type: string; placeholder: string; required?: boolean; }> =
({ name, type, placeholder, required }) => (
    <div>
        <input
            type={type}
            name={name}
            placeholder={placeholder}
            required={required}
            className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-800 dark:text-gray-200 transition"
        />
    </div>
);