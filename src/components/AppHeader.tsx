import Link from "next/link";
import { getSession } from "@/lib/session";

export default async function AppHeader() {
  const session = await getSession();
  if (!session) return null;

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3">
      <Link href="/" className="text-base font-bold">
        주신당 재고관리
      </Link>
      <div className="text-sm text-gray-500">
        {session.name}님 사용 중 ·{" "}
        <Link href="/login" className="text-blue-600">
          변경
        </Link>
      </div>
    </header>
  );
}
