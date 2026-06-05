import './globals.css';

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
      <body className="bg-[#0c1115] text-slate-200 min-h-screen antialiased">
        <div className="max-w-6xl mx-auto px-4 py-8">
          {children}
        </div>
      </body>
    </html>
  );
}