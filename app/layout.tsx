import './globals.css';
import { Inter, DM_Serif_Display } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const serif = DM_Serif_Display({ weight: '400', subsets: ['latin'], variable: '--font-serif' });

export const metadata = {
  title: 'NaloDAO | Regional Ecosystem Registry',
  description: 'Decentralized infrastructure rewarding bioregional regeneration and fair-share resource coordination.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`dark ${inter.variable} ${serif.variable}`}>
      <body className="bg-[#05080a] text-slate-200 min-h-screen antialiased selection:bg-emerald-500/30">
        
        {/* Sleek, deep Web3 ambient environmental gradient glows */}
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-emerald-950/20 blur-[150px]" />
          <div className="absolute bottom-[10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-teal-950/10 blur-[130px]" />
        </div>
        
        <main className="relative z-10 py-8 px-4 max-w-7xl mx-auto">
          {children}
        </main>
      </body>
    </html>
  );
}