"use client";

export function Loading() {
  return (
    <div aria-label="Loading" className="grid cards">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="skeleton" />
      ))}
    </div>
  );
}
