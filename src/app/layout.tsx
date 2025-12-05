import { Toaster } from '@/components/ui/toaster';
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://scanqr.com.br'),
  title: {
    default: 'ScanQR - Gerador de QR Code Dinâmico | Crie e Gerencie QR Codes',
    template: '%s | ScanQR',
  },
  description:
    'Crie QR Codes dinâmicos e gerencie seus links com facilidade. Acompanhe estatísticas em tempo real, use domínios customizados e tenha controle total sobre seus QR Codes. Planos gratuitos e profissionais disponíveis.',
  keywords: [
    'qr code',
    'gerador qr code',
    'qr code dinâmico',
    'criar qr code',
    'qr code grátis',
    'encurtador de url',
    'link personalizado',
    'domínio customizado',
    'analytics qr code',
  ],
  authors: [{ name: 'ScanQR' }],
  creator: 'ScanQR',
  publisher: 'ScanQR',
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://scanqr.com.br',
    title: 'ScanQR - Gerador de QR Code Dinâmico',
    description:
      'Crie QR Codes dinâmicos e gerencie seus links com facilidade. Acompanhe estatísticas em tempo real e use domínios customizados.',
    siteName: 'ScanQR',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'ScanQR - Gerador de QR Code Dinâmico',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ScanQR - Gerador de QR Code Dinâmico',
    description:
      'Crie QR Codes dinâmicos e gerencie seus links com facilidade. Acompanhe estatísticas em tempo real e use domínios customizados.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://scanqr.com.br',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
