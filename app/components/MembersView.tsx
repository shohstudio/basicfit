"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import MemberList from "./MemberList";
import MemberForm from "./MemberForm";
import DashboardLayout from "./DashboardLayout";
import Pagination from "./Pagination";

export default function MembersView({ members, search, totalPages, currentPage, totalMembers }: { members: any[], search: string, totalPages: number, currentPage: number, totalMembers: number }) {
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
            <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm">
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <div>
                        <h3 className="text-3xl font-black text-gray-900 italic tracking-tight">A'ZOLAR RO'YXATI</h3>
                        <p className="text-gray-500 text-sm mt-1">Jami a'zolar: {totalMembers}</p>
                    </div>
                    <div className="flex gap-4 w-full md:w-auto">
                        <div className="relative group flex-1 md:w-64">
                            <input
                                type="text"
                                placeholder="Ism yoki telefon orqali qidirish..."
                                defaultValue={search}
                                onChange={handleSearch}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 pl-10 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                            />
                            <div className="absolute left-3 top-3.5 text-gray-400 group-focus-within:text-blue-500 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                        </div>
                        <button
                            onClick={openAddModal}
                            className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-xl text-sm font-bold uppercase tracking-wider shadow-lg shadow-gray-900/10 transition-all active:scale-95"
                        >
                            + Qo'shish
                        </button>
                    </div>
                </div>
                <MemberList members={members} onEdit={openEditModal} onRenew={openRenewModal} />

                <Pagination totalPages={totalPages} currentPage={currentPage} />
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
