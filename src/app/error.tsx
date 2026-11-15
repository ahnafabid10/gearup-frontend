"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="shell section empty">
      <h1>Something interrupted the adventure.</h1>
      <p>Please try loading this page again.</p>
      <button className="btn" onClick={reset}>
        Try again
      </button>
    </main>
  );
}
