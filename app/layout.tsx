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

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Lorenzo Bazzani - Cloud Infrastructure & Generative AI Consultant',
  description: 'Lorenzo Bazzani - Independent Consultant specializing in Cloud Infrastructure, Generative AI, and Enterprise Software Solutions. Over 20 years of experience in project management and technical leadership.',
  keywords: 'Lorenzo Bazzani, Cloud Infrastructure, Generative AI, Software Engineering, Project Management, Technical Leadership',
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default async function RootLayout({ children }: RootLayoutProps) {
  const session = await auth();

  return (
    <html lang="en">
      <head>
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-ZMNVX8WZV5"></script>
      </head>
      <ThemeRegistry options={{ key: 'mui-theme' }}>
        <Providers session={session}>
          <AppRouterCacheProvider>
            <body className={inter.className} style={{ backgroundColor: '#f8f9fa' }}>
              <main style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                <MyAppBar />
                <Box sx={{ height: '20px' }} />
                <Container
                  sx={{
                    minHeight: '500px',
                    flex: 1,
                    py: { xs: 3, md: 5 },
                    px: { xs: 2, sm: 3, md: 4 },
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
