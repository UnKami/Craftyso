import { requireTabAccess } from "@/lib/auth/require-admin";
import { listAdmins } from "@/lib/firebase/admin-queries";
import { InviteAdminForm } from "@/components/admin/InviteAdminForm";
import { AdminRow } from "@/components/admin/AdminRow";

export default async function TeamPage() {
  const currentUser = await requireTabAccess("team");
  const admins = await listAdmins();

  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs font-semibold uppercase tracking-wider text-brand">
          TEAM &amp; ROLE PERMISSIONS
        </span>
        <h1 className="text-2xl font-bold text-ink">מנהלים והרשאות גישה</h1>
        <p className="mt-1 text-xs text-ink-muted">
          הזמינו מנהלים נוספים וקבעו לכל אחד בדיוק אילו לשוניות יוכל לראות ולנהל (הזמנות, מפעל, מלאי,
          מוצרים, קטגוריות ועוד).
        </p>
      </div>

      {currentUser.role === "owner" && <InviteAdminForm />}

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
