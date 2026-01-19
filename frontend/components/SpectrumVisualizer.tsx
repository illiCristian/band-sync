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

            const barCount = 32;
            const barWidth = (width / barCount) - 2;
            let x = 0;

            // Retro block style
            const blockHeight = 4;
            const blockGap = 2;

            for (let i = 0; i < barCount; i++) {
                // Map frequency data to limited bar count
                const index = Math.floor(i * (bufferLength / barCount / 2));
                let barHeight = (dataArray[index] / 255) * height;

                // Round to nearest block
                barHeight = Math.floor(barHeight / (blockHeight + blockGap)) * (blockHeight + blockGap);

                const colorStep = 360 / barCount;
                const hue = i * colorStep;

                // For rainbow effect similar to the requested image
                ctx.fillStyle = `hsl(${hue}, 80%, 50%)`;

                // Draw blocks
                for (let y = height; y > height - barHeight; y -= (blockHeight + blockGap)) {
                    ctx.fillRect(x, y - blockHeight, barWidth, blockHeight);
                }

                x += barWidth + 2;
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
