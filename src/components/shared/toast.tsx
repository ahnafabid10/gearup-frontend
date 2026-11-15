"use client";
import { useEffect, useState } from "react";
export function notify(message: string, error = false) {
  window.dispatchEvent(
    new CustomEvent("gearup:notice", { detail: { message, error } }),
  );
}
export function Toast() {
  const [notice, setNotice] = useState<{ message: string; error: boolean }>();
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const receive = (event: Event) => {
      setNotice((event as CustomEvent).detail);
      clearTimeout(timer);
      timer = setTimeout(() => setNotice(undefined), 6000);
    };
    window.addEventListener("gearup:notice", receive);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("gearup:notice", receive);
    };
  }, []);
  return (
    <div aria-live="polite" aria-atomic="true" className="toast-region">
      {notice && (
        <div className={`toast ${notice.error ? "toast-error" : ""}`}>
          <span>{notice.message}</span>
          <button
            aria-label="Dismiss notification"
            onClick={() => setNotice(undefined)}
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}
