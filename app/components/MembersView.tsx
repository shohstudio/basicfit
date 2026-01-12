"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import MemberList from "./MemberList";
import MemberForm from "./MemberForm";
import DashboardLayout from "./DashboardLayout";

export default function MembersView({ members, search }: { members: any[], search: string }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMember, setEditingMember] = useState<any>(null);
    const [modalMode, setModalMode] = useState<'create' | 'edit' | 'renew'>('create');
    const router = useRouter();

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        router.push(`/members?q=${val}`);
    };

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

    return (
        <DashboardLayout>
            <div className="bg-zinc-900/90 backdrop-blur-xl rounded-3xl p-8 border border-white/5 shadow-2xl">
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <div>
                        <h3 className="text-3xl font-black text-white italic tracking-tight">A'ZOLAR RO'YXATI</h3>
                        <p className="text-zinc-400 text-sm mt-1">Jami a'zolar: {members.length}</p>
                    </div>
                    <div className="flex gap-4 w-full md:w-auto">
                        <div className="relative group flex-1 md:w-64">
                            <input
                                type="text"
                                placeholder="Ism yoki telefon orqali qidirish..."
                                defaultValue={search}
                                onChange={handleSearch}
                                className="w-full bg-zinc-800/50 border border-white/10 rounded-xl px-4 py-3 pl-10 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all font-medium"
                            />
                            <div className="absolute left-3 top-3.5 text-zinc-500 group-focus-within:text-cyan-400 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                        </div>
                        <button
                            onClick={openAddModal}
                            className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white px-6 py-3 rounded-xl text-sm font-bold uppercase tracking-wider shadow-lg shadow-blue-500/20 hover:shadow-cyan-500/30 transition-all active:scale-95"
                        >
                            + Qo'shish
                        </button>
                    </div>
                </div>
                <MemberList members={members} onEdit={openEditModal} onRenew={openRenewModal} />
            </div>

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
