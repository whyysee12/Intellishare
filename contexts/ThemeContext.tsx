import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Preferences {
  theme: 'light' | 'dark' | 'contrast';
  language: string;
  dateFormat: string;
  showQuickStats: boolean;
  realTimeMap: boolean;
  compactTables: boolean;
}

interface ThemeContextType {
  preferences: Preferences;
  updatePreference: (key: keyof Preferences, value: any) => void;
}

const defaultPreferences: Preferences = {
  theme: 'light',
  language: 'English (UK)',
  dateFormat: 'DD/MM/YYYY (Indian Standard)',
  showQuickStats: true,
  realTimeMap: true,
  compactTables: false
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children?: React.ReactNode }) => {
  const [preferences, setPreferences] = useState<Preferences>(() => {
    const saved = localStorage.getItem('intellishare_preferences');
    return saved ? JSON.parse(saved) : defaultPreferences;
  });

  useEffect(() => {
    localStorage.setItem('intellishare_preferences', JSON.stringify(preferences));
    
    // Apply Theme Side Effects
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark', 'contrast');
    
    if (preferences.theme === 'dark') {
      root.classList.add('dark');
      // Set background for dark mode if not handled by CSS classes fully
      document.body.style.backgroundColor = '#0f172a';
      document.body.style.color = '#f8fafc';
    } else if (preferences.theme === 'contrast') {
      root.classList.add('contrast');
      document.body.style.backgroundColor = '#ffffff';
      document.body.style.color = '#000000';
    } else {
      root.classList.add('light');
      document.body.style.backgroundColor = '#f8fafc';
      document.body.style.color = '#0f172a';
    }
    
  }, [preferences]);

  const updatePreference = (key: keyof Preferences, value: any) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  return (
    <ThemeContext.Provider value={{ preferences, updatePreference }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};