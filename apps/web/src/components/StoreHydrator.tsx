"use client";

import { useEffect } from "react";
import { fetchMenu } from "@sriambika/db";
import { useStore } from "@/lib/store";
import { supabaseBrowser } from "@/lib/supabase";
import type { MenuItem } from "@/lib/types";

/**
 * Loads the live menu from Supabase on mount and pushes it into the store.
 * If Supabase env is missing or the request fails, the seeded fallback stays.
 */
export default function StoreHydrator() {
  const setMenu = useStore((s) => s.setMenu);

  useEffect(() => {
    const sb = supabaseBrowser();
    if (!sb) return;
    let active = true;
    fetchMenu(sb)
      .then((items) => {
        if (active && items.length) setMenu(items as unknown as MenuItem[]);
      })
      .catch(() => {
        /* keep seeded fallback */
      });
    return () => {
      active = false;
    };
  }, [setMenu]);

  return null;
}
