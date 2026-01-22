"use client";

import React, { useEffect, useRef } from 'react';

interface SpectrumVisualizerProps {
    analyser: AnalyserNode | null;
    isPaused: boolean;
}

export default function SpectrumVisualizer({ analyser, isPaused }: SpectrumVisualizerProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number | null>(null);

    useEffect(() => {
        if (!canvasRef.current || !analyser) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const draw = () => {
            animationRef.current = requestAnimationFrame(draw);

            if (isPaused) {
                // Decay simulation when paused
                for (let i = 0; i < dataArray.length; i++) {
                    dataArray[i] = Math.max(0, dataArray[i] - 5);
                }
            } else {
                analyser.getByteFrequencyData(dataArray);
            }

            const width = canvas.width;
            const height = canvas.height;

            ctx.clearRect(0, 0, width, height);

            const barCount = 48; // More bars for smoother look
            const barWidth = (width / barCount);
            let x = 0;

            for (let i = 0; i < barCount; i++) {
                const index = Math.floor(i * (bufferLength / barCount / 2));
                const targetBarHeight = (dataArray[index] / 255) * height;

                // Smoother rainbow effect with time-based shifting
                const hue = (i * (360 / barCount)) + (Date.now() / 100) % 360;

                const gradient = ctx.createLinearGradient(0, height, 0, height - targetBarHeight);
                gradient.addColorStop(0, `hsla(${hue}, 80%, 50%, 0.8)`);
                gradient.addColorStop(1, `hsla(${hue}, 80%, 50%, 0.2)`);

                ctx.fillStyle = gradient;

                // Draw smooth rounded bars
                const finalHeight = targetBarHeight;
                const radius = 2;

                ctx.beginPath();
                ctx.roundRect(x + 1, height - finalHeight, barWidth - 2, finalHeight, [radius, radius, 0, 0]);
                ctx.fill();

                x += barWidth;
            }
        };

        draw();

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [analyser, isPaused]);

    return (
        <canvas
            ref={canvasRef}
            width={800}
            height={160}
            className="w-full h-[80px] sm:h-[100px] bg-transparent rounded-lg"
        />
    );
}
