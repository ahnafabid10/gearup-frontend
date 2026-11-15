import type { ApiResult, GearRecord } from "@/lib/types";
import { notify } from "@/components/shared/toast";

export async function api(path: string, method = "GET", body?: unknown) {
  const response = await fetch(`/api/${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const result = await response.json();
  if (!response.ok) {
    if (method !== "GET") notify(result.message || "Update failed.", true);
    throw new Error(
      result.message || "Something went wrong. Please try again.",
    );
  }
  if (method !== "GET") notify(result.message || "Updated successfully.");
  return result;
}

// Public and dashboard endpoints return either a direct list or a nested list.
export function getRows(result?: ApiResult): GearRecord[] {
  if (!result) return [];
  if (Array.isArray(result.data)) return result.data;
  if (result.data && "data" in result.data && Array.isArray(result.data.data))
    return result.data.data;
  return [];
}
