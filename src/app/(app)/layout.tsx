import AppHeader from "@/components/AppHeader";

export default function AppGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh w-full flex-col">
      <AppHeader />
      <main className="flex-1">{children}</main>
    </div>
  );
}
