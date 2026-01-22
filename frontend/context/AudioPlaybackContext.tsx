'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

interface AudioPlaybackContextType {
    activeAudioId: string | null;
    playAudio: (id: string) => void;
    stopAudio: (id: string) => void;
}

const AudioPlaybackContext = createContext<AudioPlaybackContextType | undefined>(undefined);

export const AudioPlaybackProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [activeAudioId, setActiveAudioId] = useState<string | null>(null);

    const playAudio = useCallback((id: string) => {
        setActiveAudioId(id);
    }, []);

    const stopAudio = useCallback((id: string) => {
        setActiveAudioId(prev => prev === id ? null : prev);
    }, []);

    return (
        <AudioPlaybackContext.Provider value={{ activeAudioId, playAudio, stopAudio }}>
            {children}
        </AudioPlaybackContext.Provider>
    );
};

export const useAudioPlayback = () => {
    const context = useContext(AudioPlaybackContext);
    if (context === undefined) {
        throw new Error('useAudioPlayback must be used within an AudioPlaybackProvider');
    }
    return context;
};
