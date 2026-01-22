import Dashboard from "./components/Dashboard";
import { getMembers, getDailyStats } from "./actions";

export const dynamic = 'force-dynamic';

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; action?: string }>;
}) {
  const params = await searchParams; // Next.js 15+ needs await for searchParams
  const query = params.q || "";
  const action = params.action || "";

  try {
    // Optimization: Now using server-side aggregated stats, so we don't need all members.
    // Fetch only the first page for the table view.
    // Use Promise.all to fetch data in parallel to reduce load time
    const [membersData, dailyStats] = await Promise.all([
      getMembers(query, 1, 10),
      getDailyStats()
    ]);

    const { members } = membersData;

    return <Dashboard members={members} search={query} action={action} dailyStats={dailyStats} />;
  } catch (error: any) {
    return (
      <div className="p-10 text-gray-900">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Xatolik yuz berdi (Debugging)</h1>
        <pre className="bg-gray-50 p-4 rounded overflow-auto border border-gray-200">
          {error.message}
          {'\n\n'}
          {error.stack}
        </pre>
        <p className="mt-4 text-gray-500">Ushbu xabarni Dasturchiga yuboring.</p>
      </div>
    );
  }
}
