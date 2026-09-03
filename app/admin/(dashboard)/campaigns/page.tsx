import { listCampaigns } from "@/lib/firebase/admin-queries";
import { AddCampaignForm } from "@/components/admin/AddCampaignForm";

const CHANNEL_LABEL: Record<string, string> = {
  google_ads: "Google Ads",
  meta_ads: "Meta Ads",
  email: "אימייל",
  social: "רשתות חברתיות",
  other: "אחר",
};

export default async function CampaignsPage() {
  const campaigns = await listCampaigns();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-ink">קמפיינים</h1>
        <AddCampaignForm />
      </div>

      <p className="mb-4 text-sm text-ink-muted">
        מעקב ידני + קישורי UTM כרגע. סנכרון חי מול Google/Meta Ads דורש חיבור API עתידי לחשבונות
        הפרסום.
      </p>

      {campaigns.length === 0 ? (
        <p className="text-ink-muted">אין עדיין קמפיינים.</p>
      ) : (
        <ul className="divide-y divide-border rounded-2xl border border-border bg-surface">
          {campaigns.map((c) => (
            <li key={c.id} className="flex items-center justify-between p-4">
              <div>
                <p className="font-medium text-ink">{c.name}</p>
                <p className="text-xs text-ink-muted">{CHANNEL_LABEL[c.channel] ?? c.channel}</p>
              </div>
              <span className="rounded-full bg-surface-muted px-3 py-1 text-xs text-ink-muted">
                {c.status}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
