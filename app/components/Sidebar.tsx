"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, CreditCard, CalendarCheck, Scan, LogOut, FileText, CheckSquare, Dumbbell, ClipboardList } from "lucide-react";
import { logout } from "../actions/auth";

export default function Sidebar() {
    const pathname = usePathname();

    const menuItems = [
        { name: "Dashboard", icon: LayoutDashboard, href: "/" },
        { name: "Enquiries", icon: FileText, href: "/enquiries" }, // Placeholder or map to relevant
        { name: "Tasks", icon: CheckSquare, href: "/tasks" },
        { name: "Members", icon: Users, href: "/members" },
        { name: "Subscriptions", icon: CreditCard, href: "/subscriptions" }, // Maybe redirect to members or specific page
        { name: "Products", icon: Dumbbell, href: "/products" },
        // { name: "Workout Plans", icon: ClipboardList, href: "/plans" },
        { name: "Attendances", icon: CalendarCheck, href: "/attendance" },
        { name: "My QR Code", icon: Scan, href: "/qr-scanner" },
    ];

    // Filter to keep existing routes functional primarily, but showing the full list visually as requested by "design"
    // For now, I will keep the actual functional links working and maybe add placeholders for others if the user wants the exact visual match
    // The user said "menyu iconlar ham chapda side barda shunaqa tursin", so I should try to match the list.
    // However, I don't have pages for "Enquiries", "Tasks", "Subscriptions", "Products".
    // I will stick to the existing functional items but styled like the new design, 
    // OR add the new items as non-functional links? 
    // The user said "faqat ko'rinishini o'zgartir bo'lim qo'shib boshqa narsalar qilma", which means "change appearance, don't add sections/features".
    // So I will keep the OLD menu items but Style them like the NEW design.

    const realMenuItems = [
        { name: "Bosh sahifa", icon: LayoutDashboard, href: "/" },
        { name: "A'zolar", icon: Users, href: "/members" },
        { name: "QR Skaner", icon: Scan, href: "/qr-scanner" },
        { name: "Davomat", icon: CalendarCheck, href: "/attendance" },
    ];

    return (
        <aside className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col fixed left-0 top-0 z-50 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
            <div className="p-6">
                <div className="flex items-center gap-2 mb-8">
                    {/* Logo - Matching NitroFIT style but with Basic Fit text */}
                    <h1 className="text-2xl font-black tracking-tight text-blue-600 flex items-center gap-1">
                        <span className="text-3xl">BASIC</span> <span className="text-orange-500">FIT</span>
                    </h1>
                </div>

                <nav className="space-y-1">
                    {realMenuItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group relative ${isActive
                                    ? "bg-blue-50 text-blue-600 font-bold"
                                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                                    }`}
                            >
                                <item.icon
                                    className={`w-5 h-5 transition-colors ${isActive ? "text-blue-600" : "text-gray-400 group-hover:text-gray-600"
                                        }`}
                                />
                                <span className="text-sm font-medium">{item.name}</span>
                                {isActive && (
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-600 rounded-r-full"></div>
                                )}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            <div className="mt-auto p-6 border-t border-gray-100">
                <div className="flex items-center gap-3 w-full">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold border-2 border-white shadow-sm">
                        AD
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 truncate">Admin User</p>
                        <p className="text-xs text-gray-500 truncate">Administrator</p>
                    </div>
                    <button
                        onClick={() => logout()}
                        className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg transition-colors"
                        title="Chiqish"
                    >
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </aside>
    );
}
