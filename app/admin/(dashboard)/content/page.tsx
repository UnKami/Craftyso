import { listContentPages } from "@/lib/firebase/admin-queries";
import { AddContentForm } from "@/components/admin/AddContentForm";

export default async function ContentPagesAdmin() {
  const pages = await listContentPages();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-ink">תוכן</h1>
        <AddContentForm />
      </div>

      {pages.length === 0 ? (
        <p className="text-ink-muted">אין עדיין עמודי תוכן.</p>
      ) : (
        <ul className="divide-y divide-border rounded-2xl border border-border bg-surface">
          {pages.map((p) => (
            <li key={p.id} className="flex items-center justify-between p-4">
              <div>
                <p className="font-medium text-ink">{p.title}</p>
                <p className="text-xs text-ink-muted">/{p.slug} · {p.type === "blog_post" ? "פוסט בלוג" : "עמוד"}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
