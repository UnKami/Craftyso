import { listLeads } from "@/lib/firebase/admin-queries";
import { LeadStatusSelect } from "@/components/admin/LeadStatusSelect";
import { AddLeadForm } from "@/components/admin/AddLeadForm";

const SOURCE_LABEL: Record<string, string> = {
  newsletter: "ניוזלטר",
  contact_form: "טופס יצירת קשר",
  manual: "הוזן ידנית",
  other: "אחר",
};

export default async function LeadsPage() {
  const leads = await listLeads();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-ink">לידים</h1>
        <AddLeadForm />
      </div>

      {leads.length === 0 ? (
        <p className="text-ink-muted">אין עדיין לידים.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
          <table className="w-full text-sm">
            <thead className="border-b border-border text-right text-ink-muted">
              <tr>
                <th className="p-3 font-medium">שם</th>
                <th className="p-3 font-medium">אימייל</th>
                <th className="p-3 font-medium">טלפון</th>
                <th className="p-3 font-medium">מקור</th>
                <th className="p-3 font-medium">סטטוס</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id} className="border-b border-border last:border-0">
                  <td className="p-3">{lead.name || "—"}</td>
                  <td className="p-3">{lead.email || "—"}</td>
                  <td className="p-3">{lead.phone || "—"}</td>
                  <td className="p-3">{SOURCE_LABEL[lead.source] ?? lead.source}</td>
                  <td className="p-3">
                    <LeadStatusSelect leadId={lead.id} status={lead.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
