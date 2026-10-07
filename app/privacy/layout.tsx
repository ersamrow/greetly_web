import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy & Saved Greeting Links | Greetly',
  description: 'Manage saved greeting links, local drafts and analytics preferences. Learn how Greetly handles your messages and photos.',
  robots: { index: false, follow: true },
};

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
