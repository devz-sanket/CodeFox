
import React, { useState } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { useTheme } from './hooks/useTheme';
import { Language } from './types';
import { DEFAULT_CODE } from './constants';

export type Page = 'home' | 'about' | 'contact';

const App: React.FC = () => {
  const [theme, toggleTheme] = useTheme();
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [language, setLanguage] = useState<Language>(Language.PYTHON);
  const [code, setCode] = useState<string>(DEFAULT_CODE[Language.PYTHON]);
  
  const handleNavigate = (page: Page) => {
    // Prevent re-rendering if clicking the current page's link
    if (page !== currentPage) {
      setCurrentPage(page);
    }
  };
  
  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage);
    setCode(DEFAULT_CODE[newLanguage]);
    // Optionally, navigate to home page when language changes if not already there
    if (currentPage !== 'home') {
        setCurrentPage('home');
    }
  };
  
  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage 
                  language={language}
                  code={code}
                  setCode={setCode}
                  theme={theme}
                />;
      case 'about':
        return <AboutPage onNavigate={handleNavigate} />;
      case 'contact':
        return <ContactPage />;
      default:
        return <HomePage 
                language={language}
                code={code}
                setCode={setCode}
                theme={theme}
              />;
    }
  }

  return (
    <div className="flex flex-col h-screen">
      <Header
        language={language}
        onLanguageChange={handleLanguageChange}
        theme={theme}
        toggleTheme={toggleTheme}
        currentPage={currentPage}
        onNavigate={handleNavigate}
      />
      <main className="flex-1 overflow-auto bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        {renderPage()}
      </main>
      <Footer />
    </div>
  );
};

export default App;