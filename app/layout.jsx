import React from 'react'
import { Inter } from 'next/font/google'
import {Providers} from "./providers";
import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter';
import ThemeRegistry from '@/src/lib/platform/theme/ThemeRegistry'
import { auth } from "@/auth"
import { Container } from '@mui/material';
import MyAppBar from '@/components/MyAppBar';
import MyFooter from '@/components/MyFooter';
import Box from '@mui/material/Box';



const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Lorenzo Bazzani',
  description: 'Lorenzo Bazzani - Profile',
}


export default async function RootLayout({children, params}) {

  const session = await auth();

  return (
    

    <ThemeRegistry options={{ key: 'mui-theme' }} >
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-ZMNVX8WZV5"></script>
    <Providers session={session}>
      
      <AppRouterCacheProvider>

        <html lang="en">            
          <body className={inter.className}>
          <main>
            <MyAppBar/>
            <Box sx={{ height: '20px' }} />
            <Container sx={{minHeight: '500px'}}>
                  {children}
            </Container>
            <MyFooter/>
          </main>
          </body>
        </html>

      </AppRouterCacheProvider>
    </Providers>
    </ThemeRegistry >
  )
}
