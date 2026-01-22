import React from "react";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
    icon: LucideIcon;
    title: string;
    description: string;
    action?: React.ReactNode;
    className?: string;
}

export default function EmptyState({
    icon: Icon,
    title,
    description,
    action,
    className = ""
}: EmptyStateProps) {
    return (
        <div className={`flex flex-col items-center justify-center py-16 px-6 bg-card rounded-3xl border border-border text-center ${className}`}>
            <div className="p-4 bg-primary/10 text-primary rounded-full mb-4">
                <Icon size={40} />
            </div>
            <h3 className="text-xl font-black text-card-foreground mb-2">{title}</h3>
            <p className="text-muted-foreground max-w-xs mx-auto mb-6">{description}</p>
            {action && (
                <div className="animate-in fade-in zoom-in duration-300">
                    {action}
                </div>
            )}
        </div>
    );
}
