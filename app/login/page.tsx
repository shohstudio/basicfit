'use client';

import { useActionState } from 'react';
import { login } from '../actions/auth';
import { Dumbbell } from 'lucide-react';

export default function LoginPage() {
    const [state, action, isPending] = useActionState(login, null);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white relative overflow-hidden">
            {/* Background Ambience */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-orange-600/20 via-gray-950 to-gray-950 z-0"></div>

            <div className="w-full max-w-md p-8 relative z-10">
                <div className="bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
                    <div className="flex flex-col items-center mb-8">
                        <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-orange-500/20">
                            <Dumbbell className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                            Basic Fit
                        </h1>
                        <p className="text-gray-400 mt-2 text-sm">Admin panelga kirish</p>
                    </div>

                    <form action={action} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Login
                            </label>
                            <input
                                type="text"
                                name="username"
                                required
                                className="w-full bg-gray-950/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all text-sm"
                                placeholder="admin"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Parol
                            </label>
                            <input
                                type="password"
                                name="password"
                                required
                                className="w-full bg-gray-950/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all text-sm"
                                placeholder="••••••••"
                            />
                        </div>

                        {state?.error && (
                            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm text-center">
                                {state.error}
                            </div>
                        )}

                        <button
                            disabled={isPending}
                            type="submit"
                            className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 text-white font-medium py-3 rounded-xl transition-all transform active:scale-[0.98] shadow-lg shadow-orange-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isPending ? 'Kirilmoqda...' : 'Kirish'}
                        </button>
                    </form>
                </div>

                <div className="text-center mt-6 text-gray-500 text-xs">
                    &copy; {new Date().getFullYear()} Basic Fit. Barcha huquqlar himoyalangan.
                </div>
            </div>
        </div>
    );
}
