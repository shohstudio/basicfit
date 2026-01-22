import { getMonthlyReportStats, sendMonthlyReport } from "../actions";
import DashboardLayout from "../components/DashboardLayout";
import { Users, ClipboardList, CreditCard, CalendarCheck, Send, CheckCircle, AlertTriangle } from "lucide-react";
import SendButton from "./SendButton";

export const dynamic = 'force-dynamic';

export default async function ReportsPage() {
    const stats = await getMonthlyReportStats();

    return (
        <DashboardLayout>
            <div className="space-y-8">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Oylik Hisobot</h2>
                        <p className="text-gray-500">Joriy oy uchun ko'rsatkichlar: {stats.monthName}</p>
                    </div>
                </div>

                {/* Report Preview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <ReportCard
                        title="Yangi A'zolar"
                        value={stats.newMembers}
                        icon={Users}
                        color="text-blue-600"
                        bg="bg-blue-100"
                    />
                    <ReportCard
                        title="Yangi Obunalar"
                        value={stats.subscriptionCount}
                        icon={ClipboardList}
                        color="text-green-600"
                        bg="bg-green-100"
                    />
                    <ReportCard
                        title="Jami Tushum"
                        value={`${stats.totalRevenue.toLocaleString()} so'm`}
                        icon={CreditCard}
                        color="text-violet-600"
                        bg="bg-violet-100"
                    />
                    <ReportCard
                        title="Jami Tashriflar"
                        value={stats.totalVisits}
                        icon={CalendarCheck}
                        color="text-orange-600"
                        bg="bg-orange-100"
                    />
                </div>

                {/* Action Section */}
                <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm flex flex-col items-center text-center space-y-6 max-w-2xl mx-auto">
                    <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
                        <Send className="w-8 h-8 text-blue-600" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-gray-900">Telegramga yuborish</h3>
                        <p className="text-gray-500 mt-2 max-w-sm mx-auto">
                            Ushbu ma'lumotlarni Telegram bot orqali rahbarlarga yuboring. Hisobotda yuqoridagi barcha ko'rsatkichlar aks etadi.
                        </p>
                    </div>

                    <form action={async () => {
                        "use server";
                        await sendMonthlyReport();
                    }}>
                        <SendButton />
                    </form>
                </div>
            </div>
        </DashboardLayout>
    );
}

function ReportCard({ title, value, icon: Icon, color, bg }: any) {
    return (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${bg}`}>
                <Icon className={`w-6 h-6 ${color}`} />
            </div>
            <div>
                <p className="text-sm font-medium text-gray-500">{title}</p>
                <p className="text-xl font-bold text-gray-900">{value}</p>
            </div>
        </div>
    );
}
