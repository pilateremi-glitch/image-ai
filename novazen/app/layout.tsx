import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' });

export const metadata: Metadata = {
  title: 'Sweet Sent | Bien-être & Lifestyle Premium',
  description: 'Découvrez notre sélection de produits bien-être, relaxation et lifestyle tendance. Livraison rapide, paiement sécurisé.',
  keywords: 'bien-être, relaxation, massage, fitness, lifestyle, gadgets tendance, TikTok',
  openGraph: {
    title: 'Sweet Sent | Bien-être & Lifestyle Premium',
    description: 'Votre boutique bien-être premium. Produits tendance, livraison rapide.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={`${inter.variable} ${playfair.variable}`}>
      <body className="bg-dark text-white">
        <Navbar />
        <CartDrawer />
        <main>{children}</main>
        <Footer />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#141414',
              color: '#fff',
              border: '1px solid rgba(201,168,76,0.3)',
            },
            success: {
              iconTheme: { primary: '#c9a84c', secondary: '#0a0a0a' },
            },
          }}
        />
      </body>
    </html>
  );
}
