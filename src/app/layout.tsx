import type { Metadata } from 'next';
import './globals.css';
import { GLProvider } from '@/context/GLContext';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';

export const metadata: Metadata = {
  title: 'BokiApp - 財務会計',
  description: 'Financial Accounting - General Ledger',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>
        <GLProvider>
          <div className="flex flex-col h-screen overflow-hidden">
            <TopBar />
            <div className="flex flex-1 overflow-hidden">
              <Sidebar />
              <main className="flex-1 overflow-auto bg-[#f5f6f7]">
                {children}
              </main>
            </div>
          </div>
        </GLProvider>
      </body>
    </html>
  );
}
