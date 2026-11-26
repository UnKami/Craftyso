"use client";

import { useState, useTransition, type FormEvent } from "react";
import type { Category } from "@/lib/types";
import {
  createCategoryAction,
  deleteCategoryAction,
  updateCategoryAction,
} from "@/app/admin/(dashboard)/categories/actions";

export function CategoriesManager({
  categories,
  productCounts,
}: {
  categories: Category[];
  productCounts: Record<string, number>;
}) {
  const [pending, startTransition] = useTransition();
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [newForm, setNewForm] = useState({
    name: "",
    slug: "",
    description: "",
    imageUrl: "",
    order: categories.length + 1,
  });

  const [editForm, setEditForm] = useState({
    name: "",
    slug: "",
    description: "",
    imageUrl: "",
    order: 0,
  });

  function startEdit(cat: Category) {
    setError(null);
    setEditingId(cat.id);
    setEditForm({
      name: cat.name,
      slug: cat.slug,
      description: cat.description ?? "",
      imageUrl: cat.imageUrl ?? "",
      order: cat.order ?? 0,
    });
  }

  function handleCreate(e: FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await createCategoryAction(newForm);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setNewForm({
        name: "",
        slug: "",
        description: "",
        imageUrl: "",
        order: categories.length + 2,
      });
      setShowAdd(false);
    });
  }

  function handleUpdate(id: string) {
    setError(null);
    startTransition(async () => {
      const res = await updateCategoryAction({ id, ...editForm });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setEditingId(null);
    });
  }

  function handleDelete(cat: Category) {
    const count = productCounts[cat.id] ?? 0;
    const msg =
      count > 0
        ? `לקטגוריה "${cat.name}" משויכים ${count} מוצרים. למחוק אותה בכל זאת?`
        : `למחוק את הקטגוריה "${cat.name}"?`;
    if (!window.confirm(msg)) return;

    setError(null);
    startTransition(async () => {
      const res = await deleteCategoryAction(cat.id);
      if (!res.ok) setError(res.error);
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-brand">
            CATALOG TAXONOMY
          </span>
          <h1 className="text-2xl font-bold text-ink">ניהול קטגוריות ({categories.length})</h1>
        </div>
        <button
          type="button"
          onClick={() => {
            setShowAdd((v) => !v);
            setError(null);
          }}
          className="rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-dark"
        >
          {showAdd ? "סגירה" : "+ הוספת קטגוריה"}
        </button>
      </div>

      {error && (
        <p role="alert" className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
          {error}
        </p>
      )}

      {showAdd && (
        <form
          onSubmit={handleCreate}
          className="grid gap-3 rounded-2xl border border-brand/40 bg-surface p-5 sm:grid-cols-2"
        >
          <input
            required
            placeholder="שם הקטגוריה (לדוגמה: פאצ'ים רקומים)"
            value={newForm.name}
            onChange={(e) => setNewForm({ ...newForm, name: e.target.value })}
            className="rounded-xl border border-border bg-surface-muted px-3.5 py-2 text-sm text-ink outline-none focus:border-brand"
          />
          <input
            required
            placeholder="כתובת באנגלית / Slug (לדוגמה: embroidered-patches)"
            value={newForm.slug}
            onChange={(e) => setNewForm({ ...newForm, slug: e.target.value })}
            className="rounded-xl border border-border bg-surface-muted px-3.5 py-2 text-sm text-ink outline-none focus:border-brand"
          />
          <input
            placeholder="קישור לתמונת קטגוריה (אופציונלי)"
            value={newForm.imageUrl}
            onChange={(e) => setNewForm({ ...newForm, imageUrl: e.target.value })}
            className="rounded-xl border border-border bg-surface-muted px-3.5 py-2 text-sm text-ink outline-none focus:border-brand"
          />
          <input
            type="number"
            placeholder="סדר תצוגה"
            value={newForm.order}
            onChange={(e) => setNewForm({ ...newForm, order: Number(e.target.value) })}
            className="rounded-xl border border-border bg-surface-muted px-3.5 py-2 text-sm text-ink outline-none focus:border-brand"
          />
          <input
            placeholder="תיאור קצר (אופציונלי)"
            value={newForm.description}
            onChange={(e) => setNewForm({ ...newForm, description: e.target.value })}
            className="rounded-xl border border-border bg-surface-muted px-3.5 py-2 text-sm text-ink outline-none focus:border-brand sm:col-span-2"
          />
          <div className="sm:col-span-2 flex justify-end gap-2">
            <button
              type="submit"
              disabled={pending}
              className="rounded-xl bg-brand px-5 py-2 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:opacity-50"
            >
              {pending ? "שומר..." : "שמירת קטגוריה חדשה"}
            </button>
          </div>
        </form>
      )}

      <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
        <table className="w-full text-right text-sm">
          <thead className="border-b border-border text-ink-muted">
            <tr>
              <th className="p-3 font-medium">סדר</th>
              <th className="p-3 font-medium">שם הקטגוריה</th>
              <th className="p-3 font-medium">כתובת (Slug)</th>
              <th className="p-3 font-medium">מוצרים</th>
              <th className="p-3 font-medium">פעולות</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => {
              const isEditing = editingId === cat.id;
              return (
                <tr key={cat.id} className="border-b border-border/80 last:border-0">
                  <td className="p-3 w-20">
                    {isEditing ? (
                      <input
                        type="number"
                        value={editForm.order}
                        onChange={(e) =>
                          setEditForm({ ...editForm, order: Number(e.target.value) })
                        }
                        className="w-16 rounded-lg border border-border bg-surface-muted px-2 py-1 text-xs text-ink"
                      />
                    ) : (
                      <span className="font-mono text-xs text-ink-muted">{cat.order}</span>
                    )}
                  </td>
                  <td className="p-3">
                    {isEditing ? (
                      <div className="space-y-1.5">
                        <input
                          value={editForm.name}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          className="w-full rounded-lg border border-border bg-surface-muted px-2.5 py-1 text-xs text-ink"
                        />
                        <input
                          placeholder="תיאור"
                          value={editForm.description}
                          onChange={(e) =>
                            setEditForm({ ...editForm, description: e.target.value })
                          }
                          className="w-full rounded-lg border border-border bg-surface-muted px-2.5 py-1 text-xs text-ink"
                        />
                        <input
                          placeholder="כתובת תמונה (URL)"
                          value={editForm.imageUrl}
                          onChange={(e) => setEditForm({ ...editForm, imageUrl: e.target.value })}
                          className="w-full rounded-lg border border-border bg-surface-muted px-2.5 py-1 text-xs text-ink"
                        />
                      </div>
                    ) : (
                      <div>
                        <p className="font-medium text-ink">{cat.name}</p>
                        {cat.description && (
                          <p className="text-xs text-ink-muted">{cat.description}</p>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="p-3 font-mono text-xs text-ink-muted">
                    {isEditing ? (
                      <input
                        value={editForm.slug}
                        onChange={(e) => setEditForm({ ...editForm, slug: e.target.value })}
                        className="w-full rounded-lg border border-border bg-surface-muted px-2.5 py-1 text-xs text-ink"
                      />
                    ) : (
                      `/category/${cat.slug}`
                    )}
                  </td>
                  <td className="p-3 text-xs text-ink-muted">{productCounts[cat.id] ?? 0}</td>
                  <td className="p-3 whitespace-nowrap">
                    {isEditing ? (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          disabled={pending}
                          onClick={() => handleUpdate(cat.id)}
                          className="rounded-lg bg-brand px-3 py-1 text-xs font-semibold text-white"
                        >
                          שמור
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="rounded-lg border border-border px-3 py-1 text-xs text-ink-muted"
                        >
                          ביטול
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => startEdit(cat)}
                          className="rounded-lg border border-border px-3 py-1 text-xs text-ink-muted hover:border-brand hover:text-brand"
                        >
                          עריכה
                        </button>
                        <button
                          type="button"
                          disabled={pending}
                          onClick={() => handleDelete(cat)}
                          className="rounded-lg border border-border px-3 py-1 text-xs text-rose-400 hover:border-rose-400"
                        >
                          מחיקה
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
