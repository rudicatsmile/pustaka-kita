import { db, schema } from "@/db";
import { AuditLogItem } from "@/types";
import { DUMMY_AUDIT_LOGS } from "@/data/dummy";

export interface AuditLogParams {
  actorId?: string;
  actorName?: string;
  action: "create" | "update" | "delete" | "verify" | "waive" | "login" | "logout";
  entityType: "book" | "book_copy" | "loan" | "fine" | "user";
  entityId?: string;
  description: string;
  oldValue?: Record<string, unknown> | null;
  newValue?: Record<string, unknown> | null;
  ipAddress?: string;
  userAgent?: string;
  requestId?: string;
}

export async function writeAuditLog(params: AuditLogParams) {
  const now = new Date().toISOString().replace("T", " ").substring(0, 19);

  // 1. If DB available, write append-only to audit_logs table
  if (db) {
    try {
      await db.insert(schema.auditLogs).values({
        actorId: params.actorId,
        actorName: params.actorName || "Petugas Perpustakaan",
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
        description: params.description,
        oldValue: params.oldValue || null,
        newValue: params.newValue || null,
        ipAddress: params.ipAddress || "127.0.0.1",
        userAgent: params.userAgent || "Web Browser",
        requestId: params.requestId || crypto.randomUUID(),
      });
    } catch (e) {
      console.warn("Could not insert to DB audit_logs, logging to fallback:", e);
    }
  }

  // 2. Also record in active session array so UI reflects CUD audits immediately if fallback
  const logEntry: AuditLogItem = {
    id: `aud-${Date.now()}`,
    actorId: params.actorId || "usr-staff-1",
    actorName: params.actorName || "Ibu Dewi Anggraini, S.IP.",
    action: params.action,
    entityType: params.entityType,
    entityId: params.entityId || "gen-id",
    description: params.description,
    oldValue: params.oldValue || null,
    newValue: params.newValue || null,
    ipAddress: params.ipAddress || "127.0.0.1",
    userAgent: params.userAgent || "Mozilla/5.0",
    createdAt: now,
  };

  DUMMY_AUDIT_LOGS.unshift(logEntry);
  return logEntry;
}
