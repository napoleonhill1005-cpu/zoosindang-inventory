// 한국시간(KST, UTC+9) 기준 날짜 계산 유틸
// 서버는 UTC로 동작하므로 "오늘"을 한국시간 기준으로 맞추기 위해 사용

const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

// KST 기준 오늘 날짜 문자열 (YYYY-MM-DD)
export function kstDateString(date: Date = new Date()): string {
  const kst = new Date(date.getTime() + KST_OFFSET_MS);
  return kst.toISOString().slice(0, 10);
}

// KST 기준 특정 날짜(YYYY-MM-DD)의 [시작, 끝) 범위를 UTC ISO 문자열로 반환
export function kstDayRangeUTC(dateStr: string): { start: string; end: string } {
  const start = new Date(`${dateStr}T00:00:00+09:00`);
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
  return { start: start.toISOString(), end: end.toISOString() };
}

// KST 기준 "MM/DD HH:mm" 형식으로 표시
export function formatKstDateTime(iso: string): string {
  const d = new Date(new Date(iso).getTime() + KST_OFFSET_MS);
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  const hh = String(d.getUTCHours()).padStart(2, "0");
  const mi = String(d.getUTCMinutes()).padStart(2, "0");
  return `${mm}/${dd} ${hh}:${mi}`;
}
