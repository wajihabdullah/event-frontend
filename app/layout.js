import './globals.css';

export const metadata = {
  title: 'EventHub',
  description: 'A simple event management system',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
