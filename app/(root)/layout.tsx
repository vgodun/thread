import '../global.css'
import React from 'react';
import { Inter } from 'next/font/google'
import { ClerkProvider } from "@clerk/nextjs";
import Topbar from "@/components/shared/Topbar";
import Bottombar from "@/components/shared/Bottombar";
import LeftSidebar from "@/components/shared/LeftSidebar";
import { WebsocketProvider } from '@/context/WebsocketContext';

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Threads',
  description: 'A Next.js 13 Meta Threads Application',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en">
      <WebsocketProvider>
        <body className={inter.className}>
          <Topbar />
          <main className='flex flex-row'>
            <LeftSidebar />
            <section className='main-container'>
              <div className='w-full max-w-4xl '>
                {children}
              </div>
            </section>
          </main>
          <Bottombar />
        </body>
      </WebsocketProvider>
      </html>
    </ClerkProvider>
  )
}
