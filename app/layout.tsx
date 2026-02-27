import type { ReactNode } from 'react';
import './globals.css';

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const locale = 'vi';

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <style>{`
          body {
            background: linear-gradient(to right, #0f172a, #1e293b, #0f172a);
            color: #f1f5f9;
            margin: 0;
            padding: 0;
          }
          * {
            box-sizing: border-box;
          }
        `}</style>
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
