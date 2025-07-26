// contexts/LanguageContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext({
  language: 'en-US',
  region: 'US',
  setLanguage: () => {},
  setRegion: () => {},
  getLanguageCode: () => 'en-US',
  getRegionCode: () => 'US',
  getSupportedRegions: () => [],
});

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en-US');
  const [region, setRegion] = useState('US');

  // Load from localStorage on init
  useEffect(() => {
    const savedLanguage = localStorage.getItem('watchup_language');
    const savedRegion = localStorage.getItem('watchup_region');
    
    if (savedLanguage) setLanguage(savedLanguage);
    if (savedRegion) setRegion(savedRegion);
  }, []);

  // Save to localStorage when changed
  useEffect(() => {
    localStorage.setItem('watchup_language', language);
    localStorage.setItem('watchup_region', region);
  }, [language, region]);

  const getLanguageCode = () => {
    return language.split('-')[0]; // 'en' from 'en-US'
  };

  const getRegionCode = () => {
    return region;
  };

  const getSupportedRegions = () => {
    return [
      { code: 'US', name: 'United States'},
      { code: 'DE', name: 'Germany'},
      { code: 'GB', name: 'United Kingdom'},
      { code: 'FR', name: 'France'},
      { code: 'ES', name: 'Spain'},
      { code: 'CA', name: 'Canada'},
      { code: 'AU', name: 'Australia'},
      { code: 'JP', name: 'Japan'},
      { code: 'KR', name: 'South Korea'}
    ];
  };

  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage);
    // Auto-set region based on language if not explicitly set
    if (newLanguage.includes('-')) {
      const langRegion = newLanguage.split('-')[1];
      setRegion(langRegion);
    }
  };

  const handleRegionChange = (newRegion) => {
    setRegion(newRegion);
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        region,
        setLanguage: handleLanguageChange,
        setRegion: handleRegionChange,
        getLanguageCode,
        getRegionCode,
        getSupportedRegions,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};