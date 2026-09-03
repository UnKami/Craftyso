type Props = { searchParams: Promise<{ order?: string }> };

export default async function CheckoutSuccessPage({ searchParams }: Props) {
  const { order } = await searchParams;

  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center">
      <h1 className="mb-3 text-2xl font-bold text-ink">תודה על הרכישה!</h1>
      <p className="text-ink-muted">
        ההזמנה שלכם התקבלה{order ? ` (מספר הזמנה: ${order})` : ""} ותעודכן ברגע שהתשלום יאושר.
      </p>
    </div>
  );
}
