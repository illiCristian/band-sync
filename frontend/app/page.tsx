import { Song } from '@/types';
import HomeClient from '@/components/HomeClient';

export const revalidate = 0; // Desactivar cache para desarrollo y ver datos frescos

async function getSongs(): Promise<Song[]> {
  try {
    // We use the environment variable for the backend URL if available, else local 3001
    const backendUrl = process.env.BACKEND_URL || "http://localhost:3001";
    const res = await fetch(`${backendUrl}/songs`, {
      next: { revalidate: 60 }
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
  const songs = await getSongs();

  return <HomeClient initialSongs={songs} />;
}
