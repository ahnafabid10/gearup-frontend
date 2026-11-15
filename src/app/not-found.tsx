import Link from "next/link";
export default function Page() {
  return (
    <main className="shell section empty">
      <h1>This trail leads nowhere.</h1>
      <Link className="btn" href="/gear">
        Explore gear ↗
      </Link>
    </main>
  );
}
