import { requireAdmin } from "@/lib/auth/require-admin";
import { listAdmins } from "@/lib/firebase/admin-queries";
import { InviteAdminForm } from "@/components/admin/InviteAdminForm";
import { AdminRow } from "@/components/admin/AdminRow";

export default async function TeamPage() {
  const currentUser = await requireAdmin();
  const admins = await listAdmins();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-ink">צוות</h1>
        {currentUser.role === "owner" && <InviteAdminForm />}
      </div>

      {currentUser.role !== "owner" && (
        <p className="mb-4 text-sm text-ink-muted">
          רק בעלים (Owner) יכולים להוסיף, להסיר או לשנות הרשאות של מנהלים.
        </p>
      )}

      <ul className="divide-y divide-border rounded-2xl border border-border bg-surface">
        {admins.map((admin) => (
          <AdminRow
            key={admin.uid}
            admin={admin}
            isSelf={admin.uid === currentUser.uid}
            canManage={currentUser.role === "owner"}
          />
        ))}
      </ul>
    </div>
  );
}
