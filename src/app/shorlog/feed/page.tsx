import type { Metadata } from 'next';
import ShorlogFeedPageClient from '../../components/shorlog/feed/ShorlogFeedPageClient';

export const metadata: Metadata = {
  title: 'TexTok',
};

export default function ShorlogFeedPage() {
  return (
    <>
      <ShorlogFeedPageClient />
    </>
  );
}
