"use server";

import { revalidatePath } from "next/cache";
import { getSessionUser } from "@/lib/auth/session";
import { upsertAndMergeCustomerIdentity } from "@/lib/customers/identity";

export async function linkCustomerContactAction(input: {
  email?: string;
  phone?: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await getSessionUser();
  if (!session) return { ok: false, error: "יש להתחבר לחשבון." };

  const email = input.email?.trim() || undefined;
  const phone = input.phone?.trim() || undefined;
  if (!email && !phone) {
    return { ok: false, error: "יש להזין מספר טלפון או כתובת אימייל לשיוך." };
  }

  await upsertAndMergeCustomerIdentity({
    uid: session.uid,
    email: email ?? session.email,
    phone,
  });

  revalidatePath("/account");
  return { ok: true };
}
