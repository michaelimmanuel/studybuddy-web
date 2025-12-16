"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";

export default function usePermissions() {
  const [permissions, setPermissions] = useState<string[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        // Use the canonical /api/users/me which returns { user, permissions }
        const res = await api.get<{ user: any; permissions?: string[] }>("/api/users/me");
        if (!mounted) return;
        setPermissions(res.permissions || []);
      } catch (err) {
        if (!mounted) return;
        setPermissions([]);
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    })();
    return () => { mounted = false };
  }, []);

  return { permissions: permissions || [], loading };
}
