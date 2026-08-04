import { deletePhone, fetchPhones, restorePhone } from "@/api/phones";
import type { Phone } from "@/types/phone";
import { describeError } from "@/utils/crud-api";
import { useCallback, useEffect, useRef, useState } from "react";

export type LoadStatus = "loading" | "ready" | "error";
type LoadMode = "initial" | "refresh" | "silent";

export function usePhones() {
  const [phones, setPhones] = useState<Phone[]>([]);
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Only the newest request may write to state — otherwise a slow first load
  // can overwrite the result of a pull-to-refresh that finished sooner.
  const requestId = useRef(0);
  const mounted = useRef(true);
  // Mirrors `phones` so `remove` can roll back without depending on the list,
  // which keeps its identity stable and the memoized cards from re-rendering.
  const phonesRef = useRef<Phone[]>([]);
  phonesRef.current = phones;

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const load = useCallback(async (mode: LoadMode = "initial") => {
    const id = ++requestId.current;

    if (mode === "refresh") setRefreshing(true);
    else if (mode === "initial") setStatus("loading");

    try {
      const data = await fetchPhones();
      if (!mounted.current || id !== requestId.current) return;
      setPhones(data);
      setError(null);
      setStatus("ready");
    } catch (err) {
      if (!mounted.current || id !== requestId.current) return;
      const message = describeError(err);
      setError(message);
      // A background refresh should not blow away a list the user is reading.
      setStatus((prev) => (mode === "silent" && prev === "ready" ? "ready" : "error"));
    } finally {
      if (mounted.current && id === requestId.current) setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load("initial");
  }, [load]);

  /**
   * Removes the contact immediately so the list feels instant, and puts it back
   * if the server rejects the delete. Returns an `undo` the caller can offer.
   */
  const remove = useCallback(
    async (phone: Phone): Promise<{ ok: boolean; message: string; undo?: () => Promise<void> }> => {
      const snapshot = phonesRef.current;
      setPhones((prev) => prev.filter((p) => p.id !== phone.id));

      try {
        await deletePhone(phone.id);
      } catch (err) {
        if (mounted.current) setPhones(snapshot);
        return { ok: false, message: describeError(err) };
      }

      const undo = async () => {
        try {
          await restorePhone(phone);
        } finally {
          await load("silent");
        }
      };

      return { ok: true, message: `${phone.name || "Contact"} deleted.`, undo };
    },
    [load],
  );

  return {
    phones,
    status,
    error,
    refreshing,
    reload: load,
    remove,
  };
}
