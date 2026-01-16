"use client";

import Sidebar from "./Sidebar";
import { Search, Bell, ShoppingCart, Menu } from "lucide-react";
import { useState } from "react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="flex min-h-screen bg-[#f3f4f6]">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
            <main className="flex-1 ml-0 md:ml-64 transition-all duration-300">
                {/* Header */}
                <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-8 sticky top-0 z-40">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="p-2 -ml-2 hover:bg-gray-100 rounded-lg md:hidden text-gray-600"
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                        {/* Logo or Brading specific to header if needed, but Sidebar covers it mostly */}
                        <div className="flex items-center gap-1">
                            {/* Hamburger could go here for mobile */}
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="relative cursor-pointer text-gray-400 hover:text-gray-600">
                            <ShoppingCart className="w-5 h-5" />
                        </div>
                        <div className="relative cursor-pointer text-green-600 hover:text-green-700 font-bold flex items-center gap-1 bg-green-50 px-3 py-1 rounded-full">
                            <div className="w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center text-xs">AU</div>
                            <span className="text-sm">Administrator</span>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <div className="p-4 md:p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
