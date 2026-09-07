"use client";

import { useState } from "react";
import type { ProductSpec } from "@/lib/types";
import { DEFAULT_SHIPPING_NOTE } from "@/lib/constants";

export function ProductTabs({
  description,
  specs,
  shippingNote,
}: {
  description?: string;
  specs?: ProductSpec[];
  shippingNote?: string;
}) {
  const [activeTab, setActiveTab] = useState<"description" | "specs" | "shipping">("description");
  const hasSpecs = Boolean(specs && specs.length > 0);

  return (
    <div className="mt-8 rounded-2xl border border-[#2d2118] bg-[#140e0b] overflow-hidden">
      {/* Tab Navigation */}
      <div className="flex border-b border-[#2d2118] bg-[#0f0a07]">
        <button
          type="button"
          onClick={() => setActiveTab("description")}
          className={`flex-1 py-3 px-4 text-xs font-semibold sm:text-sm transition-colors border-b-2 ${
            activeTab === "description"
              ? "border-[#c59b5f] text-[#eed3a2] bg-[#18110c]"
              : "border-transparent text-[#aa9c8d] hover:text-[#f3ede2]"
          }`}
        >
          ✦ תיאור המוצר
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("specs")}
          className={`flex-1 py-3 px-4 text-xs font-semibold sm:text-sm transition-colors border-b-2 ${
            activeTab === "specs"
              ? "border-[#c59b5f] text-[#eed3a2] bg-[#18110c]"
              : "border-transparent text-[#aa9c8d] hover:text-[#f3ede2]"
          }`}
        >
          ✦ מפרט המוצר
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("shipping")}
          className={`flex-1 py-3 px-4 text-xs font-semibold sm:text-sm transition-colors border-b-2 ${
            activeTab === "shipping"
              ? "border-[#c59b5f] text-[#eed3a2] bg-[#18110c]"
              : "border-transparent text-[#aa9c8d] hover:text-[#f3ede2]"
          }`}
        >
          ✦ משלוחים והחזרות
        </button>
      </div>

      {/* Tab Content */}
      <div className="p-5 sm:p-6 text-sm leading-relaxed text-[#c7b9a8]">
        {activeTab === "description" &&
          (description ? (
            <p className="whitespace-pre-line">{description}</p>
          ) : (
            <p className="text-[#8a7b6b]">אין עדיין תיאור למוצר זה.</p>
          ))}

        {activeTab === "specs" &&
          (hasSpecs ? (
            <dl className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
              {specs!.map((s, i) => (
                <div key={i} className="flex items-baseline justify-between gap-3 border-b border-[#2d2118] py-1.5">
                  <dt className="text-xs text-[#aa9c8d]">{s.label}</dt>
                  <dd className="text-sm font-medium text-[#f3ede2]">{s.value}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="text-[#8a7b6b]">אין עדיין מפרט מפורט למוצר זה.</p>
          ))}

        {activeTab === "shipping" && (
          <p className="whitespace-pre-line">{shippingNote?.trim() || DEFAULT_SHIPPING_NOTE}</p>
        )}
      </div>
    </div>
  );
}
