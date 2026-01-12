"use client";

import { Trash2, QrCode, Pencil, X, RefreshCcw } from "lucide-react";
import { useState } from "react";
import { deleteMember } from "../actions";
import MemberQRCode from "./MemberQRCode";

type Member = {
    id: string;
    fullName: string;
    email: string | null;
    phone: string;
    status: string;
    createdAt: Date;
};

export default function MemberList({ members, onEdit, onRenew }: { members: any[], onEdit: (member: any) => void, onRenew: (member: any) => void }) {
    const [qrMember, setQrMember] = useState<any>(null);

    return (
        <div className="overflow-x-auto rounded-xl">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-black/20 text-zinc-400 text-xs uppercase tracking-wider font-semibold border-b border-white/5">
                        <th className="p-4">To'liq Ism</th>
                        <th className="p-4">Telefon</th>
                        <th className="p-4">Holat</th>
                        <th className="p-4">Ro'yxatga Olingan</th>
                        <th className="p-4 text-right">Amallar</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                    {members.length === 0 ? (
                        <tr>
                            <td colSpan={5} className="p-8 text-center text-zinc-500">
                                A'zolar topilmadi
                            </td>
                        </tr>
                    ) : (
                        members.map((member) => (
                            <tr key={member.id} className="group hover:bg-white/5 transition-colors duration-200">
                                <td className="p-4 text-white font-medium flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-xs font-bold text-white">
                                        {member.fullName.charAt(0)}
                                    </div>
                                    <div className="flex flex-col">
                                        <span>{member.fullName}</span>
                                        <span
                                            className="text-[10px] text-zinc-500 font-mono cursor-pointer hover:text-blue-400 transition-colors"
                                            onClick={() => {
                                                navigator.clipboard.writeText(member.id);
                                                alert("ID nusxalandi: " + member.id);
                                            }}
                                            title="Nusxalash uchun bosing"
                                        >
                                            ID: {member.id.substring(0, 8)}...
                                        </span>
                                    </div>
                                </td>
                                <td className="p-4 text-zinc-400 font-mono text-sm">{member.phone}</td>
                                <td className="p-4">
                                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${member.status?.toUpperCase() === "ACTIVE"
                                        ? "bg-green-500/10 text-green-400 border-green-500/20 shadow-[0_0_10px_rgba(74,222,128,0.1)]"
                                        : "bg-red-500/10 text-red-400 border-red-500/20"
                                        }`}>
                                        {member.status === "ACTIVE" ? "Faol" : "Nofaol"}
                                    </span>
                                </td>
                                <td className="p-4 text-sm text-zinc-500">
                                    {member.createdAt ? new Date(member.createdAt).toLocaleDateString() : "-"}
                                </td>
                                <td className="p-4 flex justify-end gap-2">
                                    {member.status !== "ACTIVE" && (
                                        <button
                                            onClick={() => onRenew(member)}
                                            className="p-2 bg-green-500/10 text-green-500 hover:bg-green-500/20 rounded-lg transition-colors border border-transparent hover:border-green-500/30"
                                            title="Obunani Yangilash"
                                        >
                                            <RefreshCcw className="w-4 h-4" />
                                        </button>
                                    )}
                                    <button
                                        onClick={() => onEdit(member)}
                                        className="p-2 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors border border-transparent hover:border-blue-500/30"
                                        title="Tahrirlash"
                                    >
                                        <Pencil className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => setQrMember(member)}
                                        className="p-2 bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white rounded-lg transition-colors border border-transparent hover:border-white/20"
                                        title="QR Kod"
                                    >
                                        <QrCode className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => deleteMember(member.id)}
                                        className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg transition-colors border border-transparent hover:border-red-500/30"
                                        title="O'chirish"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>

            {qrMember && (
                <div className="fixed inset-0 bg-black/60 flex items-start justify-center pt-24 p-4 z-[100] backdrop-blur-sm">
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl max-w-sm w-full p-6 relative">
                        <button
                            onClick={() => setQrMember(null)}
                            className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <h3 className="text-lg font-bold mb-6 text-center dark:text-white">A'zo QR Kodi</h3>
                        <MemberQRCode
                            memberId={qrMember.id}
                            name={qrMember.fullName}
                            onClose={() => setQrMember(null)}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
