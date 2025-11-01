import React from 'react';
import { Inter } from 'next/font/google';
import { Providers } from "./providers";
import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter';
import ThemeRegistry from '../src/lib/platform/theme/ThemeRegistry';
import { auth } from "../auth";
import { Container } from '@mui/material';
import MyAppBar from '../components/MyAppBar';
import MyFooter from '../components/MyFooter';
import Box from '@mui/material/Box';
import { generateStructuredData, generateKeywords } from '../lib/seo/generateMetadata';
import GoogleAnalytics from '../components/GoogleAnalytics';

const inter = Inter({ subsets: ['latin'] });

// Generate metadata dynamically from markdown files
export async function generateMetadata() {
  const keywords = generateKeywords();

  return {
    title: 'Lorenzo Bazzani - Cloud Infrastructure & Generative AI Consultant',
    description: 'Lorenzo Bazzani - Independent Consultant specializing in Cloud Infrastructure, Generative AI, and Enterprise Software Solutions. Over 20 years of experience in project management and technical leadership.',
    keywords,
    authors: [{ name: 'Lorenzo Bazzani' }],
    creator: 'Lorenzo Bazzani',
    publisher: 'Lorenzo Bazzani',
    metadataBase: new URL('https://bazzani.info'),
    alternates: {
      canonical: '/',
    },
    viewport: {
      width: 'device-width',
      initialScale: 1,
      maximumScale: 1,
      userScalable: false,
    },
    appleWebApp: {
      capable: true,
      statusBarStyle: 'default',
      title: 'Lorenzo Bazzani',
    },
    openGraph: {
      type: 'profile',
      locale: 'en_US',
      url: 'https://bazzani.info',
      title: 'Lorenzo Bazzani - Cloud Infrastructure & Generative AI Consultant',
      description: 'Independent Consultant specializing in Cloud Infrastructure, Generative AI, and Enterprise Software Solutions. Over 20 years of experience in project management and technical leadership.',
      siteName: 'Lorenzo Bazzani',
      images: [
        {
          url: 'https://bazzani.info/img/foto.jpeg',
          width: 800,
          height: 800,
          alt: 'Lorenzo Bazzani',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Lorenzo Bazzani - Cloud Infrastructure & Generative AI Consultant',
      description: 'Independent Consultant specializing in Cloud Infrastructure, Generative AI, and Enterprise Software Solutions.',
      images: ['https://bazzani.info/img/foto.jpeg'],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    verification: {
      google: 'G-ZMNVX8WZV5',
    },
  };
}

interface RootLayoutProps {
  children: React.ReactNode;
}

export default async function RootLayout({ children }: RootLayoutProps) {
  const session = await auth();

  // Generate structured data dynamically from markdown files
  const structuredData = generateStructuredData();

  return (
    <html lang="en">
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="theme-color" content="#ffffff" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <ThemeRegistry options={{ key: 'mui-theme' }}>
        <Providers session={session}>
          <AppRouterCacheProvider>
            <body className={inter.className} style={{ backgroundColor: '#f8f9fa' }}>
              <GoogleAnalytics />
              <main style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                <MyAppBar />
                <Box sx={{ display: { xs: 'none', md: 'block' }, height: '16px' }} />
                <Container
                  sx={{
                    minHeight: '500px',
                    flex: 1,
                    py: { xs: 0, md: 3 },
                    px: { xs: 0.25, sm: 2, md: 3 },
                  }}
                >
                  {children}
                </Container>
                <MyFooter />
              </main>
            </body>
          </AppRouterCacheProvider>
        </Providers>
      </ThemeRegistry>
    </html>
  );
}
