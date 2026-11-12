import './globals.css';
import type { Metadata } from 'next';
export const metadata: Metadata = {
  title: 'Cross-Market Financial Sentiment Research',
  description: 'Read-only research dashboard for Korean financial news sentiment and Swiss SMI direction experiments.'
};
export default function RootLayout({children}:{children:React.ReactNode}) {
  return <html lang="en"><body>{children}</body></html>;
}
