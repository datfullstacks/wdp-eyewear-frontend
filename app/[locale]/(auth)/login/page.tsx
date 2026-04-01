'use client';

import { useEffect, useState, useTransition, type FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
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
    router.prefetch('/sale/products');
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
    <div className="min-h-screen bg-white lg:grid lg:grid-cols-[1.08fr_0.92fr]">
      <aside className="relative hidden overflow-hidden border-r border-white/10 bg-[#0b1329] lg:flex">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_10%,rgba(245,158,11,0.18),transparent_28%),radial-gradient(circle_at_88%_82%,rgba(37,99,235,0.16),transparent_30%),linear-gradient(180deg,#111827_0%,#0b1329_55%,#0a1735_100%)]" />
        <div
          className="absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.08)_1px,transparent_1px)]"
          style={{ backgroundSize: '40px 40px' }}
        />
        <div className="absolute inset-y-0 left-0 w-px bg-gradient-to-b from-transparent via-amber-400/40 to-transparent" />
        <div className="relative flex w-full flex-col justify-between p-12 text-slate-100">
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

          <div className="mt-16 max-w-[760px]">
            <h2 className="text-[clamp(2.9rem,4.8vw,4.3rem)] leading-[0.98] font-extrabold tracking-[-0.055em] text-white">
              Quản lý cửa hàng{' '}
              <span className="block text-amber-400">
                thông minh & hiệu quả
              </span>
            </h2>
            <p className="mt-8 max-w-[650px] text-[15px] leading-8 text-slate-200/90">
              Chào mừng trở lại. Trải nghiệm giải pháp quản lý toàn diện — nơi
              mọi đơn hàng và khách hàng được vận hành trong một nền tảng duy
              nhất.
            </p>
          </div>

          <div className="mt-16 max-w-[760px]">
            <div className="grid grid-cols-3 gap-12">
              <div>
                <div className="text-[2.1rem] font-semibold text-amber-400">
                  24/7
                </div>
                <div className="mt-1 text-sm text-slate-200/90">
                  Hỗ trợ liên tục
                </div>
              </div>
              <div>
                <div className="text-[2.1rem] font-semibold text-amber-400">
                  Bảo mật
                </div>
                <div className="mt-1 text-sm text-slate-200/90">
                  Dữ liệu được mã hóa
                </div>
              </div>
              <div>
                <div className="text-[2.1rem] font-semibold text-amber-400">
                  All-in-One
                </div>
                <div className="mt-1 text-sm text-slate-200/90">
                  Quản lý trên một nền tảng
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <main className="relative flex items-center justify-center overflow-hidden bg-slate-50 px-6 py-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(245,158,11,0.08),transparent_34%)]" />
        <div className="relative w-full max-w-md">
          <div className="mb-8">
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
              {t('login')}
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Nhập thông tin đăng nhập để truy cập hệ thống quản lý
            </p>
          </div>

          <div className="rounded-[28px] border border-white/80 bg-white/90 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.12)] backdrop-blur-sm">
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
                    className="h-11 border-slate-200 bg-slate-50 pl-10 text-slate-900 placeholder:text-slate-400 focus:border-amber-400 focus:ring-amber-400"
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm text-slate-700">
                    {t('password')}
                  </Label>
                  {/* <Link
                    href="/forgot-password"
                    className="text-sm font-medium text-amber-600 hover:text-amber-700"
                  >
                    {t('forgotPassword')}
                  </Link> */}
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
                    className="h-11 border-slate-200 bg-slate-50 pr-10 pl-10 text-slate-900 placeholder:text-slate-400 focus:border-amber-400 focus:ring-amber-400 [&::-ms-clear]:hidden [&::-ms-reveal]:hidden [&::-webkit-contacts-auto-fill-button]:hidden [&::-webkit-credentials-auto-fill-button]:hidden"
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

          {/* <div className="mt-8 text-center text-sm text-slate-500">
            {t('noAccount')}{' '}
            <Link
              href="/register"
              className="font-medium text-amber-600 hover:text-amber-700"
            >
              {t('register')}
            </Link>
          </div> */}
        </div>
      </main>
    </div>
  );
}
