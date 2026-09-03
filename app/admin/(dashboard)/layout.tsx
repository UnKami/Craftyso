import { requireAdmin } from "@/lib/auth/require-admin";
import { Sidebar } from "@/components/admin/Sidebar";

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <Sidebar email={user.email} />
      <main className="flex-1 bg-surface-muted p-4 md:p-8">{children}</main>
    </div>
  );
}
