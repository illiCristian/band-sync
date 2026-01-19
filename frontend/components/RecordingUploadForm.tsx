"use client";

import React, { useState } from "react";
import { RecordingCategory } from "@/types";
import { Upload, X, CheckCircle2, Clock } from "lucide-react";

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

        let finalFile = file;
        try {
            // Trim Logic
            if (isTrimming) {
                const start = parseTimeToSeconds(trimStart);
                const end = parseTimeToSeconds(trimEnd);
                if (!isNaN(start) && !isNaN(end) && end > start) {
                    finalFile = await trimAudioFile(file, start, end);
                }
            }

            // In a real app, we'd use FormData to send the file
            // For now, we simulate the structure
            const data = {
                songId,
                versionName: versionName || "Toma 1",
                category,
                isFinal,
                type: finalFile.type,
                file: finalFile, // The actual file
            };

            await onUpload(data);
        } catch (error) {
            console.error("Error al procesar/subir", error);
            alert("Error: " + (error as any).message);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-indigo-100 dark:border-indigo-900/50 shadow-xl animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                    <Upload size={20} className="text-indigo-500" />
                    Añadir Grabación
                </h3>
                <button onClick={onCancel} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                    <X size={20} className="text-gray-400" />
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-gray-400 px-1">Nombre de Versión</label>
                        <input
                            type="text"
                            placeholder="ej. Ensayo Ene 18 / Mezcla Final v1"
                            value={versionName}
                            onChange={(e) => setVersionName(e.target.value)}
                            className="w-full p-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-gray-400 px-1">Categoría</label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value as any)}
                            className="w-full p-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all outline-none appearance-none"
                        >
                            <option value="REHEARSAL">Ensayo</option>
                            <option value="STUDIO">Estudio</option>
                            <option value="LIVE">En Vivo</option>
                            <option value="DEMO">Demo</option>
                        </select>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <label className="flex items-center gap-3 cursor-pointer group">
                        <div className="relative">
                            <input
                                type="checkbox"
                                checked={isFinal}
                                onChange={(e) => setIsFinal(e.target.checked)}
                                className="sr-only"
                            />
                            <div className={`w-12 h-6 rounded-full transition-colors ${isFinal ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'}`} />
                            <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${isFinal ? 'translate-x-6' : 'translate-x-0'}`} />
                        </div>
                        <span className="text-sm font-bold text-gray-700 dark:text-gray-300 group-hover:text-indigo-500 transition-colors">Marcar como Versión Final</span>
                    </label>
                </div>

                {/* File Dropzone */}
                <div
                    className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all group ${file ? 'border-green-500 bg-green-50/10' : 'border-gray-200 dark:border-gray-700'
                        }`}
                >
                    <input
                        id="recording-file-upload"
                        type="file"
                        accept="audio/*"
                        onChange={handleFileChange}
                        className="hidden"
                    />
                    {file ? (
                        <div className="flex flex-col items-center gap-2">
                            <CheckCircle2 size={40} className="text-green-500" />
                            <p className="font-bold text-gray-900 dark:text-white">{file.name}</p>
                            <p className="text-xs text-gray-400">{(file.size / (1024 * 1024)).toFixed(2)} MB • Listo para subir</p>
                            {originalDuration > 0 && <p className="text-xs text-indigo-500 font-bold mt-1">Duración: {formatSecondsToTime(originalDuration)}</p>}

                            <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 w-full max-w-sm text-left">
                                <div className="flex items-center gap-2 mb-3">
                                    <input
                                        type="checkbox"
                                        id="trim-toggle-local"
                                        checked={isTrimming}
                                        onChange={(e) => setIsTrimming(e.target.checked)}
                                        className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                                    />
                                    <label htmlFor="trim-toggle-local" className="text-sm font-bold text-gray-700 dark:text-gray-300 cursor-pointer">Recortar Audio</label>
                                </div>

                                {isTrimming && (
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-xs text-gray-500 font-bold">Inicio (min:seg)</label>
                                            <input
                                                type="text"
                                                value={trimStart}
                                                onChange={(e) => setTrimStart(e.target.value)}
                                                placeholder="00:00"
                                                className="w-full p-2 bg-gray-50 dark:bg-gray-900 border rounded-lg text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-500 font-bold">Fin (min:seg)</label>
                                            <input
                                                type="text"
                                                value={trimEnd}
                                                onChange={(e) => setTrimEnd(e.target.value)}
                                                placeholder="01:30"
                                                className="w-full p-2 bg-gray-50 dark:bg-gray-900 border rounded-lg text-sm"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            <button
                                type="button"
                                onClick={() => { setFile(null); setIsTrimming(false); }}
                                className="mt-2 text-xs font-bold text-indigo-500 hover:underline"
                            >
                                Cambiar archivo
                            </button>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-2 text-gray-400">
                            <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-full mb-2 group-hover:scale-110 transition-transform">
                                <Upload size={24} className="text-indigo-500" />
                            </div>
                            <p className="font-black text-gray-900 dark:text-white">Elegir Archivo de Audio</p>
                            <p className="text-xs mb-4">Soporta MP3, WAV, AAC</p>
                            <button
                                type="button"
                                onClick={() => document.getElementById('recording-file-upload')?.click()}
                                className="px-6 py-3 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg hover:bg-indigo-700 transition-all active:scale-95"
                            >
                                Seleccionar Archivo
                            </button>
                        </div>
                    )}
                </div>

                <div className="flex justify-end gap-3 mt-8">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-6 py-3 font-bold text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={!file || isUploading}
                        className={`px-8 py-3 bg-indigo-600 text-white font-black rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none transition-all flex items-center gap-2 ${(!file || isUploading) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-indigo-700 hover:scale-105 active:scale-95'
                            }`}
                    >
                        {isUploading ? (
                            <>
                                <Clock size={18} className="animate-spin" />
                                Procesando...
                            </>
                        ) : (
                            'Subir a la Nube'
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
