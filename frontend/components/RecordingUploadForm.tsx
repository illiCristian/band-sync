"use client";

import React, { useState } from "react";
import { RecordingCategory } from "@/types";
import { Upload, X, CheckCircle2, Clock, UploadCloud, FileAudio } from "lucide-react";

interface RecordingUploadFormProps {
    songId: string;
    onUpload: (data: any) => Promise<void>;
    onCancel: () => void;
}

import { trimAudioFile, formatSecondsToTime, parseTimeToSeconds } from "@/utils/audio";

export default function RecordingUploadForm({ songId, onUpload, onCancel }: RecordingUploadFormProps) {
    const [versionName, setVersionName] = useState("");
    const [category, setCategory] = useState<RecordingCategory>("REHEARSAL");
    const [isFinal, setIsFinal] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    // Trimming Fields
    const [isTrimming, setIsTrimming] = useState(false);
    const [trimStart, setTrimStart] = useState<string>("00:00");
    const [trimEnd, setTrimEnd] = useState<string>("");
    const [originalDuration, setOriginalDuration] = useState<number>(0);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            const audio = new Audio(URL.createObjectURL(selectedFile));
            audio.onloadedmetadata = () => {
                setOriginalDuration(audio.duration);
                setTrimEnd(formatSecondsToTime(audio.duration));
            };
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) return;

        setIsUploading(true);
        setUploadProgress(0);

        let finalFile = file;
        try {
            // Trim Logic if applicable
            if (isTrimming) {
                const start = parseTimeToSeconds(trimStart);
                const end = parseTimeToSeconds(trimEnd);
                if (!isNaN(start) && !isNaN(end) && end > start) {
                    finalFile = await trimAudioFile(file, start, end);
                }
            }

            const formData = new FormData();
            formData.append('songId', songId);
            formData.append('versionName', versionName || "Nueva Toma");
            formData.append('category', category);
            formData.append('isFinal', String(isFinal));
            formData.append('file', finalFile);

            const token = localStorage.getItem('token');

            // Using XHR for progress tracking
            await new Promise<void>((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.open('POST', '/api/recordings/upload');
                xhr.setRequestHeader('Authorization', `Bearer ${token}`);

                xhr.upload.onprogress = (event) => {
                    if (event.lengthComputable) {
                        const percent = Math.round((event.loaded / event.total) * 100);
                        setUploadProgress(percent);
                    }
                };

                xhr.onload = () => {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        resolve();
                    } else {
                        reject(new Error(`Upload failed with status ${xhr.status}`));
                    }
                };

                xhr.onerror = () => reject(new Error('Network error during upload'));
                xhr.send(formData);
            });

            await onUpload({ success: true }); // Notify parent to refresh
        } catch (error) {
            console.error("Error al procesar/subir", error);
            alert("Error: " + (error as any).message);
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-card p-6 rounded-2xl border border-border shadow-xl animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="flex justify-between items-start mb-6">
                    <h3 className="text-xl font-black text-foreground flex items-center gap-2">
                        <UploadCloud size={24} className="text-primary" />
                        Subir Nueva Versión
                    </h3>
                    <button onClick={onCancel} className="p-2 hover:bg-muted rounded-full transition-colors">
                        <X size={20} className="text-muted-foreground hover:text-foreground" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 w-full max-w-md">
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground px-1">Nombre de Versión</label>
                            <input
                                type="text"
                                placeholder="ej. Ensayo Jueves, Demo Vfinal"
                                value={versionName}
                                onChange={(e) => setVersionName(e.target.value)}
                                className="w-full p-3 bg-input border border-border rounded-xl focus:ring-2 focus:ring-primary transition-all outline-none text-foreground"
                                required
                            />
                        </div>

                        <div>
                            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground px-1">Categoría</label>
                            <div className="relative">
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value as RecordingCategory)}
                                    className="w-full p-3 bg-input border border-border rounded-xl focus:ring-2 focus:ring-primary transition-all outline-none appearance-none text-foreground"
                                >
                                    <option value="REHEARSAL">Ensayo</option>
                                    <option value="STUDIO">Estudio</option>
                                    <option value="LIVE">En Vivo</option>
                                    <option value="DEMO">Demo</option>
                                </select>
                            </div>
                        </div>

                        <div className="pt-2">
                            <label className="flex items-center gap-3 p-3 bg-muted/30 hover:bg-muted/50 rounded-xl cursor-pointer transition-colors group">
                                <div className="relative">
                                    <input
                                        type="checkbox"
                                        checked={isFinal}
                                        onChange={(e) => setIsFinal(e.target.checked)}
                                        className="sr-only"
                                    />
                                    <div className={`w-12 h-6 rounded-full transition-colors ${isFinal ? 'bg-primary' : 'bg-muted-foreground/30'}`} />
                                    <div className={`absolute top-1 left-1 w-4 h-4 bg-background rounded-full transition-transform ${isFinal ? 'translate-x-6' : 'translate-x-0'}`} />
                                </div>
                                <span className="text-sm font-bold text-muted-foreground group-hover:text-primary transition-colors">Marcar como Versión Final</span>
                            </label>
                        </div>
                    </div>

                    <div
                        onClick={() => document.getElementById(`local-upload-${songId}`)?.click()}
                        className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all group ${file ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                            } cursor-pointer`}
                    >
                        <input
                            id={`local-upload-${songId}`}
                            type="file"
                            accept="audio/*"
                            onChange={handleFileChange}
                            className="hidden"
                        />

                        {file ? (
                            <div className="animate-in zoom-in duration-300">
                                <FileAudio size={40} className="mx-auto text-primary mb-2" />
                                <p className="font-bold text-foreground">{file.name}</p>
                                <p className="text-xs text-muted-foreground">{(file.size / (1024 * 1024)).toFixed(2)} MB • Listo para subir</p>
                                {originalDuration > 0 && <p className="text-xs text-primary font-bold mt-1">Duración: {formatSecondsToTime(originalDuration)}</p>}

                                {/* Trimming UI */}
                                <div className="mt-4 p-4 bg-muted/30 rounded-xl border border-border w-full max-w-sm text-left mx-auto">
                                    <div className="flex items-center gap-2 mb-3">
                                        <input
                                            type="checkbox"
                                            id="trim-toggle-local"
                                            checked={isTrimming}
                                            onChange={(e) => setIsTrimming(e.target.checked)}
                                            className="w-4 h-4 text-primary rounded focus:ring-primary"
                                        />
                                        <label htmlFor="trim-toggle-local" className="text-sm font-bold text-foreground cursor-pointer">Recortar Audio</label>
                                    </div>
                                    {isTrimming && (
                                        <div className="grid grid-cols-2 gap-3 mt-3">
                                            <div>
                                                <label className="text-xs text-muted-foreground font-bold">Inicio (min:seg)</label>
                                                <input
                                                    type="text"
                                                    value={trimStart}
                                                    onChange={(e) => setTrimStart(e.target.value)}
                                                    placeholder="00:00"
                                                    className="w-full p-2 bg-input border border-border rounded-lg text-sm text-foreground"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs text-muted-foreground font-bold">Fin (min:seg)</label>
                                                <input
                                                    type="text"
                                                    value={trimEnd}
                                                    onChange={(e) => setTrimEnd(e.target.value)}
                                                    placeholder="01:30"
                                                    className="w-full p-2 bg-input border border-border rounded-lg text-sm text-foreground"
                                                />
                                            </div>
                                        </div>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => { setFile(null); setIsTrimming(false); }}
                                        className="mt-4 text-xs font-bold text-destructive hover:text-destructive/90 underline underline-offset-4"
                                    >
                                        Cambiar archivo
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
                                <Upload size={40} className="mb-2" />
                                <p className="font-bold">Haz click para seleccionar un archivo</p>
                                <p className="text-sm">Formatos soportados: MP3, WAV, M4A, FLAC</p>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end gap-3 mt-8">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-6 py-3 font-bold text-muted-foreground hover:text-foreground transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={!file || isUploading}
                            className={`relative px-8 py-3 bg-primary text-primary-foreground font-black rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 overflow-hidden ${(!file || isUploading) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98]'
                                }`}
                        >
                            {isUploading ? (
                                <>
                                    <div
                                        className="absolute inset-0 bg-primary-foreground/20 transition-all duration-300 ease-out"
                                        style={{ width: `${uploadProgress}%` }}
                                    />
                                    <div className="relative z-10 flex items-center gap-2">
                                        <Clock size={18} className="animate-spin" />
                                        <span>Subiendo... {uploadProgress}%</span>
                                    </div>
                                </>
                            ) : (
                                'Subir a la Nube'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
