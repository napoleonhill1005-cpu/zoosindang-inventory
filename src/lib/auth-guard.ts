import "server-only";

import { redirect } from "next/navigation";
import { getSession, isAdminVerified, type SessionPayload } from "./session";

// 서버 컴포넌트(페이지)에서 사용 — 비로그인 시 /login으로 이동
export async function requireSession(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}

// 서버 컴포넌트(페이지)에서 사용 — admin이 아니면 홈으로 이동
export async function requireAdminSession(): Promise<SessionPayload> {
  const session = await requireSession();
  if (session.role !== "admin") redirect("/");
  return session;
}

// 관리자 설정(/admin/**) 페이지에서 사용 — PIN 재확인 안 됐으면 /admin(재확인 화면)로 이동
export async function requireAdminVerified(): Promise<SessionPayload> {
  const session = await requireAdminSession();
  const verified = await isAdminVerified();
  if (!verified) redirect("/admin");
  return session;
}
