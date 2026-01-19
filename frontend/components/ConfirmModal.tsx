"use client";

import React from 'react';
import { AlertCircle, X } from 'lucide-react';

interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning' | 'info';
}

export default function ConfirmModal({
    isOpen,
    title,
    message,
    onConfirm,
    onCancel,
    confirmText = "Confirmar",
    cancelText = "Cancelar",
    variant = 'danger'
}: ConfirmModalProps) {
    if (!isOpen) return null;

    const variantStyles = {
        danger: {
            icon: <AlertCircle className="text-destructive" size={24} />,
            button: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
            bg: "bg-destructive/10"
        },
        warning: {
            icon: <AlertCircle className="text-yellow-500" size={24} />,
            button: "bg-yellow-600 text-white hover:bg-yellow-700",
            bg: "bg-yellow-500/10"
        },
        info: {
            icon: <AlertCircle className="text-primary" size={24} />,
            button: "bg-primary text-primary-foreground hover:bg-primary/90",
            bg: "bg-primary/10"
        }
    };

    const style = variantStyles[variant];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div
                className="bg-card w-full max-w-md rounded-2xl border border-border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between p-4 border-b border-border">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl ${style.bg}`}>
                            {style.icon}
                        </div>
                        <h3 className="text-lg font-black text-card-foreground">{title}</h3>
                    </div>
                    <button
                        onClick={onCancel}
                        className="p-2 hover:bg-muted rounded-xl transition-colors text-muted-foreground"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6">
                    <p className="text-muted-foreground leading-relaxed">
                        {message}
                    </p>
                </div>

                <div className="p-4 bg-muted/30 border-t border-border flex flex-col-reverse sm:flex-row justify-end gap-3">
                    <button
                        onClick={onCancel}
                        className="px-6 py-2.5 rounded-xl font-bold text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-all active:scale-95"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg transition-all active:scale-95 ${style.button}`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
