import React, { useState } from 'react';
import { Comment } from '@/types';
import { formatSecondsToTime } from '@/utils/audio';
import { Trash2, User, Send, Clock, MessageSquare, PencilLine, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import ConfirmModal from './ConfirmModal';

interface CommentSectionProps {
    recordingId: string;
    comments: Comment[];
    currentTime: number;
    onCommentAdded: () => void;
}

export default function CommentSection({ recordingId, comments, currentTime, onCommentAdded }: CommentSectionProps) {
    const [text, setText] = useState('');
    const [authorName, setAuthorName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
    const [editingText, setEditingText] = useState('');
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [commentToDelete, setCommentToDelete] = useState<string | null>(null);

    // Simple robust check for Admin context
    const isAdmin = typeof window !== 'undefined' && window.location.pathname.startsWith('/admin');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!text.trim() || !authorName.trim()) return;

        setIsSubmitting(true);
        try {
            const response = await fetch('/api/comments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text,
                    authorName,
                    recordingId,
                    timestampSeconds: currentTime,
                }),
            });

            if (!response.ok) throw new Error('Failed to add comment');

            setText('');
            toast.success('Comentario agregado');
            onCommentAdded();
        } catch (error) {
            console.error(error);
            toast.error('Error al agregar comentario');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdate = async (commentId: string) => {
        if (!editingText.trim()) return;

        try {
            const response = await fetch(`/api/comments/${commentId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: editingText }),
            });

            if (!response.ok) throw new Error('Failed to update comment');

            toast.success('Comentario actualizado');
            setEditingCommentId(null);
            onCommentAdded();
        } catch (error) {
            console.error(error);
            toast.error('Error al actualizar comentario');
        }
    };

    const handleDelete = async () => {
        if (!commentToDelete) return;

        try {
            const response = await fetch(`/api/comments/${commentToDelete}`, {
                method: 'DELETE',
            });

            if (!response.ok) throw new Error('Failed to delete comment');

            toast.success('Comentario eliminado');
            setIsDeleteModalOpen(false);
            setCommentToDelete(null);
            onCommentAdded();
        } catch (error) {
            console.error(error);
            toast.error('Error al eliminar comentario');
        }
    };

    const confirmDelete = (commentId: string) => {
        setCommentToDelete(commentId);
        setIsDeleteModalOpen(true);
    };

    const startEditing = (comment: Comment) => {
        setEditingCommentId(comment.id);
        setEditingText(comment.text);
    };

    // Sort by timestamp
    const sortedComments = [...comments].sort((a, b) => a.timestampSeconds - b.timestampSeconds);

    return (
        <div className="mt-8 border-t border-border pt-6 animate-in fade-in duration-500">
            <h4 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                <MessageSquare size={18} className="text-primary" />
                Comentarios
                <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full">{comments.length}</span>
            </h4>

            {/* List */}
            <div className="space-y-3 mb-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {sortedComments.length > 0 ? (
                    sortedComments.map((comment) => (
                        <div key={comment.id} className="p-3 bg-muted/40 rounded-xl border border-border/50 hover:border-primary/20 transition-all group">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded flex items-center gap-1">
                                        <Clock size={10} />
                                        {formatSecondsToTime(comment.timestampSeconds)}
                                    </span>
                                    <span className="text-xs font-bold text-foreground flex items-center gap-1">
                                        <User size={10} className="text-muted-foreground" />
                                        {comment.authorName}
                                    </span>
                                    <span className="text-[10px] text-muted-foreground">
                                        • {new Date(comment.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                {isAdmin && editingCommentId !== comment.id && (
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => startEditing(comment)}
                                            className="text-muted-foreground hover:text-primary transition-colors p-1"
                                            title="Editar comentario"
                                        >
                                            <PencilLine size={14} />
                                        </button>
                                        <button
                                            onClick={() => confirmDelete(comment.id)}
                                            className="text-muted-foreground hover:text-destructive transition-colors p-1"
                                            title="Borrar comentario"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                )}
                            </div>

                            {editingCommentId === comment.id ? (
                                <div className="mt-2 flex gap-2">
                                    <input
                                        type="text"
                                        value={editingText}
                                        onChange={(e) => setEditingText(e.target.value)}
                                        className="flex-1 p-2 bg-background border border-primary/30 rounded-lg text-sm focus:ring-1 focus:ring-primary outline-none"
                                        autoFocus
                                    />
                                    <button
                                        onClick={() => handleUpdate(comment.id)}
                                        className="p-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                                    >
                                        <Check size={14} />
                                    </button>
                                    <button
                                        onClick={() => setEditingCommentId(null)}
                                        className="p-2 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-colors"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            ) : (
                                <p className="text-sm text-foreground/90 pl-1">{comment.text}</p>
                            )}
                        </div>
                    ))
                ) : (
                    <div className="text-center py-8 text-muted-foreground bg-muted/20 rounded-xl border border-dashed border-border">
                        <p className="text-sm">No hay comentarios aún en esta versión.</p>
                    </div>
                )}
            </div>

            {/* Form */}
            {!editingCommentId && (
                <form onSubmit={handleSubmit} className="flex flex-col gap-3 bg-card p-4 rounded-xl border border-border shadow-sm">
                    <div className="flex gap-3">
                        <div className="w-1/3">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1 block pl-1">Tu Nombre</label>
                            <input
                                type="text"
                                value={authorName}
                                onChange={(e) => setAuthorName(e.target.value)}
                                placeholder="Nombre"
                                className="w-full p-2 bg-input border border-border rounded-lg text-sm focus:ring-1 focus:ring-primary outline-none transition-all"
                                required
                            />
                        </div>
                        <div className="flex-1">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1 block pl-1">
                                Comentario en <span className="text-primary">{formatSecondsToTime(currentTime)}</span>
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={text}
                                    onChange={(e) => setText(e.target.value)}
                                    placeholder="Escribe un comentario..."
                                    className="w-full p-2 bg-input border border-border rounded-lg text-sm focus:ring-1 focus:ring-primary outline-none transition-all"
                                    required
                                />
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="p-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                                >
                                    <Send size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            )}
            {/* Modal de Confirmación */}
            <ConfirmModal
                isOpen={isDeleteModalOpen}
                title="¿Eliminar comentario?"
                message="Esta acción no se puede deshacer. El comentario desaparecerá de esta grabación."
                confirmText="Eliminar"
                onConfirm={handleDelete}
                onCancel={() => setIsDeleteModalOpen(false)}
                variant="danger"
            />
        </div>
    );
}
