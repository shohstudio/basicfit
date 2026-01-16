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
                    <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider font-bold border-b border-gray-100">
                        <th className="p-4">To'liq Ism</th>
                        <th className="p-4">Telefon</th>
                        <th className="p-4">Holat</th>
                        <th className="p-4">Ro'yxatga Olingan</th>
                        <th className="p-4 text-right">Amallar</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {members.length === 0 ? (
                        <tr>
                            <td colSpan={5} className="p-8 text-center text-gray-500">
                                A'zolar topilmadi
                            </td>
                        </tr>
                    ) : (
                        members.map((member) => (
                            <tr key={member.id} className="group hover:bg-gray-50 transition-colors duration-200">
                                <td className="p-4 text-gray-900 font-bold flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-blue-600 flex items-center justify-center text-xs font-bold text-white shadow-sm">
                                        {member.fullName.charAt(0)}
                                    </div>
                                    <div className="flex flex-col">
                                        <span>{member.fullName}</span>
                                        <span
                                            className="text-[10px] text-gray-400 font-mono cursor-pointer hover:text-blue-500 transition-colors"
                                            onClick={() => {
                                                const shortId = member.id.substring(0, 8);
                                                navigator.clipboard.writeText(shortId);
                                                alert("Qisqa ID nusxalandi: " + shortId);
                                            }}
                                            title="Nusxalash uchun bosing"
                                        >
                                            ID: {member.id.substring(0, 8)}
                                        </span>
                                    </div>
                                </td>
                                <td className="p-4 text-gray-500 font-mono text-sm font-medium">{member.phone}</td>
                                <td className="p-4">
                                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${member.status?.toUpperCase() === "ACTIVE"
                                        ? "bg-green-50 text-green-600 border-green-200"
                                        : "bg-red-50 text-red-600 border-red-200"
                                        }`}>
                                        {member.status === "ACTIVE" ? "Faol" : "Nofaol"}
                                    </span>
                                </td>
                                <td className="p-4 text-sm text-gray-500 font-medium">
                                    {member.createdAt ? new Date(member.createdAt).toLocaleDateString() : "-"}
                                </td>
                                <td className="p-4 flex justify-end gap-2">
                                    <button
                                        onClick={() => onRenew(member)}
                                        className="p-2 bg-green-50 text-green-600 hover:bg-green-100 rounded-lg transition-colors border border-green-100 hover:border-green-200"
                                        title="Obunani Yangilash / Uzaytirish"
                                    >
                                        <RefreshCcw className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => onEdit(member)}
                                        className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors border border-blue-100 hover:border-blue-200"
                                        title="Tahrirlash"
                                    >
                                        <Pencil className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => setQrMember(member)}
                                        className="p-2 bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors border border-gray-100 hover:border-gray-200"
                                        title="QR Kod"
                                    >
                                        <QrCode className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => deleteMember(member.id)}
                                        className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors border border-red-100 hover:border-red-200"
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
                    <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 relative animate-in fade-in zoom-in duration-200">
                        <button
                            onClick={() => setQrMember(null)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <h3 className="text-lg font-bold mb-6 text-center text-gray-900">A'zo QR Kodi</h3>
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
