"use client";

import Sidebar from "./Sidebar";
import { Search, Bell, ShoppingCart } from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen bg-[#f3f4f6]">
            <Sidebar />
            <main className="flex-1 ml-64">
                {/* Header */}
                <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-40">
                    <div className="flex items-center gap-2">
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
                            <span className="text-sm">Admin User</span>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <div className="p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
