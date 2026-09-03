import { listSocialPosts } from "@/lib/firebase/admin-queries";
import { AddSocialPostForm } from "@/components/admin/AddSocialPostForm";

const PLATFORM_LABEL: Record<string, string> = {
  facebook: "Facebook",
  instagram: "Instagram",
  tiktok: "TikTok",
  other: "אחר",
};

export default async function SocialPage() {
  const posts = await listSocialPosts();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-ink">רשתות חברתיות</h1>
        <AddSocialPostForm />
      </div>

      <p className="mb-4 text-sm text-ink-muted">
        לוח תכנון ידני כרגע. פרסום אוטומטי ל-Facebook/Instagram דורש אישור אפליקציית Meta
        Business ו-Access Token לעמוד העסקי.
      </p>

      {posts.length === 0 ? (
        <p className="text-ink-muted">אין עדיין פוסטים מתוכננים.</p>
      ) : (
        <ul className="divide-y divide-border rounded-2xl border border-border bg-surface">
          {posts.map((p) => (
            <li key={p.id} className="flex items-center justify-between p-4">
              <div>
                <p className="font-medium text-ink">{PLATFORM_LABEL[p.platform] ?? p.platform}</p>
                <p className="line-clamp-1 text-xs text-ink-muted">{p.caption}</p>
              </div>
              <span className="rounded-full bg-surface-muted px-3 py-1 text-xs text-ink-muted">
                {p.status}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
