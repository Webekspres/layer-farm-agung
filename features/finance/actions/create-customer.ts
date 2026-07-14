"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import {
  getFinanceTenantScope,
  requireViewCashflowSession,
} from "@/features/finance/lib/access";
import { customerSchema } from "@/features/finance/schemas/customer";

export type CustomerFormState = {
  error?: string;
  success?: boolean;
};

export async function createCustomerAction(
  _prev: CustomerFormState,
  formData: FormData,
): Promise<CustomerFormState> {
  const session = await requireViewCashflowSession();
  const { tenantId, needsTenantSelection } = getFinanceTenantScope(session);

  if (needsTenantSelection || !tenantId) {
    return { error: "Pilih tenant aktif terlebih dahulu." };
  }

  const parsed = customerSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
    address: formData.get("address"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid." };
  }

  try {
    await prisma.customer.create({
      data: {
        tenant_id: tenantId,
        name: parsed.data.name,
        phone: parsed.data.phone ?? null,
        address: parsed.data.address ?? null,
      },
    });
  } catch {
    return { error: "Gagal menambahkan pelanggan." };
  }

  revalidatePath("/dashboard/finance");
  return { success: true };
}
