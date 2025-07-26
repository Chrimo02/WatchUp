import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function LanguageSelector() {
  const { language, region, setLanguage, setRegion, getSupportedRegions } = useLanguage();
  const [showDropdown, setShowDropdown] = useState(false);

  const supportedLanguages = [
    { code: 'en-US', name: 'English', flag: '🇺🇸' },
    { code: 'de-DE', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'fr-FR', name: 'Français', flag: '🇫🇷' },
    { code: 'es-ES', name: 'Español', flag: '🇪🇸' },
    { code: 'ja-JP', name: '日本語', flag: '🇯🇵' },
    { code: 'ko-KR', name: '한국어', flag: '🇰🇷' },
  ];
  const supportedRegions = getSupportedRegions();

  const getCurrentLanguage = () => supportedLanguages.find(lang => lang.code === language) || supportedLanguages[0];
  const getCurrentRegion = () => supportedRegions.find(reg => reg.code === region) || supportedRegions[0];

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center space-x-1 text-white hover:text-white/75 transition-colors"
      >
        <span className="leading-6 text-[16px] font-bold">
          {getCurrentLanguage().flag} {getCurrentRegion().code}
        </span>
        <ChevronDown className="w-4 h-4" />
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-64 bg-neutral-950 rounded-lg shadow-lg border border-white/20 z-50">
          <div className="p-3 border-b border-white/20">
            <h3 className="text-sm font-medium text-white mb-2">Language</h3>
            <div className="space-y-1">
              {supportedLanguages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setLanguage(lang.code);
                    setShowDropdown(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                    language === lang.code
                      ? 'bg-red-600 text-white'
                      : 'text-white/75 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {lang.flag} {lang.name}
                </button>
              ))}
            </div>
          </div>

          <div className="p-3">
            <h3 className="text-sm font-medium text-white mb-2">Region</h3>
            <div className="space-y-1">
              {supportedRegions.map((reg) => (
                <button
                  key={reg.code}
                  onClick={() => {
                    setRegion(reg.code);
                    setShowDropdown(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                    region === reg.code
                      ? 'bg-red-600 text-white'
                      : 'text-white/75 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <div className="flex justify-between">
                    <span>{reg.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
