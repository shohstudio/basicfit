"use client";

import Link from "next/link";
import { Users, CreditCard, Activity, TrendingUp, Clock } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import DashboardLayout from "./DashboardLayout";

// Mock data for Expected Visits logic
const expectedVisits = [
    { name: "Ali Valiyev", plan: "Har kuni", status: "Kutilmoqda", time: "08:00 - 10:00", image: "A" },
    { name: "Vali G'aniyev", plan: "Kun ora (Toq kunlar)", status: "Kutilmoqda", time: "18:00 - 20:00", image: "V" },
    { name: "Sardor Rahimov", plan: "Har kuni", status: "Kutilmoqda", time: "19:00", image: "S" },
    { name: "Malika Karimova", plan: "Kun ora (Juft kunlar)", status: "Kutilmoqda", time: "09:00", image: "M" },
    { name: "Jamshid Tursunov", plan: "Har kuni", status: "Keldi", time: "07:30", image: "J", arrived: true },
];

export default function Dashboard({ members, search, action }: { members: any[], search: string, action?: string }) {

    // Calculate real stats from members data
    const totalMembers = members.length;
    const activeMembers = members.filter(m => m.status === 'ACTIVE').length;
    const inactiveMembers = members.filter(m => m.status === 'INACTIVE').length;

    // Calculate new members (joined this month)
    const currentMonth = new Date().getMonth();
    const newMembersCount = members.filter(m => {
        const joinedDate = new Date(m.createdAt);
        return joinedDate.getMonth() === currentMonth;
    }).length;

    // Calculate expiring members (active members ending within 5 days)
    // In real app: members.filter(m => hasExpiringSubscription(m))
    const expiringMembers = 5; // Placeholder for now

    // Dummy calculations for revenue/growth since we don't have historical data yet
    // In a real app, we'd fetch these from the backend
    // Dummy calculations for revenue/growth since we don't have historical data yet
    // In a real app, we'd fetch these from the backend
    const stats = [
        {
            title: "Jami A'zolar",
            value: totalMembers.toLocaleString(),
            change: "+12.5%",
            icon: Users,
            color: "text-orange-500",
            bg: "bg-zinc-900 border-orange-500/20",
            trend: "up",
            href: "/members"
        },
        {
            title: "Yangi A'zolar",
            value: newMembersCount.toLocaleString(),
            change: "+5%",
            icon: Users,
            color: "text-blue-500",
            bg: "bg-zinc-900 border-blue-500/20",
            trend: "up",
            href: "/members"
        },
        {
            title: "Bugungi Tushum",
            value: "4 200 000",
            suffix: "so'm",
            change: "+24%",
            icon: CreditCard,
            color: "text-violet-500",
            bg: "bg-zinc-900 border-violet-500/20",
            trend: "up",
            href: "/finance"
        },
    ];

    // Gender distribution (Mock data for now, could be real if we had gender field)
    const genderData = [
        { name: "Erkaklar", value: 65, color: "#f97316" }, // Orange 500
        { name: "Ayollar", value: 35, color: "#52525b" }, // Zinc 600
    ];

    return (
        <DashboardLayout>
            <div className="space-y-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {stats.map((stat, index) => (
                        <Link
                            key={index}
                            href={stat.href}
                            className={`relative overflow-hidden p-6 rounded-2xl border transition-all duration-300 hover:bg-zinc-800/80 hover:scale-105 group ${stat.bg} cursor-pointer`}
                        >
                            <div className="flex justify-between items-start mb-4 relative z-10">
                                <div className={`p-2 rounded-lg bg-black/40 ${stat.color}`}>
                                    <stat.icon className="w-5 h-5" />
                                </div>
                                <span className={`flex items-center text-xs font-bold px-2 py-1 rounded-full ${stat.trend === 'up' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                                    }`}>
                                    {stat.change}
                                    <TrendingUp className={`w-3 h-3 ml-1 ${stat.trend === 'down' && 'rotate-180'}`} />
                                </span>
                            </div>
                            <div className="relative z-10">
                                <h3 className="text-zinc-400 text-sm font-medium mb-1">{stat.title}</h3>
                                <p className="text-3xl font-black text-white tracking-tight group-hover:text-orange-500 transition-colors">
                                    {stat.value}
                                    {/* @ts-ignore */}
                                    {stat.suffix && <span className="text-sm font-medium ml-1 text-zinc-500">{stat.suffix}</span>}
                                </p>
                            </div>

                            {/* Decorative glow */}
                            <div className={`absolute -right-4 -bottom-4 w-24 h-24 rounded-full opacity-0 group-hover:opacity-10 blur-2xl transition-opacity duration-500 ${stat.color.replace('text-', 'bg-')}`}></div>
                        </Link>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Gender Chart */}
                    <div className="lg:col-span-1 bg-zinc-900 border border-white/5 p-6 rounded-2xl">
                        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                            <span className="w-1 h-6 bg-orange-500 rounded-full"></span>
                            Jinslar Bo'yicha
                        </h3>
                        <div className="h-64 relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={genderData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {genderData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}
                                        itemStyle={{ color: '#fff' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex justify-center gap-6 mt-4">
                            {genderData.map((item, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                                    <span className="text-sm text-zinc-400">{item.name} ({item.value}%)</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Expected Visits Widget */}
                    <div className="lg:col-span-2 bg-zinc-900/50 backdrop-blur-xl border border-white/5 p-6 rounded-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="text-lg font-bold text-white">Bugungi Kutilayotgan Tashriflar</h3>
                                <p className="text-xs text-zinc-400 mt-1">Reja bo'yicha bugun kelishi kerak bo'lgan a'zolar</p>
                            </div>
                            <button className="text-xs text-cyan-400 hover:text-cyan-300 font-medium uppercase tracking-wider">
                                Barchasini ko'rish
                            </button>
                        </div>
                        <div className="space-y-3">
                            {expectedVisits.map((visit, index) => (
                                <div key={index} className={`flex items-center p-3 rounded-xl border transition-all group ${visit.arrived
                                    ? "bg-green-500/5 border-green-500/20"
                                    : "bg-white/5 hover:bg-white/10 border-white/5"
                                    }`}>
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white mr-4 ${visit.arrived ? "bg-green-500" : "bg-gradient-to-br from-blue-500 to-cyan-500"
                                        }`}>
                                        {visit.image}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <h4 className={`font-bold ${visit.arrived ? "text-green-400" : "text-white group-hover:text-cyan-400"}`}>
                                                {visit.name}
                                            </h4>
                                            {visit.arrived && (
                                                <span className="px-1.5 py-0.5 rounded text-[10px] bg-green-500/20 text-green-400 font-bold uppercase">Keldi</span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-3 text-xs text-zinc-400 mt-1">
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-3 h-3" /> {visit.time}
                                            </span>
                                            <span className="w-1 h-1 rounded-full bg-zinc-600"></span>
                                            <span>{visit.plan}</span>
                                        </div>
                                    </div>
                                    <button className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-colors ${visit.arrived
                                        ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                                        : "bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20"
                                        }`}>
                                        {visit.arrived ? "Tasdiqlangan" : "Kirish"}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
