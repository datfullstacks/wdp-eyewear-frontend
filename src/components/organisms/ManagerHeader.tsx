'use client';

import React from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Button, LanguageSelector } from '../atoms';

export const ManagerHeader: React.FC = () => {
  const t = useTranslations('manager');
  const locale = useLocale();

  return (
    <header className="sticky top-0 z-10 border-b bg-white shadow-sm">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t('header.welcome')}
          </h1>
          <p className="text-sm text-gray-600">{t('header.subtitle')}</p>
        </div>

        <div className="flex items-center gap-4">
          <LanguageSelector currentLocale={locale} />

          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">Admin User</p>
              <p className="text-xs text-gray-600">Manager</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 font-semibold text-white">
              AU
            </div>
          </div>

          <Button variant="outline" size="sm">
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
          </Button>
        </div>
      </div>
    </header>
  );
};
