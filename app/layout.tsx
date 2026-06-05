import './globals.css';

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
      <body className="antialiased min-h-screen selection:bg-emerald-500/20 selection:text-emerald-300">
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-6">
          {children}
        </div>
      </body>
    </html>
  );
}