import MembersView from "../components/MembersView";
import { getMembers } from "../actions";

export const dynamic = 'force-dynamic';

export default async function MembersPage({
    searchParams,
}: {
    searchParams: Promise<{ q?: string; page?: string }>;
}) {
    const params = await searchParams;
    const query = params.q || "";
    const page = parseInt(params.page || "1", 10) || 1;

    const { members, totalPages, currentPage, totalMembers } = await getMembers(query, page);

    return (
        <MembersView
            members={members}
            search={query}
            totalPages={totalPages}
            currentPage={currentPage}
            totalMembers={totalMembers}
        />
    );
}
