
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuth();
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            if (!res.ok) {
                throw new Error('Credenciales inválidas');
            }

            const data = await res.json();
            login(data.access_token, username);
        } catch (error) {
            toast.error('Error al iniciar sesión. Verifica tus credenciales.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md space-y-8">
                <div className="flex items-center justify-between">
                    <Link href="/" className="text-zinc-400 hover:text-white transition-colors flex items-center gap-2">
                        <ArrowLeft size={20} />
                        Volver
                    </Link>
                    <h2 className="text-3xl font-bold tracking-tight text-center">Admin Login</h2>
                    <div className='w-[70px]'></div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 bg-zinc-900/50 p-8 rounded-2xl border border-white/10 backdrop-blur-xl">
                    <div className="space-y-2">
                        <label htmlFor="username" className="text-sm font-medium text-zinc-400">Usuario</label>
                        <input
                            id="username"
                            type="text"
                            required
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-4 py-3 bg-zinc-950/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-white/20 focus:border-white/20 outline-none transition-all placeholder:text-zinc-600"
                            placeholder="admin"
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="password" className="text-sm font-medium text-zinc-400">Contraseña</label>
                        <input
                            id="password"
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 bg-zinc-950/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-white/20 focus:border-white/20 outline-none transition-all placeholder:text-zinc-600"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3 px-4 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Iniciando sesión...' : 'Ingresar'}
                    </button>
                </form>
            </div>
        </div>
    );
}
