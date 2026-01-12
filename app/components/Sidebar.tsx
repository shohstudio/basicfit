"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, CreditCard, CalendarCheck, Scan, LogOut } from "lucide-react";
import { logout } from "../actions/auth";

export default function Sidebar() {
    const pathname = usePathname();

    const menuItems = [
        { name: "Bosh Sahifa", icon: LayoutDashboard, href: "/" },
        { name: "QR Skaner", icon: Scan, href: "/qr-scanner" },
        { name: "A'zolar ro'yxati", icon: Users, href: "/members" },
        { name: "Davomat", icon: CalendarCheck, href: "/attendance" },
    ];

    return (
        <aside className="w-64 bg-[#0a0a0a] border-r border-white/5 h-screen text-white flex flex-col fixed left-0 top-0 z-50">
            <div className="p-8 pb-4">
                <div className="flex items-center gap-2 mb-2">
                    {/* Sporty Logo Icon */}
                    <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center transform -skew-x-12">
                        <div className="w-4 h-4 border-2 border-white rounded-sm"></div>
                    </div>
                    <h1 className="text-2xl font-black tracking-tighter uppercase italic text-white">
                        BASIC <span className="text-orange-500">FIT</span>
                    </h1>
                </div>
                <p className="text-[10px] text-zinc-500 font-bold pl-1 tracking-[0.2em] uppercase">Sport Management</p>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                {menuItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 group relative overflow-hidden ${isActive
                                ? "bg-white text-black font-bold shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                                : "text-zinc-400 hover:text-white hover:bg-white/5"
                                }`}
                        >
                            <item.icon
                                className={`w-5 h-5 transition-transform duration-200 group-hover:scale-110 ${isActive ? "text-orange-600" : "text-zinc-500 group-hover:text-white"
                                    }`}
                            />
                            <span className="text-sm tracking-wide z-10">{item.name}</span>
                            {isActive && (
                                <div className="absolute right-0 top-0 bottom-0 w-1 bg-orange-500"></div>
                            )}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-6 border-t border-white/5">
                <div className="flex items-center gap-3 w-full">
                    <div className="w-10 h-10 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center text-zinc-400">
                        <Users className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                        <p className="text-xs text-zinc-500 font-medium">Administrator</p>
                        <p className="text-sm font-bold text-white">Shoyatbek</p>
                    </div>
                    <button
                        onClick={() => logout()}
                        className="p-2 hover:bg-red-500/10 rounded-lg text-zinc-500 hover:text-red-500 transition-colors"
                        title="Chiqish"
                    >
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </aside>
    );
}
