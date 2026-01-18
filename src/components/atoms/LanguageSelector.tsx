'use client';

import { useLocaleSwitch } from '@/hooks/useLocaleSwitch';

interface LanguageSelectorProps {
  currentLocale: string;
  className?: string;
}

export default function LanguageSelector({
  currentLocale,
  className = '',
}: LanguageSelectorProps) {
  const { switchLocale, isPending } = useLocaleSwitch();

  const handleLanguageChange = (locale: 'en' | 'vi') => {
    switchLocale(locale);
  };

  return (
    <div className={`flex gap-2 ${className}`} style={{ display: 'flex', gap: '8px' }}>
      <button
        onClick={() => handleLanguageChange('en')}
        disabled={isPending}
        style={{
          padding: '8px 16px',
          borderRadius: '8px',
          fontWeight: '500',
          border: 'none',
          cursor: isPending ? 'not-allowed' : 'pointer',
          opacity: isPending ? '0.5' : '1',
          backgroundColor: currentLocale === 'en' ? '#3b82f6' : '#e5e7eb',
          color: currentLocale === 'en' ? '#ffffff' : '#374151',
          transition: 'all 0.3s ease',
        }}
      >
        English
      </button>
      <button
        onClick={() => handleLanguageChange('vi')}
        disabled={isPending}
        style={{
          padding: '8px 16px',
          borderRadius: '8px',
          fontWeight: '500',
          border: 'none',
          cursor: isPending ? 'not-allowed' : 'pointer',
          opacity: isPending ? '0.5' : '1',
          backgroundColor: currentLocale === 'vi' ? '#3b82f6' : '#e5e7eb',
          color: currentLocale === 'vi' ? '#ffffff' : '#374151',
          transition: 'all 0.3s ease',
        }}
      >
        Tiếng Việt
      </button>
    </div>
  );
}
