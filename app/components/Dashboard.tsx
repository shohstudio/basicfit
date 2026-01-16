import { useState, useEffect } from "react";
import Link from "next/link";
import { Users, CreditCard, TrendingUp, CalendarCheck } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import MemberList from "./MemberList";
import MemberForm from "./MemberForm";
import DashboardLayout from "./DashboardLayout";
import { getDailyStats } from "../actions";

export default function Dashboard({ members, search, action, dailyStats }: { members: any[], search: string, action?: string, dailyStats?: any }) {
    // Modal State Logic (Duplicated from MembersView for full functionality)
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMember, setEditingMember] = useState<any>(null);
    const [modalMode, setModalMode] = useState<'create' | 'edit' | 'renew'>('create');

    // Real-time Stats State
    const [realtimeStats, setRealtimeStats] = useState(dailyStats || { revenue: 0, visitsCount: 0, transactions: [] });

    // Polling Effect for Real-time Updates (every 5 seconds)
    useEffect(() => {
        const interval = setInterval(async () => {
            try {
                const freshStats = await getDailyStats();
                setRealtimeStats(freshStats);
            } catch (error) {
                console.error("Failed to fetch real-time stats:", error);
            }
        }, 5000);

        return () => clearInterval(interval);
    }, []);

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
    const dailyRevenue = realtimeStats?.revenue || 0;

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
                    <h2 className="text-2xl font-bold text-gray-900">Xayrli kech Admin</h2>
                </div>

                {/* Main Action Cards & Stats (Row 1) */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Add Member Card */}
                    <div onClick={openAddModal} className="cursor-pointer bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex flex-col items-center justify-center h-40 group">
                        <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                            <span className="text-2xl font-bold">+</span>
                        </div>
                        <h3 className="font-bold text-blue-500">A'zo qo'shish</h3>
                    </div>

                    {/* New Members */}
                    <Link href="/members" className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center justify-center h-40 hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mb-2">
                            <Users className="w-6 h-6" />
                        </div>
                        <div className="text-3xl font-black text-gray-900">{newMembersCount}</div>
                        <h3 className="text-xs font-bold text-gray-500">Yangi A'zolar</h3>
                    </Link>

                    {/* Visits Today */}
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center justify-center h-40">
                        <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center mb-2">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                        <div className="text-3xl font-black text-gray-900">{realtimeStats.visitsCount || 0}</div>
                        <h3 className="text-xs font-bold text-gray-500">Bugungi Tashriflar</h3>
                    </div>

                    {/* Member Visits */}
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center justify-center h-40">
                        <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-2">
                            <TrendingUp className="w-6 h-6 rotate-180" />
                        </div>
                        <div className="text-3xl font-black text-gray-900">4</div>
                        <h3 className="text-xs font-bold text-gray-500">A'zolar Tashrifi</h3>
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
            {isIncomeModalOpen && realtimeStats && (
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
                                <span className="text-2xl font-bold text-violet-600">{realtimeStats.revenue.toLocaleString()} so'm</span>
                            </div>

                            <div className="space-y-2">
                                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">To'lovlar Ro'yxati</h3>
                                {realtimeStats.transactions && realtimeStats.transactions.length > 0 ? (
                                    realtimeStats.transactions.map((tx: any) => (
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
