'use client';

import { useLocale, useTranslations } from 'next-intl';
import LanguageSelector from '@/components/atoms/LanguageSelector';

export default function Page() {
  const locale = useLocale();
  const t = useTranslations('landing');

  return (
    <div style={{ backgroundColor: '#ffffff' }}>
      {/* Header/Navigation */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '20px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <h1 style={{
            fontSize: '28px',
            fontWeight: '600',
            letterSpacing: '-0.5px',
            background: 'linear-gradient(135deg, #1a1a1a 0%, #4a4a4a 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            WDP Eyewear
          </h1>
          <nav style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
            <a href="#collection" style={{ color: '#666', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}>{t('nav.collection')}</a>
            <a href="#about" style={{ color: '#666', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}>{t('nav.about')}</a>
            <a href="#contact" style={{ color: '#666', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}>{t('nav.contact')}</a>
            <LanguageSelector currentLocale={locale} />
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section style={{
        background: 'linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%)',
        padding: '120px 24px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '60px',
          alignItems: 'center',
        }}>
          {/* Left Content */}
          <div>
            <div style={{ marginBottom: '12px' }}>
              <span style={{
                fontSize: '12px',
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '2px',
                color: '#b8a368',
              }}>
                {t('hero.badge')}
              </span>
            </div>
            <h2 style={{
              fontSize: '56px',
              fontWeight: '700',
              lineHeight: '1.2',
              marginBottom: '24px',
              color: '#1a1a1a',
            }}>
              {t('hero.title')}
            </h2>
            <p style={{
              fontSize: '18px',
              color: '#666',
              lineHeight: '1.8',
              marginBottom: '32px',
            }}>
              {t('hero.description')}
            </p>
            <div style={{ display: 'flex', gap: '16px' }}>
              <a href="#" style={{
                display: 'inline-block',
                padding: '14px 32px',
                backgroundColor: '#1a1a1a',
                color: '#ffffff',
                border: 'none',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                borderRadius: '4px',
                transition: 'all 0.3s ease',
                letterSpacing: '0.5px',
                textDecoration: 'none',
              }}>
                {t('hero.cta1')}
              </a>
              <a href="#" style={{
                display: 'inline-block',
                padding: '14px 32px',
                backgroundColor: 'transparent',
                color: '#1a1a1a',
                border: '2px solid #1a1a1a',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                borderRadius: '4px',
                transition: 'all 0.3s ease',
                letterSpacing: '0.5px',
                textDecoration: 'none',
              }}>
                {t('hero.cta2')}
              </a>
            </div>
          </div>

          {/* Right Visual */}
          <div style={{
            background: 'linear-gradient(135deg, #d4af37 0%, #b8a368 100%)',
            borderRadius: '8px',
            height: '500px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            fontSize: '24px',
            fontWeight: '300',
          }}>
            [Premium Eyewear Image]
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section style={{ padding: '80px 24px', backgroundColor: '#ffffff' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <h3 style={{
            fontSize: '36px',
            fontWeight: '700',
            textAlign: 'center',
            marginBottom: '60px',
            color: '#1a1a1a',
          }}>
            {t('features.title')}
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '40px',
          }}>
            {[
              { icon: '✓', titleKey: 'features.quality.title', descKey: 'features.quality.desc' },
              { icon: '✓', titleKey: 'features.curation.title', descKey: 'features.curation.desc' },
              { icon: '✓', titleKey: 'features.support.title', descKey: 'features.support.desc' },
              { icon: '✓', titleKey: 'features.packaging.title', descKey: 'features.packaging.desc' },
            ].map((feature, idx) => (
              <div key={idx} style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: '32px',
                  color: '#b8a368',
                  marginBottom: '16px',
                }}>
                  {feature.icon}
                </div>
                <h4 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  marginBottom: '12px',
                  color: '#1a1a1a',
                }}>
                  {t(feature.titleKey)}
                </h4>
                <p style={{
                  fontSize: '14px',
                  color: '#999',
                  lineHeight: '1.6',
                }}>
                  {t(feature.descKey)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section style={{
        backgroundColor: '#f9f9f9',
        padding: '80px 24px',
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <h3 style={{
            fontSize: '36px',
            fontWeight: '700',
            textAlign: 'center',
            marginBottom: '60px',
            color: '#1a1a1a',
          }}>
            {t('testimonials.title')}
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '32px',
          }}>
            {t.raw('testimonials.items').map((testimonial: any, idx: number) => (
              <div key={idx} style={{
                backgroundColor: '#ffffff',
                padding: '32px',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
              }}>
                <p style={{
                  fontSize: '14px',
                  color: '#666',
                  marginBottom: '20px',
                  lineHeight: '1.8',
                  fontStyle: 'italic',
                }}>
                  "{testimonial.text}"
                </p>
                <p style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#1a1a1a',
                  marginBottom: '4px',
                }}>
                  {testimonial.name}
                </p>
                <p style={{
                  fontSize: '12px',
                  color: '#999',
                }}>
                  {testimonial.role}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        background: 'linear-gradient(135deg, #1a1a1a 0%, #333333 100%)',
        padding: '80px 24px',
        color: '#ffffff',
      }}>
        <div style={{
          maxWidth: '800px',
          margin: '0 auto',
          textAlign: 'center',
        }}>
          <h3 style={{
            fontSize: '36px',
            fontWeight: '700',
            marginBottom: '24px',
          }}>
            {t('cta.title')}
          </h3>
          <p style={{
            fontSize: '18px',
            color: '#cccccc',
            marginBottom: '40px',
            lineHeight: '1.8',
          }}>
            {t('cta.description')}
          </p>
          <button style={{
            padding: '16px 48px',
            backgroundColor: '#b8a368',
            color: '#1a1a1a',
            border: 'none',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            borderRadius: '4px',
            transition: 'all 0.3s ease',
            letterSpacing: '0.5px',
          }}>
            {t('cta.button')}
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        backgroundColor: '#0f0f0f',
        color: '#999',
        padding: '40px 24px',
        fontSize: '12px',
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          textAlign: 'center',
          borderTop: '1px solid #333',
          paddingTop: '24px',
        }}>
          <p>{t('footer.copyright')}</p>
          <p style={{ marginTop: '12px' }}>{t('footer.tagline')}</p>
        </div>
      </footer>
    </div>
  );
}