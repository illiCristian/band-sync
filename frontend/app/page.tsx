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

    const res = await fetch(`${baseUrl}/api/songs`, {
      next: { revalidate: 60 },
      cache: 'no-store' // Ensure fresh data
    });

    if (!res.ok) {
      console.error("Backend fetch failed with status:", res.status);
      return [];
    }
    return res.json();
  } catch (err) {
    console.error("Failed to fetch songs on server:", err);
    return [];
  }
}

export default async function Home() {
  const allSongs = await getSongs();

  // Filter to show only "active" songs (not in IDEA status)
  const activeSongs = allSongs.filter(song =>
    song.status !== 'IDEA' && song.recordings && song.recordings.length > 0
  );

  return <HomeClient initialSongs={activeSongs} />;
}
