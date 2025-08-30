import React from 'react';
import type { Page } from '../App';
// FIX: Import missing LightbulbIcon and MessageSquareIcon components.
import { FoxIcon, ZapIcon, BookOpenIcon, TargetIcon, CodeIcon, SparklesIcon, BugIcon, LightbulbIcon, MessageSquareIcon } from '../components/Icons';

interface AboutPageProps {
  onNavigate: (page: Page) => void;
}

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 border border-gray-200 dark:border-gray-700">
    <div className="flex items-center justify-center w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-full text-primary-600 dark:text-primary-300 mb-4">
      {icon}
    </div>
    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">{title}</h3>
    <p className="text-gray-600 dark:text-gray-400 text-sm">{children}</p>
  </div>
);

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate }) => {
  return (
    <div className="animate-fade-in min-h-full">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

        {/* Hero Section */}
        <div className="text-center mb-16">
          <FoxIcon className="w-20 h-20 text-primary-500 mx-auto mb-4" />
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            About <span className="text-primary-500">CodeFox</span>
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600 dark:text-gray-400">
            Your Personal AI Coding Companion, Making Learning to Code an Intuitive and Empowering Experience.
          </p>
        </div>

        {/* Mission and Goal Section */}
        <div className="grid md:grid-cols-2 gap-12 mb-16 items-center">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                 <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center justify-center w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-full text-primary-600 dark:text-primary-300">
                        <TargetIcon className="w-6 h-6" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Our Mission</h2>
                 </div>
                <p className="text-gray-600 dark:text-gray-400">
                    Our mission is to democratize coding education. We believe anyone can learn to code with the right tools. CodeFox provides an interactive, AI-powered environment that breaks down complex concepts, offers instant feedback, and fosters a love for problem-solving.
                </p>
            </div>
             <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center justify-center w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full text-green-600 dark:text-green-300">
                        <SparklesIcon className="w-6 h-6" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Our Goal</h2>
                </div>
                <p className="text-gray-600 dark:text-gray-400">
                    We aim to be the ultimate playground for aspiring developers. Whether you're writing your first line of code or preparing for technical interviews, our goal is to provide a supportive and intelligent platform that grows with you, helping you build confidence and master the art of programming.
                </p>
            </div>
        </div>


        {/* Features Section */}
        <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">What We Provide</h2>
            <p className="mt-2 max-w-2xl mx-auto text-md text-gray-600 dark:text-gray-400">
                A suite of powerful features designed for a seamless learning journey.
            </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard icon={<ZapIcon className="w-6 h-6" />} title="Instant Debugging">
            Don't get stuck on errors. Our AI instantly analyzes your code, explains the problem in simple terms, and provides a corrected solution.
          </FeatureCard>
          <FeatureCard icon={<BookOpenIcon className="w-6 h-6" />} title="In-Depth Explanations">
            Curious how a piece of code works? Highlight it and let our AI provide a detailed, line-by-line explanation of the logic and syntax.
          </FeatureCard>
          <FeatureCard icon={<CodeIcon className="w-6 h-6" />} title="Multi-Language Support">
            Master multiple languages without switching platforms. Practice and learn in Python, JavaScript, C++, and Java, all in one place.
          </FeatureCard>
           <FeatureCard icon={<BugIcon className="w-6 h-6" />} title="Simulated Execution">
            Run your code in a simulated environment to see the output or error messages instantly, helping you understand the cause and effect of your code.
          </FeatureCard>
           <FeatureCard icon={<LightbulbIcon className="w-6 h-6" />} title="Alternative Solutions">
            Discover new ways to solve problems. The AI can suggest alternative approaches to your code, expanding your programming toolkit.
          </FeatureCard>
           <FeatureCard icon={<MessageSquareIcon className="w-6 h-6" />} title="Conversational Learning">
            Ask follow-up questions and chat with the AI tutor. It understands the context of your code, providing relevant and helpful answers.
          </FeatureCard>
        </div>

         {/* CTA Section */}
        <div className="mt-20 text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Ready to Start Coding?</h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Jump into the editor and bring your ideas to life.</p>
            <button
                onClick={() => onNavigate('home')}
                className="mt-6 relative group inline-flex items-center justify-center px-6 py-3 text-lg font-bold text-white bg-gradient-to-r from-purple-600 to-orange-500 rounded-lg overflow-hidden shadow-lg transition-transform transform hover:scale-105"
            >
                 <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent group-hover:animate-shimmer" style={{ backgroundSize: '200% 100%' }}></span>
                 Start Learning
            </button>
        </div>
      </div>
    </div>
  );
};