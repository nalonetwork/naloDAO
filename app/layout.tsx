import './globals.css';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'NaloDAO | Bioregional Resource Network',
  description: 'Decentralized permaculture logistics and direct settlement ledger nodes.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-[#06090c] text-slate-100 min-h-screen antialiased`}>
        
        {/* Subtle high-end tech ambient background light leak */}
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] right-[-5%] w-[50vw] h-[50vw] rounded-full bg-emerald-950/15 blur-[120px]" />
          <div className="absolute bottom-[-10%] left-[-5%] w-[40vw] h-[40vw] rounded-full bg-slate-900/40 blur-[100px]" />
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
          {children}
        </div>
      </body>
    </html>
  );
}