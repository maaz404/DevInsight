import React, { createContext, useContext, useState, useEffect } from 'react';
import { lightTheme, darkTheme } from './antdTheme';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Get theme from localStorage or default to light mode
    const savedTheme = localStorage.getItem('devinsight-theme');
    return savedTheme === 'dark';
  });

  const toggleTheme = () => {
    setIsDarkMode(prev => {
      const newMode = !prev;
      localStorage.setItem('devinsight-theme', newMode ? 'dark' : 'light');
      return newMode;
    });
  };

  const currentTheme = isDarkMode ? darkTheme : lightTheme;

  useEffect(() => {
    // Save theme preference to localStorage whenever it changes
    localStorage.setItem('devinsight-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const value = {
    isDarkMode,
    toggleTheme,
    currentTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;
