import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import Nav from '@/components/Nav';
import { ThemeProvider } from '@/components/theme-provider';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'MQTT.d',
  description: 'Customizable MQTT-based sensor data dashboard',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const fontClass = `${geistSans.variable} ${geistMono.variable}`;
  return (
    <>
      <html lang="en" suppressHydrationWarning className={fontClass}>
        <head />
        <body className='bg-neutral'>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <div className="flex">
            <div className='h-screen sticky top-0'><Nav /></div>
            {children}
            </div>
          </ThemeProvider>
        </body>
      </html>
    </>
  )
}