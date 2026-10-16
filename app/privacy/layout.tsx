import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy & Saved Greeting Links | Greetlo',
  description: 'Manage saved greeting links, local drafts and analytics preferences. Learn how Greetlo handles your messages and photos.',
  robots: { index: false, follow: true },
};

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
