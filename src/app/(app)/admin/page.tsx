import Link from "next/link";
import { requireAdminSession } from "@/lib/auth-guard";
import { isAdminVerified } from "@/lib/session";
import AdminPinForm from "@/components/AdminPinForm";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  await requireAdminSession();
  const verified = await isAdminVerified();

  if (!verified) {
    return (
      <div className="flex flex-col items-center gap-6 p-8">
        <h1 className="text-lg font-bold">관리자 확인</h1>
        <p className="text-sm text-gray-500">계속하려면 PIN을 다시 입력해주세요</p>
        <AdminPinForm />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 p-4">
      <h1 className="text-lg font-bold">관리자 설정</h1>
      <Link
        href="/admin/items"
        className="rounded-xl border border-gray-200 bg-white p-4 font-medium shadow-sm"
      >
        품목 관리
      </Link>
      <Link
        href="/admin/users"
        className="rounded-xl border border-gray-200 bg-white p-4 font-medium shadow-sm"
      >
        직원 관리
      </Link>
    </div>
  );
}
