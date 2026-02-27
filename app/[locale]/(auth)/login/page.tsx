'use client';

import { useEffect, useState, useTransition, type FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { getCsrfToken, getProviders, signIn } from 'next-auth/react';
import { Eye, EyeOff, Glasses, Lock, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function LoginPage() {
  const t = useTranslations('auth');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const callbackUrl = searchParams.get('callbackUrl') || '/';
  const postLoginUrl = `/auth/post-login?callbackUrl=${encodeURIComponent(callbackUrl)}`;

  useEffect(() => {
    router.prefetch('/staff/dashboard-staff');
    router.prefetch(postLoginUrl);

    // Warm up NextAuth endpoints so the user doesn't pay the cost on submit
    void Promise.all([getProviders(), getCsrfToken()]);
  }, [router, postLoginUrl]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    startTransition(async () => {
      try {
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

        router.push(postLoginUrl);
      } catch {
        setError(t('loginError'));
      }
    });
  };

  return (
    <div className="min-h-screen bg-white lg:grid lg:grid-cols-2">
      <aside className="relative hidden overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 lg:flex">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(245,158,11,0.18),transparent_45%),radial-gradient(circle_at_70%_30%,rgba(59,130,246,0.14),transparent_48%),radial-gradient(circle_at_40%_80%,rgba(99,102,241,0.12),transparent_50%)]" />
        <div className="relative flex w-full flex-col p-12 text-slate-100">
          <div className="flex items-start gap-4">
            <div className="grid h-12 w-12 place-content-center rounded-2xl bg-amber-400 text-slate-950 shadow-sm">
              <Glasses className="h-6 w-6" aria-hidden="true" />
            </div>
            <div>
              <div className="text-xl font-semibold tracking-tight">
                OptiManager
              </div>
              <div className="text-sm text-slate-300">
                Hệ thống quản lý cửa hàng mắt kính
              </div>
            </div>
          </div>

          <div className="mt-24 max-w-xl">
            <h2 className="text-5xl leading-[1.08] font-semibold tracking-tight text-white">
              Quản lý cửa hàng{' '}
              <span className="text-amber-400">thông minh & hiệu quả</span>
            </h2>
            <p className="mt-6 text-base leading-relaxed text-slate-300">
              Giải pháp toàn diện cho việc quản lý đơn hàng, tồn kho, vận chuyển
              và chăm sóc khách hàng — tất cả trong một nền tảng duy nhất.
            </p>
          </div>

          <div className="mt-16 grid max-w-xl grid-cols-3 gap-10">
            <div>
              <div className="text-3xl font-semibold text-amber-400">500+</div>
              <div className="mt-1 text-sm text-slate-300">
                Cửa hàng tin dùng
              </div>
            </div>
            <div>
              <div className="text-3xl font-semibold text-amber-400">10K+</div>
              <div className="mt-1 text-sm text-slate-300">Đơn hàng/ngày</div>
            </div>
            <div>
              <div className="text-3xl font-semibold text-amber-400">99.9%</div>
              <div className="mt-1 text-sm text-slate-300">Uptime</div>
            </div>
          </div>

          <div className="mt-auto pt-10 text-sm text-slate-400">
            © 2026 OptiManager. All rights reserved.
          </div>
        </div>
      </aside>

      <main className="flex items-center justify-center bg-slate-50 px-6 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
              {t('login')}
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Nhập thông tin đăng nhập để truy cập hệ thống quản lý
            </p>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-8 shadow-sm">
            {error && (
              <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
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
                    onChange={(event) => setEmail(event.target.value)}
                    required
                    placeholder="name@company.com"
                    className="h-11 bg-slate-50 pl-10"
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm text-slate-700">
                    {t('password')}
                  </Label>
                  <button
                    type="button"
                    className="text-sm text-slate-500 hover:text-slate-700"
                  >
                    {t('forgotPassword')}
                  </button>
                </div>

                <div className="relative">
                  <Lock
                    className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400"
                    aria-hidden="true"
                  />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                    placeholder="••••••••"
                    className="h-11 bg-slate-50 pr-10 pl-10"
                    autoComplete="current-password"
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

              <div className="flex items-center gap-2">
                <Checkbox
                  id="rememberMe"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked === true)}
                />
                <Label
                  htmlFor="rememberMe"
                  className="text-sm font-normal text-slate-600"
                >
                  Ghi nhớ đăng nhập
                </Label>
              </div>

              <Button
                type="submit"
                disabled={isPending}
                className="h-11 w-full rounded-xl bg-slate-900 text-white hover:bg-slate-800"
              >
                {isPending ? tCommon('loading') : t('signInButton')}
              </Button>
            </form>
          </div>

          <div className="mt-8 text-center text-sm text-slate-500">
            {t('noAccount')}{' '}
            <span className="font-medium text-slate-700">
              Liên hệ quản trị viên
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}
