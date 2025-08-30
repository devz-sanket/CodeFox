
import React from 'react';
import { Language, Theme } from '../types';
import type { Page } from '../App';
import { LANGUAGE_OPTIONS } from '../constants';
import { SunIcon, MoonIcon, FoxIcon, UsersIcon } from './Icons';

interface HeaderProps {
  language: Language;
  onLanguageChange: (language: Language) => void;
  theme: Theme;
  toggleTheme: () => void;
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

const NavLink: React.FC<{
  onClick: () => void;
  isActive: boolean;
  children: React.ReactNode;
}> = ({ onClick, isActive, children }) => (
  <button
    onClick={onClick}
    className={`text-sm font-medium transition-colors ${
      isActive
        ? 'text-primary-600 dark:text-primary-400'
        : 'text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400'
    }`}
  >
    {children}
  </button>
);

export const Header: React.FC<HeaderProps> = ({ language, onLanguageChange, theme, toggleTheme, currentPage, onNavigate }) => {
  return (
    <header className="flex items-center justify-between px-4 sm:px-6 h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="flex items-center gap-3">
        <FoxIcon className="w-8 h-8 text-primary-600" />
        <button onClick={() => onNavigate('home')} className="text-xl font-bold text-gray-800 dark:text-white tracking-tighter">CodeFox</button>
      </div>

      <nav className="hidden md:flex items-center gap-6">
        <NavLink onClick={() => onNavigate('home')} isActive={currentPage === 'home'}>Home</NavLink>
        <NavLink onClick={() => onNavigate('about')} isActive={currentPage === 'about'}>About</NavLink>
        <NavLink onClick={() => onNavigate('contact')} isActive={currentPage === 'contact'}>Contact</NavLink>
      </nav>

      <div className="flex items-center gap-4">
         <button onClick={() => onNavigate('contact')} className="relative group inline-flex items-center justify-center px-4 py-2 text-sm font-bold text-white bg-gradient-to-r from-purple-600 to-orange-500 rounded-lg overflow-hidden shadow-lg transition-transform transform hover:scale-105">
           <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent group-hover:animate-shimmer" style={{ backgroundSize: '200% 100%' }}></span>
           <UsersIcon className="w-4 h-4 mr-2"/>
           <span>Join Us</span>
         </button>
        {currentPage === 'home' && (
            <div className="relative">
                <select
                    value={language}
                    onChange={(e) => onLanguageChange(e.target.value as Language)}
                    className="appearance-none bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md py-2 pl-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900 dark:text-gray-100"
                    aria-label="Select programming language"
                >
                    {LANGUAGE_OPTIONS.map((lang) => (
                    <option key={lang.id} value={lang.id}>
                        {lang.name}
                    </option>
                    ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
            </div>
        )}
        {currentPage === 'home' && (
            <button
            onClick={toggleTheme}
            className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800 focus:ring-primary-500 transition-colors"
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
            {theme === 'light' ? <MoonIcon className="h-5 w-5" /> : <SunIcon className="h-5 w-5" />}
            </button>
        )}
      </div>
    </header>
  );
};
