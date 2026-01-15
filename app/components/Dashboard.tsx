"use client";
import { useState } from "react";
import Link from "next/link";
import { Users, CreditCard, TrendingUp, Clock, CheckSquare, CalendarCheck } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import MemberList from "./MemberList";
import MemberForm from "./MemberForm";
import DashboardLayout from "./DashboardLayout";

export default function Dashboard({ members, search, action, dailyStats }: { members: any[], search: string, action?: string, dailyStats?: any }) {
    // Modal State Logic (Duplicated from MembersView for full functionality)
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMember, setEditingMember] = useState<any>(null);
    const [modalMode, setModalMode] = useState<'create' | 'edit' | 'renew'>('create');

    // Income Details Modal
    const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);

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

    // Calculate Today's Revenue (Use server provided stats or fallback)
    const dailyRevenue = dailyStats?.revenue || 0;

    const stats = [
        {
            title: "Jami A'zolar",
            value: totalMembers.toLocaleString(),
            change: "+12.5%", // This usually requires historical data, keeping static fallback or simple logic
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
            value: dailyRevenue.toLocaleString(),
            suffix: "so'm",
            change: "+24%",
            icon: CreditCard,
            color: "text-violet-500",
            bg: "bg-zinc-900 border-violet-500/20",
            trend: "up",
            onClick: () => setIsIncomeModalOpen(true) // Open details modal on click
        },
    ];

    // Plan distribution (Replaces Gender data since we don't have gender DB field)
    const planCounts: Record<string, number> = {};
    members.forEach(m => {
        const planName = m.subscriptions && m.subscriptions[0] ? m.subscriptions[0].plan : 'Obunasiz';
        planCounts[planName] = (planCounts[planName] || 0) + 1;
    });

    const planData = Object.keys(planCounts).map((key, index) => ({
        name: key,
        value: planCounts[key],
        color: index === 0 ? "#f97316" : index === 1 ? "#3b82f6" : "#52525b" // Orange, Blue, Zinc
    }));

    // Fallback if no data
    if (planData.length === 0) {
        planData.push({ name: "Ma'lumot yo'q", value: 1, color: "#52525b" });
    }

    return (
        <DashboardLayout>
            <div className="space-y-8">
                {/* Header Greeting */}
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Good evening Admin</h2>
                </div>

                {/* Main Action Cards (Row 1) */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Add Member Card */}
                    <div onClick={openAddModal} className="cursor-pointer bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex flex-col items-center justify-center h-40 group">
                        <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <span className="text-2xl font-bold">+</span>
                        </div>
                        <h3 className="font-bold text-blue-500">Add Member</h3>
                    </div>

                    {/* Enquiries Card */}
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center justify-center h-40">
                        <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-400 flex items-center justify-center mb-4">
                            <span className="text-xl font-bold">?</span>
                        </div>
                        <h3 className="font-bold text-blue-500">Enquiries</h3>
                    </div>

                    {/* Tasks Card */}
                    <Link href="/tasks" className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center justify-center h-40 relative">
                        {/* Badge */}
                        <div className="absolute top-4 right-4 bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">1</div>
                        <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-400 flex items-center justify-center mb-4">
                            <CheckSquare className="w-6 h-6" /> // Assuming CheckSquare imported
                        </div>
                        <h3 className="font-bold text-blue-500">Tasks</h3>
                    </Link>

                    {/* Attendances Card */}
                    <Link href="/attendance" className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center justify-center h-40">
                        <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-400 flex items-center justify-center mb-4">
                            <CalendarCheck className="w-6 h-6" /> // Assuming CalendarCheck imported
                        </div>
                        <h3 className="font-bold text-blue-500">Attendances</h3>
                    </Link>
                </div>

                {/* Stats Grid (Row 2) - Vertical Layout matching NitroFIT */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
                    {/* New Members */}
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center text-center">
                        <h3 className="text-gray-900 font-bold mb-4">New Members</h3>
                        <div className="text-4xl font-black text-gray-900 mb-2">{newMembersCount}</div>
                        <div className="text-red-500 text-xs font-bold mb-4 flex items-center justify-center">
                            (60%) <TrendingUp className="w-3 h-3 ml-1 rotate-180" />
                        </div>
                        <p className="text-xs text-gray-500 leading-relaxed">
                            New customers from<br />15 Dec to 15 Jan<br />compared with 12<br />Nov to 14 Dec
                        </p>
                    </div>

                    {/* Visits Today */}
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center text-center">
                        <h3 className="text-gray-900 font-bold mb-4">Visits Today</h3>
                        <div className="text-4xl font-black text-gray-900 mb-2">0</div>
                        <div className="text-green-500 text-xs font-bold mb-4 flex items-center justify-center">
                            (0%) <TrendingUp className="w-3 h-3 ml-1" />
                        </div>
                        <p className="text-xs text-gray-500 leading-relaxed">
                            Successful visits<br />today so far<br />compared with the<br />same time on 16th<br />Sep 11:33 pm
                        </p>
                    </div>

                    {/* Member Visits */}
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center text-center">
                        <h3 className="text-gray-900 font-bold mb-4">Member Visits</h3>
                        <div className="text-4xl font-black text-gray-900 mb-2">4</div>
                        <div className="text-red-500 text-xs font-bold mb-4 flex items-center justify-center">
                            (-88.24%) <TrendingUp className="w-3 h-3 ml-1 rotate-180" />
                        </div>
                        <p className="text-xs text-gray-500 leading-relaxed">
                            Visits from 01 Jan<br />compared with 01<br />Dec to 15 Dec
                        </p>
                    </div>

                    {/* Manual Bookings */}
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center text-center">
                        <h3 className="text-gray-900 font-bold mb-4">Manual Bookings</h3>
                        <div className="text-4xl font-black text-gray-900 mb-2">12</div>
                        <div className="text-red-500 text-xs font-bold mb-4 flex items-center justify-center">
                            (-82.86%) <TrendingUp className="w-3 h-3 ml-1 rotate-180" />
                        </div>
                        <p className="text-xs text-gray-500 leading-relaxed">
                            Bookings from 01<br />Jan compared with<br />01 Dec to 15 Dec
                        </p>
                    </div>

                    {/* Online Bookings */}
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center text-center">
                        <h3 className="text-gray-900 font-bold mb-4">Online Bookings</h3>
                        <div className="text-4xl font-black text-gray-900 mb-2">10</div>
                        <div className="text-red-500 text-xs font-bold mb-4 flex items-center justify-center">
                            (-73.68%) <TrendingUp className="w-3 h-3 ml-1 rotate-180" />
                        </div>
                        <p className="text-xs text-gray-500 leading-relaxed">
                            Online bookings<br />from 01 Jan<br />compared with 01<br />Dec to 15 Dec
                        </p>
                    </div>

                    {/* Online Signups */}
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center text-center">
                        <h3 className="text-gray-900 font-bold mb-4">Online Signups</h3>
                        <div className="text-4xl font-black text-gray-900 mb-2">10</div>
                        <div className="text-red-500 text-xs font-bold mb-4 flex items-center justify-center">
                            (-47.37%) <TrendingUp className="w-3 h-3 ml-1 rotate-180" />
                        </div>
                        <p className="text-xs text-gray-500 leading-relaxed">
                            New subscriptions<br />from 15 Dec to 15<br />Jan compared with<br />12 Nov to 14 Dec
                        </p>
                    </div>

                </div>



                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Plan Distribution Chart */}
                    <div className="lg:col-span-1 bg-white border border-gray-200 p-6 rounded-2xl shadow-sm">
                        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <span className="w-1 h-6 bg-orange-500 rounded-full"></span>
                            Tariflar Bo'yicha
                        </h3>
                        <div className="h-64 relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={planData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {planData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        itemStyle={{ color: '#111827', fontWeight: 600 }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex justify-center gap-6 mt-4 flex-wrap">
                            {planData.map((item, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                                    <span className="text-sm text-gray-500 font-medium">{item.name} ({item.value})</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* REPLACED EXPECTED VISITS WITH MEMBER LIST FOR DASHBOARD */}
                    <div className="lg:col-span-2 bg-white border border-gray-200 p-6 rounded-2xl shadow-sm overflow-hidden">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">So'nggi Ro'yxatdan O'tganlar</h3>
                                <p className="text-xs text-gray-500 mt-1">Oxirgi qo'shilgan a'zolar ro'yxati</p>
                            </div>
                            <button
                                onClick={openAddModal}
                                className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-1.5 rounded-lg font-bold uppercase tracking-wider transition-colors"
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

            {/* Income Details Modal */}
            {isIncomeModalOpen && dailyStats && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-lg p-6 max-h-[80vh] overflow-y-auto shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-900">Bugungi Tushum Tafsilotlari</h2>
                            <button
                                onClick={() => setIsIncomeModalOpen(false)}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-4 bg-violet-50 border border-violet-100 rounded-xl">
                                <span className="text-violet-700 font-medium">Jami Tushum:</span>
                                <span className="text-2xl font-bold text-violet-600">{dailyStats.revenue.toLocaleString()} so'm</span>
                            </div>

                            <div className="space-y-2">
                                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">To'lovlar Ro'yxati</h3>
                                {dailyStats.transactions && dailyStats.transactions.length > 0 ? (
                                    dailyStats.transactions.map((tx: any) => (
                                        <div key={tx.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-100">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-white border border-gray-200 overflow-hidden flex items-center justify-center">
                                                    {tx.image ? (
                                                        <img src={tx.image} alt={tx.member} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="text-xs font-bold text-gray-500">{tx.member.charAt(0)}</span>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900">{tx.member}</p>
                                                    <p className="text-xs text-gray-500">{tx.plan}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-gray-900">{tx.amount.toLocaleString()} so'm</p>
                                                <p className="text-[10px] text-gray-500">{new Date(tx.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        Bugun hech qanday to'lov bo'lmagan
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
