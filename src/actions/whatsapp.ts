"use server";

import { sendWhatsAppMessage, WhatsAppTemplates } from "@/lib/whatsapp";
import { writeAuditLog } from "@/lib/audit";
import { updateSettingsAction } from "./settings";
import { revalidatePath } from "next/cache";

export async function sendTestWhatsAppAction(params: {
  recipient: string;
  message?: string;
  actorId?: string;
  actorName?: string;
}) {
  const msg =
    params.message || WhatsAppTemplates.testMessage(params.recipient);

  const res = await sendWhatsAppMessage({
    recipient: params.recipient,
    message: msg,
    type: "test_message",
    recipientName: "Admin Test Target",
  });

  await writeAuditLog({
    actorId: params.actorId,
    actorName: params.actorName,
    action: "create",
    entityType: "user",
    description: `Uji coba kirim pesan WhatsApp ke nomor ${params.recipient}: Status ${res.status}`,
    newValue: {
      recipient: params.recipient,
      status: res.status,
      notificationId: res.notificationId,
      retries: res.retries,
    },
  });

  revalidatePath("/admin/whatsapp");
  revalidatePath("/admin/notifikasi");
  return res;
}

export async function saveWhatsAppConfigAction(params: {
  apiKey: string;
  senderNumber: string;
  actorId?: string;
  actorName?: string;
}) {
  return await updateSettingsAction(
    {
      whatsappApiKey: params.apiKey,
      whatsappSenderNumber: params.senderNumber,
    },
    params.actorId,
    params.actorName
  );
}
