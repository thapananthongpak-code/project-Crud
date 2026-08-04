import type { Phone, PhoneDraft } from "@/types/phone";
import api from "@/utils/crud-api";
import * as Crypto from "expo-crypto";

const RESOURCE = "phones";

/** The server is a json-server file, so guard against half-written records. */
function toPhone(raw: unknown): Phone | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (typeof r.id !== "string" && typeof r.id !== "number") return null;
  return {
    id: String(r.id),
    name: typeof r.name === "string" ? r.name : "",
    sect: typeof r.sect === "string" ? r.sect : "",
    tel: typeof r.tel === "string" ? r.tel : "",
  };
}

export async function fetchPhones(signal?: AbortSignal): Promise<Phone[]> {
  const res = await api.get<unknown[]>(RESOURCE, { signal });
  if (!Array.isArray(res.data)) return [];
  return res.data.map(toPhone).filter((p): p is Phone => p !== null);
}

export async function createPhone(draft: PhoneDraft): Promise<Phone> {
  // json-server mints its own id and ignores this one, but sending a real UUID
  // keeps the app correct against a backend that expects the client to supply
  // it. expo-crypto uses the platform CSPRNG — the `uuid` package needs a
  // getRandomValues polyfill to work at all under Hermes.
  const phone: Phone = { id: Crypto.randomUUID(), ...draft };
  const res = await api.post<unknown>(RESOURCE, phone);
  // Always trust the server's id: it is the one PUT and DELETE will accept.
  return toPhone(res.data) ?? phone;
}

export async function updatePhone(id: string, draft: PhoneDraft): Promise<Phone> {
  const res = await api.put<unknown>(`${RESOURCE}/${id}`, { id, ...draft });
  return toPhone(res.data) ?? { id, ...draft };
}

export async function deletePhone(id: string): Promise<void> {
  await api.delete(`${RESOURCE}/${id}`);
}

/**
 * Puts a deleted contact back after an undo. json-server assigns a fresh id on
 * re-insert, so callers must reload the list rather than reuse the old record.
 */
export async function restorePhone(phone: Phone): Promise<void> {
  await api.post(RESOURCE, phone);
}
