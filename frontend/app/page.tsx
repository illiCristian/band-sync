import { Song } from '@/types';
import HomeClient from '@/components/HomeClient';

export const revalidate = 0; // Desactivar cache para desarrollo y ver datos frescos

async function getSongs(): Promise<Song[]> {
  try {
    // In server components, we need to use the full URL for fetch
    // Use VERCEL_URL for production or localhost for development
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3000';

    const fetchUrl = `${baseUrl}/api/songs`;
    console.log('[SERVER] Fetching songs from:', fetchUrl);
    console.log('[SERVER] VERCEL_URL:', process.env.VERCEL_URL);

    const res = await fetch(fetchUrl, {
      next: { revalidate: 60 },
      cache: 'no-store' // Ensure fresh data
    });

    console.log('[SERVER] Response status:', res.status);

    if (!res.ok) {
      console.error("[SERVER] Backend fetch failed with status:", res.status);
      const text = await res.text();
      console.error("[SERVER] Response body:", text);
      return [];
    }

    const data = await res.json();
    console.log('[SERVER] Fetched songs count:', data.length);
    return data;
  } catch (err) {
    console.error("[SERVER] Failed to fetch songs on server:", err);
    return [];
  }
}

export default async function Home() {
  const songs = await getSongs();

  return <HomeClient initialSongs={songs} />;
}
