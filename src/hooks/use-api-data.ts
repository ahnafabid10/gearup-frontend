"use client";

import { api } from "@/lib/api";
import { useEffect, useState, useCallback } from "react";

import type { ApiResult } from "@/lib/types";

export function useApiData(path: string) {
  const [snapshot, setSnapshot] = useState<{
    path: string;
    data?: ApiResult;
    error: string;
  }>();
  const [refresh, setRefresh] = useState(0);
  const [pending, setPending] = useState(false);
  const reload = useCallback(async () => {
    setPending(true);
    setRefresh((n) => n + 1);
  }, []);
  useEffect(() => {
    if (!path) return;
    // Ignore a response if navigation or a newer request replaced this one.
    let active = true;
    api(path)
      .then((data) => {
        if (active) {
          setSnapshot({ path, data, error: "" });
          setPending(false);
        }
      })
      .catch((e) => {
        if (active) {
          setSnapshot({ path, error: e.message });
          setPending(false);
        }
      });
    return () => {
      active = false;
    };
  }, [path, refresh]);

  if (!path) {
    return {
      data: undefined,
      error: "",
      loading: false,
      reload,
    };
  }

  // Never show a previous filter's results while a new URL is loading.
  const current = snapshot?.path === path ? snapshot : undefined;
  return {
    data: current?.data,
    error: current?.error || "",
    loading: !current || pending,
    reload,
  };
}
