import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';
import { cookies } from 'next/headers';

export default getRequestConfig(async ({ requestLocale }) => {
  // Read locale from cookie first
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get('NEXT_LOCALE')?.value;
  
  let locale = cookieLocale || await requestLocale;

  // Ensure that a valid locale is used
  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale;
  }

  const [
    common,
    nav,
    auth,
    products,
    cart,
    checkout,
    footer,
    home,
    landing,
    dashboard,
    notFound,
  ] = await Promise.all([
    import(`../../messages/${locale}/common.json`).then((m) => m.default),
    import(`../../messages/${locale}/nav.json`).then((m) => m.default),
    import(`../../messages/${locale}/auth.json`).then((m) => m.default),
    import(`../../messages/${locale}/products.json`).then((m) => m.default),
    import(`../../messages/${locale}/cart.json`).then((m) => m.default),
    import(`../../messages/${locale}/checkout.json`).then((m) => m.default),
    import(`../../messages/${locale}/footer.json`).then((m) => m.default),
    import(`../../messages/${locale}/home.json`).then((m) => m.default),
    import(`../../messages/${locale}/landing.json`).then((m) => m.default),
    import(`../../messages/${locale}/dashboard.json`).then((m) => m.default),
    import(`../../messages/${locale}/notFound.json`).then((m) => m.default),
  ]);

  return {
    locale,
    messages: {
      common,
      nav,
      auth,
      products,
      cart,
      checkout,
      footer,
      home,
      landing,
      dashboard,
      notFound,
    },
  };
});
