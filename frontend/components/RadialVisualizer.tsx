"use client";

import React, { useEffect, useRef } from 'react';

interface RadialVisualizerProps {
    analyser: AnalyserNode | null;
    isPaused: boolean;
}

export default function RadialVisualizer({ analyser, isPaused }: RadialVisualizerProps) {
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
                for (let i = 0; i < dataArray.length; i++) {
                    dataArray[i] = Math.max(0, dataArray[i] - 2);
                }
            } else {
                analyser.getByteFrequencyData(dataArray);
            }

            const width = canvas.width;
            const height = canvas.height;
            const centerX = width / 2;
            const centerY = height / 2;
            const radius = Math.min(centerX, centerY) * 0.4;

            ctx.clearRect(0, 0, width, height);

            // Draw center pulse
            const avg = dataArray.reduce((a, b) => a + b, 0) / bufferLength;
            const pulse = (avg / 255) * 20;

            ctx.beginPath();
            ctx.arc(centerX, centerY, radius + pulse, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(99, 102, 241, 0.2)`;
            ctx.lineWidth = 2;
            ctx.stroke();

            const barCount = 64;
            const angleStep = (Math.PI * 2) / barCount;

            for (let i = 0; i < barCount; i++) {
                const index = Math.floor(i * (bufferLength / barCount / 2));
                const barHeight = (dataArray[index] / 255) * (radius * 0.8);

                const angle = i * angleStep;
                const cos = Math.cos(angle);
                const sin = Math.sin(angle);

                const x1 = centerX + cos * radius;
                const y1 = centerY + sin * radius;
                const x2 = centerX + cos * (radius + barHeight + pulse);
                const y2 = centerY + sin * (radius + barHeight + pulse);

                const hue = (i * (360 / barCount)) + (Date.now() / 50) % 360;
                ctx.strokeStyle = `hsl(${hue}, 80%, 60%)`;
                ctx.lineWidth = 3;
                ctx.lineCap = 'round';

                ctx.beginPath();
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.stroke();
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
            height={200}
            className="w-full h-[150px] sm:h-[180px] bg-transparent rounded-lg"
        />
    );
}
