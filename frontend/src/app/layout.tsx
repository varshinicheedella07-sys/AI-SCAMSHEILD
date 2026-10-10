import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AI ScamShield | Open Innovation Threat Intelligence & Phishing Detector',
  description: 'Collective threat intelligence and AI-driven classification to detect and explain phishing messages, fraudulent payment requests, and scam URLs in real-time.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-shield-bg text-gray-100 antialiased selection:bg-cyan-500/30 selection:text-cyan-200">
        {children}
      </body>
    </html>
  );
}
