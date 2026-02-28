'use client';

import { useSearchParams } from 'next/navigation';

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  return (
    <div className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-2xl font-semibold text-slate-100">
        Đăng nhập thất bại
      </h1>
      <p className="text-sm text-slate-300">
        {error ? `Lỗi: ${error}` : 'Có lỗi xảy ra, vui lòng thử lại.'}
      </p>
      <a
        href="/login"
        className="rounded-md bg-amber-400 px-4 py-2 text-sm font-medium text-slate-950 hover:bg-amber-300"
      >
        Quay lại trang đăng nhập
      </a>
    </div>
  );
}
