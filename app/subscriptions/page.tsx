import { getAllSubscriptions } from "../actions";
import DashboardLayout from "../components/DashboardLayout";
import Pagination from "../components/Pagination";



export default async function SubscriptionsPage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string }>;
}) {
    const params = await searchParams;
    const page = parseInt(params.page || "1", 10) || 1;
    const { subscriptions, totalPages, currentPage, totalSubscriptions } = await getAllSubscriptions(page);

    return (
        <DashboardLayout>
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Obunalar</h1>
                        <p className="text-gray-500 text-sm mt-1">Jami obunalar: {totalSubscriptions}</p>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase text-gray-500 font-bold tracking-wider">
                                <th className="px-6 py-4">Foydalanuvchi</th>
                                <th className="px-6 py-4">Ta'rifi</th>
                                <th className="px-6 py-4">Narxi</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Ro'yxatdan O'tgan</th>
                                <th className="px-6 py-4">Keyingi To'lov</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {subscriptions.length > 0 ? (
                                subscriptions.map((sub) => (
                                    <tr key={sub.id} className="hover:bg-gray-50/50 transition-colors">
                                        {/* User Name & Image */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center">
                                                    {sub.memberImage ? (
                                                        <img src={sub.memberImage} alt={sub.memberName} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="text-gray-500 font-bold text-xs">{sub.memberName.charAt(0)}</span>
                                                    )}
                                                </div>
                                                <span className="font-bold text-gray-900 text-sm">{sub.memberName}</span>
                                            </div>
                                        </td>

                                        {/* Plan */}
                                        <td className="px-6 py-4">
                                            <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold border border-blue-100 uppercase">
                                                {sub.plan}
                                            </span>
                                        </td>

                                        {/* Price */}
                                        <td className="px-6 py-4 font-mono font-bold text-gray-700">
                                            {sub.price.toLocaleString()} so'm
                                        </td>

                                        {/* Status */}
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${sub.status === 'ACTIVE'
                                                ? 'bg-green-50 text-green-700 border-green-100'
                                                : 'bg-red-50 text-red-700 border-red-100'
                                                }`}>
                                                {sub.status === 'ACTIVE' ? 'Faol' : 'Tugagan'}
                                            </span>
                                        </td>

                                        {/* Start Date */}
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {new Date(sub.startDate).toLocaleDateString()}
                                        </td>

                                        {/* End Date */}
                                        <td className="px-6 py-4 text-sm font-bold text-gray-900">
                                            {new Date(sub.endDate).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="text-center py-12 text-gray-500">
                                        Hozircha obunalar yo'q
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="p-4 border-t border-gray-200">
                    <Pagination totalPages={totalPages} currentPage={currentPage} />
                </div>
            </div>
        </DashboardLayout>
    );
}
