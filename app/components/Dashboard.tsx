"use client";
import { useState } from "react";
import Link from "next/link";
import { Users, CreditCard, TrendingUp, Clock } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import MemberList from "./MemberList";
import MemberForm from "./MemberForm";
import DashboardLayout from "./DashboardLayout";

export default function Dashboard({ members, search, action }: { members: any[], search: string, action?: string }) {
    // Modal State Logic (Duplicated from MembersView for full functionality)
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMember, setEditingMember] = useState<any>(null);
    const [modalMode, setModalMode] = useState<'create' | 'edit' | 'renew'>('create');

    const openAddModal = () => {
        setEditingMember(null);
        setModalMode('create');
        setIsModalOpen(true);
    };

    const openEditModal = (member: any) => {
        setEditingMember(member);
        setModalMode('edit');
        setIsModalOpen(true);
    };

    const openRenewModal = (member: any) => {
        setEditingMember(member);
        setModalMode('renew');
        setIsModalOpen(true);
    };

    // Calculate real stats from members data
    const totalMembers = members.length;

    // Calculate new members (joined this month)
    const currentMonth = new Date().getMonth();
    const newMembersCount = members.filter(m => {
        const joinedDate = new Date(m.createdAt);
        return joinedDate.getMonth() === currentMonth;
    }).length;

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

                    {/* REPLACED EXPECTED VISITS WITH MEMBER LIST FOR DASHBOARD */}
                    <div className="lg:col-span-2 bg-zinc-900/50 backdrop-blur-xl border border-white/5 p-6 rounded-2xl overflow-hidden">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="text-lg font-bold text-white">So'nggi Ro'yxatdan O'tganlar</h3>
                                <p className="text-xs text-zinc-400 mt-1">Oxirgi qo'shilgan a'zolar ro'yxati</p>
                            </div>
                            <button
                                onClick={openAddModal}
                                className="text-xs bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 px-3 py-1.5 rounded-lg font-bold uppercase tracking-wider transition-colors"
                            >
                                + Yangi A'zo
                            </button>
                        </div>

                        {/* Use MemberList component but maybe limit it or just show all */}
                        <div className="max-h-[400px] overflow-y-auto">
                            <MemberList members={members} onEdit={openEditModal} onRenew={openRenewModal} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal for Add/Edit/Renew - accessible from Dashboard now too */}
            {isModalOpen && (
                <MemberForm
                    onClose={() => setIsModalOpen(false)}
                    initialData={editingMember}
                    mode={modalMode}
                />
            )}
        </DashboardLayout>
    );
}
