"use client";

import { useState } from "react";

export function ProductTabs({ description }: { description?: string }) {
  const [activeTab, setActiveTab] = useState<"instructions" | "specs" | "shipping">("instructions");

  return (
    <div className="mt-8 rounded-2xl border border-[#2d2118] bg-[#140e0b] overflow-hidden">
      {/* Tab Navigation */}
      <div className="flex border-b border-[#2d2118] bg-[#0f0a07]">
        <button
          type="button"
          onClick={() => setActiveTab("instructions")}
          className={`flex-1 py-3 px-4 text-xs font-semibold sm:text-sm transition-colors border-b-2 ${
            activeTab === "instructions"
              ? "border-[#c59b5f] text-[#eed3a2] bg-[#18110c]"
              : "border-transparent text-[#aa9c8d] hover:text-[#f3ede2]"
          }`}
        >
          ✦ הוראות שימוש ויישום
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
          ✦ מפרט ואיכות החומר
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
          ✦ משלוחים ואחריות
        </button>
      </div>

      {/* Tab Content */}
      <div className="p-5 sm:p-6 text-sm leading-relaxed text-[#c7b9a8]">
        {activeTab === "instructions" && (
          <div className="space-y-4">
            <h4 className="font-serif-hebrew text-base font-bold text-[#fbf8f2]">
              כיצד להשתמש ולחבר את הפריט בצורה מושלמת:
            </h4>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-[#2d2118] bg-[#18110c] p-3.5">
                <span className="font-serif-hebrew text-xs font-bold text-[#eed3a2] block mb-1">
                  1. הכנה מקדימה
                </span>
                <p className="text-xs text-[#aa9c8d]">
                  ודאו שהבד נקי, יבש ומגוהץ היטב לפני החיבור. סמנו את המיקום הרצוי בגיר חייט.
                </p>
              </div>

              <div className="rounded-xl border border-[#2d2118] bg-[#18110c] p-3.5">
                <span className="font-serif-hebrew text-xs font-bold text-[#eed3a2] block mb-1">
                  2. הצמדה בחום או תפירה
                </span>
                <p className="text-xs text-[#aa9c8d]">
                  לפאצ&apos;ים: הניחו בד כותנה מגן והפעילו מגהץ חם (ללא קיטור) ל-20-30 שניות בלחץ יציב. לכפתורים: השתמשו בחוט כפול ותפר עוגן.
                </p>
              </div>

              <div className="rounded-xl border border-[#2d2118] bg-[#18110c] p-3.5">
                <span className="font-serif-hebrew text-xs font-bold text-[#eed3a2] block mb-1">
                  3. עמידות וקיבוע
                </span>
                <p className="text-xs text-[#aa9c8d]">
                  הניחו לפריט להתקרר לחלוטין. מומלץ לחזק ב-3 תפרים נסתרים בקצוות לעמידות רב-שנתית בכביסות.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "specs" && (
          <div className="space-y-3">
            <h4 className="font-serif-hebrew text-base font-bold text-[#fbf8f2]">
              מפרט פרימיום ואיכות קוטור:
            </h4>
            <ul className="list-disc pr-5 space-y-1.5 text-xs sm:text-sm">
              <li><strong>חומרים:</strong> חוטי רקמה מחוזקים בצפיפות גבוהה, עמידים בפני דהייה וקריעה.</li>
              <li><strong>מתכות:</strong> סגסוגת ברונזה/פליז עמידה בפני קורוזיה ואל-חלד.</li>
              <li><strong>כביסה ותחזוקה:</strong> מתאים לכביסה עדינה עד 40°C. מומלץ לכבס הפוך.</li>
              {description && <li><strong>תיאור נוסף:</strong> {description}</li>}
            </ul>
          </div>
        )}

        {activeTab === "shipping" && (
          <div className="space-y-3">
            <h4 className="font-serif-hebrew text-base font-bold text-[#fbf8f2]">
              משלוח מהיר ואחריות מלאה:
            </h4>
            <ul className="list-disc pr-5 space-y-1.5 text-xs sm:text-sm">
              <li><strong>שליח עד הדלת:</strong> 1-3 ימי עסקים לכל חלקי הארץ. חינם בהזמנה מעל ₪299.</li>
              <li><strong>איסוף עצמי מהבוטיק:</strong> רחוב לבינובסקי 9, תל אביב (קומת קרקע).</li>
              <li><strong>אחריות החלפה:</strong> החלפות והחזרות באריזה מקורית תוך 14 ימים.</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
