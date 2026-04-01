'use client';

import { useState, useTransition, type FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { signIn } from 'next-auth/react';
import { Eye, EyeOff, Glasses, Lock, Mail, Phone, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authApi } from '@/api';

export default function RegisterPage() {
  const t = useTranslations('auth');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');

  const callbackUrl = searchParams.get('callbackUrl') || '/';

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError(t('passwordMismatch'));
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
      } catch {
        setError(t('registerError'));
      }
    });
  };

  return (
    <div className="min-h-screen bg-white lg:grid lg:grid-cols-2">
      {/* Left branding panel */}
      <aside className="relative hidden overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 lg:flex">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(245,158,11,0.18),transparent_45%),radial-gradient(circle_at_70%_30%,rgba(59,130,246,0.14),transparent_48%),radial-gradient(circle_at_40%_80%,rgba(99,102,241,0.12),transparent_50%)]" />
        <div className="relative flex w-full flex-col p-12 text-slate-100">
          <div className="flex items-start gap-4">
            <div className="grid h-12 w-12 place-content-center rounded-2xl bg-amber-400 text-slate-950 shadow-sm">
              <Glasses className="h-6 w-6" aria-hidden="true" />
            </div>
            <div>
              <div className="text-xl font-semibold tracking-tight">
                Eyes Dream
              </div>
              <div className="text-sm text-slate-300">
                Hệ thống quản lý cửa hàng mắt kính
              </div>
            </div>
          </div>

          <div className="mt-24 max-w-xl">
            <h2 className="text-5xl leading-[1.08] font-semibold tracking-tight text-white">
              Tham gia cùng <span className="text-amber-400">OptiManager</span>
            </h2>
            <p className="mt-6 text-base leading-relaxed text-slate-300">
              Tạo tài khoản để bắt đầu sử dụng hệ thống quản lý cửa hàng mắt
              kính thông minh và hiệu quả nhất.
            </p>
          </div>

          <div className="mt-16 grid max-w-xl grid-cols-3 gap-10">
            <div>
              <div className="text-3xl font-semibold text-amber-400">24/7</div>
              <div className="mt-1 text-sm text-slate-300">Hỗ trợ liên tục</div>
            </div>
            <div>
              <div className="text-3xl font-semibold text-amber-400">
                Bảo mật
              </div>
              <div className="mt-1 text-sm text-slate-300">
                Dữ liệu được mã hóa
              </div>
            </div>
            <div>
              <div className="text-3xl font-semibold text-amber-400">
                All-in-One
              </div>
              <div className="mt-1 text-sm text-slate-300">
                Quản lý trên một nền tảng
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Right form panel */}
      <main className="flex items-center justify-center bg-slate-50 px-6 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
              {t('signUpTitle')}
            </h1>
            <p className="mt-2 text-sm text-slate-500">{t('signUpSubtitle')}</p>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-8 shadow-sm">
            {error && (
              <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm text-slate-700">
                  {t('name')}
                </Label>
                <div className="relative">
                  <User
                    className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400"
                    aria-hidden="true"
                  />
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="Nguyễn Văn A"
                    className="h-11 border-slate-200 bg-slate-50 pl-10 text-slate-900 placeholder:text-slate-400 focus:border-amber-400 focus:ring-amber-400"
                    autoComplete="name"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm text-slate-700">
                  {t('email')}
                </Label>
                <div className="relative">
                  <Mail
                    className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400"
                    aria-hidden="true"
                  />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="name@company.com"
                    className="h-11 border-slate-200 bg-slate-50 pl-10 text-slate-900 placeholder:text-slate-400 focus:border-amber-400 focus:ring-amber-400"
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm text-slate-700">
                  {t('phone')}
                </Label>
                <div className="relative">
                  <Phone
                    className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400"
                    aria-hidden="true"
                  />
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0901 234 567"
                    className="h-11 border-slate-200 bg-slate-50 pl-10 text-slate-900 placeholder:text-slate-400 focus:border-amber-400 focus:ring-amber-400"
                    autoComplete="tel"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm text-slate-700">
                  {t('password')}
                </Label>
                <div className="relative">
                  <Lock
                    className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400"
                    aria-hidden="true"
                  />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="h-11 border-slate-200 bg-slate-50 pr-10 pl-10 text-slate-900 placeholder:text-slate-400 focus:border-amber-400 focus:ring-amber-400 [&::-ms-clear]:hidden [&::-ms-reveal]:hidden [&::-webkit-contacts-auto-fill-button]:hidden [&::-webkit-credentials-auto-fill-button]:hidden"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute top-1/2 right-2 grid h-9 w-9 -translate-y-1/2 place-content-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                    aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" aria-hidden="true" />
                    ) : (
                      <Eye className="h-4 w-4" aria-hidden="true" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label
                  htmlFor="confirmPassword"
                  className="text-sm text-slate-700"
                >
                  {t('confirmPassword')}
                </Label>
                <div className="relative">
                  <Lock
                    className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400"
                    aria-hidden="true"
                  />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="h-11 border-slate-200 bg-slate-50 pr-10 pl-10 text-slate-900 placeholder:text-slate-400 focus:border-amber-400 focus:ring-amber-400 [&::-ms-clear]:hidden [&::-ms-reveal]:hidden [&::-webkit-contacts-auto-fill-button]:hidden [&::-webkit-credentials-auto-fill-button]:hidden"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    className="absolute top-1/2 right-2 grid h-9 w-9 -translate-y-1/2 place-content-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                    aria-label={
                      showConfirmPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'
                    }
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" aria-hidden="true" />
                    ) : (
                      <Eye className="h-4 w-4" aria-hidden="true" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isPending}
                className="h-11 w-full rounded-xl bg-slate-900 text-white hover:bg-slate-800"
              >
                {isPending ? tCommon('loading') : t('signUpButton')}
              </Button>
            </form>
          </div>

          <div className="mt-8 text-center text-sm text-slate-500">
            {t('haveAccount')}{' '}
            <Link
              href="/login"
              className="font-medium text-amber-600 hover:text-amber-700"
            >
              {t('login')}
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
