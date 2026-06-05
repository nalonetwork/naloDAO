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
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}