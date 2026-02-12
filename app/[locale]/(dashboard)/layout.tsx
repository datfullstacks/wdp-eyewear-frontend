import { getTranslations } from 'next-intl/server';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = await getTranslations('dashboard');

  // TODO: Get user role from session
  // const session = await auth();
  // const userRole = session?.user?.role;

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gradient-to-b from-blue-900 to-blue-800 text-white p-4 sticky top-0 h-screen overflow-y-auto">
        <h2 className="text-2xl font-bold mb-8 bg-gradient-to-r from-blue-300 to-cyan-300 bg-clip-text text-transparent">{t('title')}</h2>
        <nav className="space-y-2">
          {/* Common for all roles */}
          <a href="/" className="block px-4 py-2 rounded hover:bg-gray-700">
            {t('home')}
          </a>
          
          {/* Staff + Operations + Manager + Admin */}
          <a href="/orders" className="block px-4 py-2 rounded hover:bg-gray-700">
            {t('orders')}
          </a>
          
          {/* Staff only */}
          <a href="/prescriptions" className="block px-4 py-2 rounded hover:bg-gray-700">
            {t('prescriptions')}
          </a>
          <a href="/customers" className="block px-4 py-2 rounded hover:bg-gray-700">
            {t('customers')}
          </a>
          <a href="/returns" className="block px-4 py-2 rounded hover:bg-gray-700">
            {t('returns')}
          </a>
          
          {/* Operations only */}
          <a href="/inventory" className="block px-4 py-2 rounded hover:bg-gray-700">
            {t('inventory')}
          </a>
          
          {/* Manager + Admin */}
          <a href="/products" className="block px-4 py-2 rounded hover:bg-gray-700">
            {t('products')}
          </a>
          <a href="/users" className="block px-4 py-2 rounded hover:bg-gray-700">
            {t('users')}
          </a>
          <a href="/reports" className="block px-4 py-2 rounded hover:bg-gray-700">
            {t('reports')}
          </a>
          
          {/* All roles */}
          <a href="/settings" className="block px-4 py-2 rounded hover:bg-gray-700">
            {t('settings')}
          </a>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8 bg-gradient-to-br from-slate-50 to-slate-100">
        {children}
      </main>
    </div>
  );
}
