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
    <html lang="en" className={`${inter.variable} ${serif.variable}`}>
      <body className="bg-stone-100 text-slate-900 min-h-screen antialiased selection:bg-emerald-200">
        {/* Soft ecological background glow nodes */}
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none opacity-40">
          <div className="absolute -top-[40%] -left-[20%] w-[80vw] h-[80vw] rounded-full bg-emerald-200/50 blur-[120px]" />
          <div className="absolute -bottom-[20%] -right-[10%] w-[60vw] h-[60vw] rounded-full bg-teal-200/40 blur-[100px]" />
        </div>
        
        <main className="relative z-10 py-6 px-4">
          {children}
        </main>
      </body>
    </html>
  );
}