import { Song } from '@/types';
import HomeClient from '@/components/HomeClient';

export const revalidate = 0; // Desactivar cache para desarrollo y ver datos frescos

async function getSongs(): Promise<Song[]> {
  try {
    // In server components, fetch directly from backend to avoid Vercel auth issues
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
    const fetchUrl = `${backendUrl}/api/songs`;

    console.log('[SERVER] Fetching songs from:', fetchUrl);

    const res = await fetch(fetchUrl, {
      cache: 'no-store' // Ensure fresh data
    });

    console.log('[SERVER] Response status:', res.status);

    if (!res.ok) {
      console.error("[SERVER] Backend fetch failed with status:", res.status);
      const text = await res.text();
      console.error("[SERVER] Response body:", text.substring(0, 200));
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
