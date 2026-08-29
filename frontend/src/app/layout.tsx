import type { Metadata, Viewport } from 'next';
import './globals.css';
import { ThemeProvider } from '@/lib/theme/theme-context';
import { QueryProvider } from '@/lib/providers/query-provider';
import { AuthProvider } from '@/lib/auth/auth-context';
import { CartProvider } from '@/lib/cart/cart-context';
import { PwaProvider } from '@/lib/pwa/pwa-context';
import { AppShell } from '@/components/shared/app-shell';

export const metadata: Metadata = {
  title: 'Beresin - Service Commerce Platform',
  description: 'Platform service commerce & multi-jasa profesional terpercaya. Pesan layanan perbaikan, perawatan, instalasi, dan bantuan teknisi dengan mudah dan bergaransi.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Beresin',
  },
  icons: {
    icon: '/icons/icon-192.png',
    apple: '/icons/apple-touch-icon.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#0284c7',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        {/* Anti-flash inline theme script */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const mode = localStorage.getItem('beresin_theme_mode') || 'system';
                const isDark = mode === 'dark' || (mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
                if (isDark) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch(e) {}
            `,
          }}
        />
      </head>
      <body className="antialiased selection:bg-sky-500/20 selection:text-sky-600 dark:selection:text-sky-400">
        <QueryProvider>
          <ThemeProvider>
            <AuthProvider>
              <CartProvider>
                <PwaProvider>
                  <AppShell>{children}</AppShell>
                </PwaProvider>
              </CartProvider>
            </AuthProvider>
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
