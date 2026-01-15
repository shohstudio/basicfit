import DashboardLayout from "../components/DashboardLayout";
import { getAttendance } from "../actions";
import { CalendarCheck, User, Clock, Search } from "lucide-react";
import Image from "next/image";

export const dynamic = 'force-dynamic';

export default async function AttendancePage({ searchParams }: { searchParams: { date?: string } }) {
    const dateParam = searchParams?.date ? new Date(searchParams.date) : new Date();
    const records = await getAttendance(dateParam);

    // Calculate daily stats
    const totalVisits = records.length;
    const uniqueMembers = new Set(records.map(r => r.memberId)).size;

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* HEADER & STATS */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-gray-900 uppercase italic tracking-tighter flex items-center gap-3">
                            <CalendarCheck className="w-8 h-8 text-orange-500" />
                            Davomat
                        </h1>
                        <p className="text-gray-500 font-medium">
                            {dateParam.toLocaleDateString('uz-UZ', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                    </div>

                    <div className="flex gap-4">
                        <div className="bg-white border border-gray-200 px-6 py-3 rounded-xl shadow-sm">
                            <p className="text-xs text-gray-500 uppercase font-bold">Jami Tashriflar</p>
                            <p className="text-2xl font-black text-gray-900">{totalVisits}</p>
                        </div>
                        <div className="bg-white border border-gray-200 px-6 py-3 rounded-xl shadow-sm">
                            <p className="text-xs text-gray-500 uppercase font-bold">Unikal A'zolar</p>
                            <p className="text-2xl font-black text-orange-500">{uniqueMembers}</p>
                        </div>
                    </div>
                </div>

                {/* DATE FILTER */}
                <div className="bg-white border border-gray-200 p-4 rounded-xl flex items-center gap-4 shadow-sm">
                    <form className="flex items-center gap-2 w-full max-w-sm">
                        <div className="relative flex-1">
                            <input
                                name="date"
                                type="date"
                                defaultValue={dateParam.toISOString().split('T')[0]}
                                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:border-orange-500 font-mono" // font-mono for numbers
                            />
                            <CalendarCheck className="absolute right-3 top-2.5 w-5 h-5 text-gray-400 pointer-events-none" />
                        </div>
                        <button type="submit" className="bg-gray-900 hover:bg-gray-800 text-white font-bold p-2.5 rounded-lg transition-colors">
                            <Search className="w-5 h-5" />
                        </button>
                    </form>
                </div>

                {/* LOGS LIST */}
                <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-500">
                            <thead className="bg-gray-50 uppercase tracking-wider text-xs font-bold text-gray-500 border-b border-gray-100">
                                <tr>
                                    <th className="p-4 w-16">#</th>
                                    <th className="p-4">A'zo</th>
                                    <th className="p-4">Kelgan Vaqti</th>
                                    <th className="p-4">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {records.map((record, index) => (
                                    <tr key={record.id} className="hover:bg-gray-50 transition-colors group">
                                        <td className="p-4 text-gray-500 font-mono">{records.length - index}</td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                {record.member.imageUrl ? (
                                                    <div className="relative w-10 h-10 rounded-full overflow-hidden border border-gray-200 group-hover:border-orange-500 transition-colors">
                                                        <img
                                                            src={record.member.imageUrl}
                                                            alt={record.member.fullName}
                                                            className="object-cover w-full h-full"
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 group-hover:text-gray-600 transition-colors">
                                                        <User className="w-5 h-5" />
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="font-bold text-gray-900 group-hover:text-orange-600 transition-colors">{record.member.fullName}</p>
                                                    <p className="text-xs text-gray-500">{record.member.phone}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2 font-mono text-gray-600">
                                                <Clock className="w-4 h-4 text-gray-400" />
                                                {record.checkIn.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className="px-2 py-1 rounded text-xs font-bold uppercase bg-green-50 text-green-600 border border-green-100">
                                                Keldi
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {records.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="p-12 text-center text-gray-500">
                                            <div className="flex flex-col items-center gap-2">
                                                <CalendarCheck className="w-12 h-12 text-gray-300" />
                                                <p className="font-medium">Bu kunda tashriflar qayd etilmagan</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
