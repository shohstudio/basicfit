import Dashboard from "./components/Dashboard";
import { getMembers } from "./actions";

export const dynamic = 'force-dynamic';

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; action?: string }>;
}) {
  const params = await searchParams; // Next.js 15+ needs await for searchParams
  const query = params.q || "";
  const action = params.action || "";
  const members = await getMembers(query);

  return <Dashboard members={members} search={query} action={action} />;
}
