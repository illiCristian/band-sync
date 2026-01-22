'use client';

import { useEffect, useRef, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';
import { Comment } from '@/types';
import { Play, Pause, ListMusic, Sparkles, Settings2, BarChart3, Activity, RotateCcw, RotateCw, Orbit } from 'lucide-react';
import SpectrumVisualizer from './SpectrumVisualizer';
import RadialVisualizer from './RadialVisualizer';
import { useAudioPlayback } from '@/context/AudioPlaybackContext';

interface AudioPlayerProps {
    url: string;
    comments: Comment[];
    onTimeUpdate?: (time: number) => void;
}

export default function AudioPlayer({ url, comments, onTimeUpdate }: AudioPlayerProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const wavesurfer = useRef<WaveSurfer | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [mounted, setMounted] = useState(false);
    const [animationsEnabled, setAnimationsEnabled] = useState(true);
    const [viewMode, setViewMode] = useState<'waveform' | 'spectrum' | 'radial'>('waveform');
    const { activeAudioId, playAudio } = useAudioPlayback();
    const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);

    useEffect(() => {
        setMounted(true);
        const savedAnims = localStorage.getItem('playerAnimations');
        if (savedAnims !== null) {
            setAnimationsEnabled(savedAnims === 'true');
        }
        const savedView = localStorage.getItem('playerViewMode') as 'waveform' | 'spectrum';
        if (savedView) {
            setViewMode(savedView);
        }
    }, []);

    const toggleAnimations = () => {
        const newValue = !animationsEnabled;
        setAnimationsEnabled(newValue);
        localStorage.setItem('playerAnimations', String(newValue));
    };

    const toggleViewMode = () => {
        let newMode: 'waveform' | 'spectrum' | 'radial';
        if (viewMode === 'waveform') newMode = 'spectrum';
        else if (viewMode === 'spectrum') newMode = 'radial';
        else newMode = 'waveform';

        setViewMode(newMode);
        localStorage.setItem('playerViewMode', newMode);
    };

    // Global playback logic
    useEffect(() => {
        if (activeAudioId && activeAudioId !== url && isPlaying) {
            wavesurfer.current?.pause();
            setIsPlaying(false);
        }
    }, [activeAudioId, url, isPlaying]);

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

        // Web Audio integration for visualizer
        const handlePlay = () => {
            if (wavesurfer.current && !analyser && !audioContextRef.current) {
                const media = wavesurfer.current.getMediaElement();
                if (media) {
                    try {
                        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
                        const audioContext = new AudioContext();
                        audioContextRef.current = audioContext;

                        const newAnalyser = audioContext.createAnalyser();
                        newAnalyser.fftSize = 256;

                        const source = audioContext.createMediaElementSource(media);
                        source.connect(newAnalyser);
                        newAnalyser.connect(audioContext.destination);
                        setAnalyser(newAnalyser);
                    } catch (e) {
                        console.error("Failed to initialize audio analyser:", e);
                    }
                }
            }
        };

        wavesurfer.current.on('play', handlePlay);

        wavesurfer.current.on('timeupdate', (time) => {
            setCurrentTime(time);
            onTimeUpdate?.(time);
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
            if (!isPlaying) {
                playAudio(url);
            }
            wavesurfer.current.playPause();
            setIsPlaying(!isPlaying);
        }
    };

    const seekRelative = (seconds: number) => {
        if (wavesurfer.current) {
            const currentTime = wavesurfer.current.getCurrentTime();
            wavesurfer.current.setTime(currentTime + seconds);
        }
    };

    const seekTo = (time: number) => {
        if (wavesurfer.current) {
            wavesurfer.current.setTime(time);
        }
    }

    return (
        <div className={`mx-auto w-full max-w-[900px] transition-all duration-700 ${animationsEnabled && isPlaying ? 'p-1.5' : 'p-0'}`}>
            <div className={`bg-card rounded-2xl shadow-xl overflow-hidden border border-border transition-all duration-500 relative ${animationsEnabled && isPlaying ? 'shadow-primary/20 ring-1 ring-primary/20 scale-[1.01]' : ''
                }`}>
                {/* Visualizer Background Animation */}
                {animationsEnabled && isPlaying && (
                    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
                        <div className="absolute top-0 -left-1/4 w-1/2 h-full bg-gradient-to-r from-transparent via-primary/30 to-transparent animate-shimmer" />
                    </div>
                )}

                <div className="p-4 sm:p-6 lg:p-8">
                    {/* Compact Container for visualizer on mobile */}
                    <div className="max-w-[420px] sm:max-w-none mx-auto mb-6 relative group">
                        <div className={`bg-secondary/30 rounded-xl p-3 sm:p-4 transition-all duration-500 overflow-hidden ${animationsEnabled && isPlaying ? 'bg-secondary/50 shadow-inner' : ''
                            } ${viewMode === 'waveform' ? 'block' : 'hidden'}`} ref={containerRef} />

                        {viewMode === 'spectrum' && (
                            <div className={`bg-secondary/30 rounded-xl p-3 sm:p-4 transition-all duration-500 ${animationsEnabled && isPlaying ? 'bg-secondary/50 shadow-inner' : ''
                                }`}>
                                <SpectrumVisualizer analyser={analyser} isPaused={!isPlaying} />
                            </div>
                        )}

                        {viewMode === 'radial' && (
                            <div className={`bg-secondary/30 rounded-xl p-3 sm:p-4 transition-all duration-500 ${animationsEnabled && isPlaying ? 'bg-secondary/50 shadow-inner' : ''
                                }`}>
                                <RadialVisualizer analyser={analyser} isPaused={!isPlaying} />
                            </div>
                        )}

                        {/* Seek Controls Overlay */}
                        <div className="absolute inset-0 flex items-center justify-between px-4 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                            <button
                                onClick={(e) => { e.stopPropagation(); seekRelative(-10); }}
                                className="p-3 bg-black/40 hover:bg-black/60 rounded-full text-white backdrop-blur-sm pointer-events-auto transition-transform hover:scale-110 active:scale-90"
                                title="Retroceder 10s"
                            >
                                <RotateCcw size={20} />
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); seekRelative(10); }}
                                className="p-3 bg-black/40 hover:bg-black/60 rounded-full text-white backdrop-blur-sm pointer-events-auto transition-transform hover:scale-110 active:scale-90"
                                title="Adelantar 10s"
                            >
                                <RotateCw size={20} />
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-6 max-w-[420px] sm:max-w-none mx-auto">
                        <div className="flex items-center gap-4 sm:gap-6">
                            <div className="relative">
                                <button
                                    onClick={togglePlayPause}
                                    className="w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center bg-primary rounded-2xl text-primary-foreground hover:bg-primary/90 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/25 z-10 relative"
                                >
                                    {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
                                </button>

                                {/* Pulse Effect */}
                                {animationsEnabled && isPlaying && (
                                    <div className="absolute inset-0 bg-primary/40 rounded-2xl animate-ping scale-110 opacity-75 pointer-events-none" />
                                )}
                            </div>

                            <div className="flex flex-col">
                                <div className="flex items-center gap-2">
                                    <span className="text-xl sm:text-3xl font-bold text-foreground font-mono tracking-tighter">
                                        {Math.floor(currentTime / 60)}:{(Math.floor(currentTime) % 60).toString().padStart(2, '0')}
                                    </span>
                                    {isPlaying && animationsEnabled && (
                                        <div className="flex items-end gap-[2px] h-3 mb-1 ml-1">
                                            <div className="w-[3px] bg-primary animate-eq-1 h-full rounded-full" />
                                            <div className="w-[3px] bg-primary animate-eq-2 h-full rounded-full" />
                                            <div className="w-[3px] bg-primary animate-eq-3 h-full rounded-full" />
                                        </div>
                                    )}
                                </div>
                                <span className="text-[10px] uppercase tracking-widest font-black text-muted-foreground">Posición</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <ListMusic size={18} />
                                <span className="text-sm font-bold">{comments.length} notas</span>
                            </div>

                            {/* Visualization Mode Toggle */}
                            <button
                                onClick={toggleViewMode}
                                title={viewMode === 'waveform' ? "Ver Espectro" : viewMode === 'spectrum' ? "Ver Radial" : "Ver Forma de Onda"}
                                className={`p-2 rounded-xl border flex items-center gap-2 transition-all active:scale-90 ${viewMode !== 'waveform'
                                    ? 'bg-primary/10 border-primary/30 text-primary shadow-sm'
                                    : 'bg-muted border-border text-muted-foreground hover:border-primary/50 hover:text-primary'
                                    }`}
                            >
                                {viewMode === 'waveform' ? <Activity size={16} /> : viewMode === 'spectrum' ? <BarChart3 size={16} /> : <Orbit size={16} />}
                            </button>

                            {/* Animation Toggle */}
                            <button
                                onClick={toggleAnimations}
                                title={animationsEnabled ? "Desactivar animaciones" : "Activar animaciones"}
                                className={`p-2 rounded-xl border flex items-center gap-2 transition-all active:scale-90 ${animationsEnabled
                                    ? 'bg-primary/10 border-primary/20 text-primary'
                                    : 'bg-muted border-border text-muted-foreground'
                                    }`}
                            >
                                <Sparkles size={16} className={animationsEnabled && isPlaying ? 'animate-pulse' : ''} />
                            </button>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h3 className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em] px-1">Comentarios en Línea de Tiempo</h3>
                        <div className="max-h-52 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                            {comments.map((comment) => (
                                <button
                                    key={comment.id}
                                    onClick={() => seekTo(comment.timestampSeconds)}
                                    className="w-full text-left p-3 bg-card hover:bg-muted/50 rounded-xl transition-all group border border-transparent hover:border-border"
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="font-bold text-foreground text-sm group-hover:text-primary">{comment.authorName}</span>
                                        <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-md">
                                            {Math.floor(comment.timestampSeconds / 60)}:{(Math.floor(comment.timestampSeconds) % 60).toString().padStart(2, '0')}
                                        </span>
                                    </div>
                                    <p className="text-muted-foreground text-sm line-clamp-2 leading-snug">{comment.text}</p>
                                </button>
                            ))}
                            {comments.length === 0 && (
                                <div className="text-center py-6 text-muted-foreground text-sm italic border-2 border-dashed border-border rounded-xl">
                                    No hay comentarios todavía.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <style jsx>{`
              @keyframes shimmer {
                0% { transform: translateX(-100%); }
                100% { transform: translateX(200%); }
              }
              
              @keyframes eq-1 {
                0%, 100% { height: 40%; }
                50% { height: 100%; }
              }
              @keyframes eq-2 {
                0%, 100% { height: 70%; }
                50% { height: 30%; }
              }
              @keyframes eq-3 {
                0%, 100% { height: 30%; }
                50% { height: 80%; }
              }

              .animate-shimmer {
                animation: shimmer 3s infinite linear;
              }
              .animate-eq-1 { animation: eq-1 0.6s infinite ease-in-out; }
              .animate-eq-2 { animation: eq-2 0.8s infinite ease-in-out; }
              .animate-eq-3 { animation: eq-3 0.7s infinite ease-in-out; }

              @media (prefers-reduced-motion: reduce) {
                .animate-shimmer, .animate-ping, .animate-eq-1, .animate-eq-2, .animate-eq-3, .animate-pulse {
                  animation: none !important;
                }
              }

              .custom-scrollbar::-webkit-scrollbar {
                width: 4px;
              }
              .custom-scrollbar::-webkit-scrollbar-track {
                background: transparent;
              }
              .custom-scrollbar::-webkit-scrollbar-thumb {
                background: var(--muted);
                border-radius: 10px;
              }
            `}</style>
            </div>
        </div>
    );
}
