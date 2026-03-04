'use client';

import { useState, useTransition, type FormEvent } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ArrowLeft, CheckCircle2, Glasses, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ForgotPasswordPage() {
  const t = useTranslations('auth');
  const tCommon = useTranslations('common');
  const [isPending, startTransition] = useTransition();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    startTransition(async () => {
      try {
        // TODO: Replace with actual API call when backend is ready
        // await authApi.forgotPassword({ email });

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1500));
        setIsSubmitted(true);
      } catch {
        setError('Có lỗi xảy ra. Vui lòng thử lại.');
      }
    });
  };

  const handleResend = () => {
    setIsSubmitted(false);
    startTransition(async () => {
      try {
        // TODO: Replace with actual API call when backend is ready
        await new Promise((resolve) => setTimeout(resolve, 1500));
        setIsSubmitted(true);
      } catch {
        setError('Có lỗi xảy ra. Vui lòng thử lại.');
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
              Chào mừng trở lại. Trải nghiệm giải pháp quản lý toàn diện — nơi
              mọi đơn hàng và khách hàng được vận hành trong một nền tảng duy
              nhất.
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
          {!isSubmitted ? (
            <>
              {/* Back to login */}
              <Link
                href="/login"
                className="mb-8 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                {t('backToLogin')}
              </Link>

              <div className="mb-8">
                <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
                  {t('forgotPasswordTitle')}
                </h1>
                <p className="mt-2 text-sm text-slate-500">
                  {t('forgotPasswordSubtitle')}
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
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="name@company.com"
                        className="h-11 border-slate-200 bg-slate-50 pl-10 text-slate-900 placeholder:text-slate-400 focus:border-amber-400 focus:ring-amber-400"
                        autoComplete="email"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isPending}
                    className="h-11 w-full rounded-xl bg-slate-900 text-white hover:bg-slate-800"
                  >
                    {isPending ? tCommon('loading') : t('sendResetLink')}
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <>
              {/* Success state */}
              <div className="rounded-2xl border border-slate-100 bg-white p-8 shadow-sm text-center">
                <div className="mx-auto mb-4 grid h-16 w-16 place-content-center rounded-full bg-green-50">
                  <CheckCircle2 className="h-8 w-8 text-green-500" />
                </div>
                <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
                  {t('resetEmailSent')}
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-slate-500">
                  {t('resetEmailSentDesc')}
                </p>
                <p className="mt-2 text-sm text-slate-400">
                  {t('checkSpam')}
                </p>

                <div className="mt-2 text-sm font-medium text-slate-700">
                  {email}
                </div>

                <div className="mt-8 flex flex-col gap-3">
                  <Button
                    type="button"
                    onClick={handleResend}
                    disabled={isPending}
                    variant="outline"
                    className="h-11 w-full rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50"
                  >
                    {isPending ? tCommon('loading') : t('resendEmail')}
                  </Button>

                  <Link
                    href="/login"
                    className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-slate-900 text-sm font-medium text-white hover:bg-slate-800 transition-colors"
                  >
                    {t('backToLogin')}
                  </Link>
                </div>
              </div>
            </>
          )}

          <div className="mt-8 text-center text-sm text-slate-500">
            {t('noAccount')}{' '}
            <Link href="/register" className="font-medium text-amber-600 hover:text-amber-700">
              {t('register')}
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
