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
      <body className="bg-gray-950 text-slate-100 antialiased min-h-screen">
        <div className="w-full max-w-6xl mx-auto px-4 py-6">
          {children}
        </div>
      </body>
    </html>
  );
}