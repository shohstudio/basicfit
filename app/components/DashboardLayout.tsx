"use client";

import Sidebar from "./Sidebar";
import { UserCircle } from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (

        <div className="flex min-h-screen bg-[#09090b]">
            <Sidebar />
            <main className="flex-1 ml-64">
                {/* Header */}
                <header className="h-16 bg-[#0a0a0a] border-b border-white/5 flex items-center justify-between px-6 sticky top-0 z-10">
                    <div>
                        {/* Search or Title placeholder */}
                        <h2 className="text-lg font-bold text-white tracking-wide">Boshqaruv Paneli</h2>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-xs font-bold text-orange-500 uppercase tracking-widest border border-orange-500/20 px-2 py-1 rounded">
                            Basic Fit Filiali
                        </div>
                        <div className="flex items-center gap-2 cursor-pointer hover:opacity-80">
                            <div className="w-8 h-8 rounded-full bg-orange-600 flex items-center justify-center text-white font-bold text-xs">
                                SH
                            </div>
                            <span className="text-sm font-bold text-white">Shoyatbek</span>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <div className="p-6">
                    {children}
                </div>
            </main>
        </div>
    );
}
