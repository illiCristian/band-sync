'use client';

import { useEffect, useRef, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';
import { Comment } from '@/types';
import { Play, Pause, ListMusic } from 'lucide-react';

interface AudioPlayerProps {
    url: string;
    comments: Comment[];
}

export default function AudioPlayer({ url, comments }: AudioPlayerProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const wavesurfer = useRef<WaveSurfer | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!containerRef.current || !mounted) return;

        wavesurfer.current = WaveSurfer.create({
            container: containerRef.current,
            waveColor: '#6366f1',
            progressColor: '#4f46e5',
            cursorColor: '#818cf8',
            barWidth: 3,
            barGap: 3,
            barRadius: 4,
            height: 80,
            normalize: true,
        });

        wavesurfer.current.load(url);

        wavesurfer.current.on('timeupdate', (time) => {
            setCurrentTime(time);
        });

        wavesurfer.current.on('finish', () => {
            setIsPlaying(false);
        });

        return () => {
            wavesurfer.current?.destroy();
        };
    }, [url, mounted]);

    const togglePlayPause = () => {
        if (wavesurfer.current) {
            wavesurfer.current.playPause();
            setIsPlaying(!isPlaying);
        }
    };

    const seekTo = (time: number) => {
        if (wavesurfer.current) {
            wavesurfer.current.setTime(time);
        }
    }

    return (
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-800 transition-all">
            <div className="p-6">
                <div className="mb-6 bg-gray-50/50 dark:bg-gray-800/30 rounded-xl p-4" ref={containerRef} />

                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-6">
                        <button
                            onClick={togglePlayPause}
                            className="w-14 h-14 flex items-center justify-center bg-indigo-600 rounded-2xl text-white hover:bg-indigo-700 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20"
                        >
                            {isPlaying ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" className="ml-1" />}
                        </button>

                        <div className="flex flex-col">
                            <span className="text-2xl font-bold text-gray-900 dark:text-white font-mono tracking-tighter">
                                {Math.floor(currentTime / 60)}:{(Math.floor(currentTime) % 60).toString().padStart(2, '0')}
                            </span>
                            <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Tiempo Actual</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 text-gray-400">
                        <ListMusic size={20} />
                        <span className="text-sm font-medium">{comments.length} Comentarios</span>
                    </div>
                </div>

                <div className="space-y-3">
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] px-1">Comentarios en Línea de Tiempo</h3>
                    <div className="max-h-52 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                        {comments.map((comment) => (
                            <button
                                key={comment.id}
                                onClick={() => seekTo(comment.timestampSeconds)}
                                className="w-full text-left p-3 bg-gray-50 dark:bg-gray-800/50 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl transition-all group border border-transparent hover:border-indigo-100 dark:hover:border-indigo-800"
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <span className="font-bold text-gray-700 dark:text-gray-200 text-sm group-hover:text-indigo-600 dark:group-hover:text-indigo-400">{comment.authorName}</span>
                                    <span className="text-[10px] font-bold bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300 px-2 py-0.5 rounded-md">
                                        {Math.floor(comment.timestampSeconds / 60)}:{(Math.floor(comment.timestampSeconds) % 60).toString().padStart(2, '0')}
                                    </span>
                                </div>
                                <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 leading-snug">{comment.text}</p>
                            </button>
                        ))}
                        {comments.length === 0 && (
                            <div className="text-center py-6 text-gray-400 text-sm italic border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-xl">
                                No hay comentarios todavía.
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style jsx>{`
              .custom-scrollbar::-webkit-scrollbar {
                width: 4px;
              }
              .custom-scrollbar::-webkit-scrollbar-track {
                background: transparent;
              }
              .custom-scrollbar::-webkit-scrollbar-thumb {
                background: #e2e8f0;
                border-radius: 10px;
              }
              .dark .custom-scrollbar::-webkit-scrollbar-thumb {
                background: #1e293b;
              }
            `}</style>
        </div>
    );
}
