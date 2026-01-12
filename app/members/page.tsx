import MembersView from "../components/MembersView";
import { getMembers } from "../actions";

export default async function MembersPage({
    searchParams,
}: {
    searchParams: Promise<{ q?: string }>;
}) {
    const params = await searchParams;
    const query = params.q || "";
    const members = await getMembers(query);

    return <MembersView members={members} search={query} />;
}
