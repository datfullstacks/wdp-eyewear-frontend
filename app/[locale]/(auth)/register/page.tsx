'use client';

import { useState, useTransition, type FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { signIn } from 'next-auth/react';
import { authApi } from '@/api';

export default function RegisterPage() {
  const t = useTranslations('auth');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const callbackUrl = searchParams.get('callbackUrl') || `/${locale}/dashboard`;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError(t('registerError'));
      return;
    }

    startTransition(async () => {
      try {
        await authApi.register({
          name,
          email,
          password,
          confirmPassword,
        });

        const result = await signIn('credentials', {
          email,
          password,
          redirect: false,
          callbackUrl,
        });

        if (result?.error) {
          setError(t('loginError'));
          return;
        }

        router.push(result?.url || callbackUrl);
      } catch (err) {
        setError(t('registerError'));
      }
    });
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0f172a 0%, #111827 50%, #0b1220 100%)',
        padding: '32px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '460px',
          background: 'rgba(15, 23, 42, 0.9)',
          border: '1px solid rgba(148, 163, 184, 0.2)',
          borderRadius: '16px',
          padding: '32px',
          color: '#e2e8f0',
          boxShadow: '0 20px 40px rgba(0,0,0,0.35)',
        }}
      >
        <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '8px' }}>{t('signUpTitle')}</h1>
        <p style={{ marginBottom: '24px', color: '#94a3b8' }}>{t('register')}</p>

        {error && (
          <div
            style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              color: '#fecaca',
              padding: '10px 12px',
              borderRadius: '8px',
              marginBottom: '16px',
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontSize: '14px', color: '#cbd5f5' }}>{t('name')}</span>
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              style={{
                padding: '12px 14px',
                borderRadius: '10px',
                border: '1px solid rgba(148, 163, 184, 0.3)',
                background: 'rgba(15, 23, 42, 0.7)',
                color: '#e2e8f0',
              }}
            />
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontSize: '14px', color: '#cbd5f5' }}>{t('email')}</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              style={{
                padding: '12px 14px',
                borderRadius: '10px',
                border: '1px solid rgba(148, 163, 184, 0.3)',
                background: 'rgba(15, 23, 42, 0.7)',
                color: '#e2e8f0',
              }}
            />
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontSize: '14px', color: '#cbd5f5' }}>{t('password')}</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              style={{
                padding: '12px 14px',
                borderRadius: '10px',
                border: '1px solid rgba(148, 163, 184, 0.3)',
                background: 'rgba(15, 23, 42, 0.7)',
                color: '#e2e8f0',
              }}
            />
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontSize: '14px', color: '#cbd5f5' }}>{t('confirmPassword')}</span>
            <input
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
              style={{
                padding: '12px 14px',
                borderRadius: '10px',
                border: '1px solid rgba(148, 163, 184, 0.3)',
                background: 'rgba(15, 23, 42, 0.7)',
                color: '#e2e8f0',
              }}
            />
          </label>

          <button
            type="submit"
            disabled={isPending}
            style={{
              marginTop: '8px',
              padding: '12px 14px',
              borderRadius: '10px',
              border: '1px solid rgba(56, 189, 248, 0.4)',
              background: 'linear-gradient(90deg, #38bdf8, #6366f1)',
              color: '#0f172a',
              fontWeight: 700,
              cursor: isPending ? 'not-allowed' : 'pointer',
              opacity: isPending ? 0.7 : 1,
            }}
          >
            {isPending ? tCommon('loading') : t('signUpButton')}
          </button>
        </form>

        <div style={{ marginTop: '20px', fontSize: '14px', color: '#94a3b8' }}>
          {t('haveAccount')} {' '}
          <a href={`/${locale}/login`} style={{ color: '#38bdf8', fontWeight: 600 }}>
            {t('login')}
          </a>
        </div>
      </div>
    </div>
  );
}
