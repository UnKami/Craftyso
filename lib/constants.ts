// Shared storefront policy figures — kept in one place so the shipping page
// and product pages can never drift out of sync with each other again.
// Sourced from the original legacy-site scrape: "משלוחים בהזמנות מעל 1,000
// ש"ח חינם", שליח ₪45, דואר רשום ₪20.
export const FREE_SHIPPING_THRESHOLD_ILS = 1000;
export const COURIER_PRICE_ILS = 45;
export const REGISTERED_MAIL_PRICE_ILS = 20;
export const RETURN_WINDOW_DAYS = 14;

export const DEFAULT_SHIPPING_NOTE = `שליח עד הבית: 1-3 ימי עסקים לכל חלקי הארץ (₪${COURIER_PRICE_ILS}, חינם בהזמנות מעל ₪${FREE_SHIPPING_THRESHOLD_ILS}).
דואר רשום: ₪${REGISTERED_MAIL_PRICE_ILS}.
איסוף עצמי מהבוטיק: רחוב לבינובסקי 9, תל אביב (קומת קרקע) – בתיאום מראש.
החזרות והחלפות: עד ${RETURN_WINDOW_DAYS} ימים מיום קבלת המשלוח, באריזה מקורית.`;
