'use client';

import { useActionState } from 'react';
import { login } from '../actions/auth';
import { Dumbbell } from 'lucide-react';

export default function LoginPage() {
    const [state, action, isPending] = useActionState(login, null);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 relative overflow-hidden">
            {/* Background Ambience - Light */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-100/50 blur-3xl"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-orange-100/50 blur-3xl"></div>
            </div>

            <div className="w-full max-w-md p-6 relative z-10">
                <div className="bg-white rounded-2xl p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
                    <div className="flex flex-col items-center mb-8">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-500/20 transform rotate-[-5deg]">
                            <Dumbbell className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                            BASIC <span className="text-orange-500">FIT</span>
                        </h1>
                        <p className="text-gray-500 mt-2 text-sm font-medium">Administrator sifatida kirish</p>
                    </div>

                    <form action={action} className="space-y-5">
                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide">
                                Login
                            </label>
                            <input
                                type="text"
                                name="username"
                                required
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                                placeholder="admin"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide">
                                Parol
                            </label>
                            <input
                                type="password"
                                name="password"
                                required
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                                placeholder="••••••••"
                            />
                        </div>

                        {state?.error && (
                            <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm font-medium text-center flex items-center justify-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                {state.error}
                            </div>
                        )}

                        <button
                            disabled={isPending}
                            type="submit"
                            className="w-full bg-gray-900 hover:bg-gray-800 text-white font-bold py-3.5 rounded-xl transition-all transform active:scale-[0.98] shadow-lg shadow-gray-900/10 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                        >
                            {isPending ? 'Kirilmoqda...' : 'Tizimga Kirish'}
                        </button>
                    </form>
                </div>

                <div className="text-center mt-8">
                    <p className="text-gray-400 text-xs font-medium">
                        &copy; {new Date().getFullYear()} Basic Fit. Barcha huquqlar himoyalangan.
                    </p>
                </div>
            </div>
        </div>
    );
}
