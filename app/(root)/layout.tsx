import '../global.css'
import React from 'react';
import { ClerkProvider } from "@clerk/nextjs";
import Topbar from "@/components/shared/Topbar";
import Bottombar from "@/components/shared/Bottombar";
import LeftSidebar from "@/components/shared/LeftSidebar";
import { Toaster } from 'react-hot-toast';
import { RealtimeProvider } from '@/components/providers/PusherProvider';

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
        <body>
          <RealtimeProvider>
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
            <Toaster position="top-center" toastOptions={{
              style: {
                background: '#333',
                color: '#fff',
              },
              success: {
                duration: 3000,
              },
              error: {
                duration: 5000,
              }
            }} />
          </RealtimeProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
