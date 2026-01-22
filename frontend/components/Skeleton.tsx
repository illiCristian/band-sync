import React from "react";

interface SkeletonProps {
    className?: string;
}

export default function Skeleton({ className = "" }: SkeletonProps) {
    return (
        <div
            className={`bg-muted animate-pulse rounded-md ${className}`}
            aria-hidden="true"
        />
    );
}
