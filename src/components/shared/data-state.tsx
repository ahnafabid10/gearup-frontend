"use client";

import { Loading } from "@/components/shared/loading";

import type { ReactNode } from "react";

export function DataState({
  loading,
  error,
  empty,
  children,
  retry,
}: {
  loading: boolean;
  error: string;
  empty: boolean;
  children: ReactNode;
  retry: () => void;
}) {
  if (loading) return <Loading />;
  if (error)
    return (
      <div className="empty" role="alert">
        <h3>We couldn’t load this just yet.</h3>
        <p>{error}</p>
        <button className="btn" onClick={retry}>
          Try again
        </button>
      </div>
    );
  if (empty)
    return (
      <div className="empty">
        <h3>Nothing here yet</h3>
        <p>Try another search or come back for new gear.</p>
      </div>
    );
  return children;
}
