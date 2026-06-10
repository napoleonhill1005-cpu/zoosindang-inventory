import { requireSession } from "@/lib/auth-guard";
import HistoryView from "@/components/HistoryView";

export default async function HistoryPage() {
  await requireSession();

  return (
    <div className="flex flex-col">
      <h1 className="px-4 pt-4 text-lg font-bold">기록 조회</h1>
      <HistoryView />
    </div>
  );
}
