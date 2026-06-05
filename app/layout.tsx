import './globals.css';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'NaloDAO | Regional Ecosystem Registry',
  description: 'Decentralized infrastructure rewarding bioregional regeneration.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-[#0c1115] text-slate-200 min-h-screen antialiased`}>
        <main className="py-6 px-4">
          {children}
        </main>
      </body>
    </html>
  );
}