import './globals.css';
import { Inter, DM_Serif_Display } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const serif = DM_Serif_Display({ weight: '400', subsets: ['latin'], variable: '--font-serif' });

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
    <html lang="en" className={`dark ${inter.variable} ${serif.variable}`}>
      <body className="bg-[#0b0f12] text-slate-200 font-sans min-h-screen antialiased selection:bg-emerald-500/20">
        
        {/* Soft background glow nodes */}
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full bg-emerald-950/10 blur-[120px]" />
          <div className="absolute bottom-10 right-1/4 w-[400px] h-[400px] rounded-full bg-teal-950/10 blur-[100px]" />
        </div>
        
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </body>
    </html>
  );
}