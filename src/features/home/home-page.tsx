"use client";

import { getRows } from "@/lib/api";
import { useApiData } from "@/hooks/use-api-data";
import { DataState } from "@/components/shared/data-state";
import { GearCard } from "@/components/gear/gear-card";

import Link from "next/link";
import Image from "next/image";

export function HomePage() {
  const { data, error, loading, reload } = useApiData("gear?limit=4");
  return (
    <>
      <section className="shell hero">
        <div className="hero-copy">
          <div className="eyebrow">
            <span /> LESS STUFF. MORE ADVENTURE.
          </div>
          <h1>
            Your next
            <br />
            adventure.
            <br />
            <em>All geared up.</em>
          </h1>
          <p>
            From mountain trails to your neighborhood court. Rent the gear you
            need, for the moments that matter.
          </p>
          <Link href="/gear" className="btn">
            Find your gear <span>↗</span>
          </Link>
          <div className="hero-note">
            <b>✓</b> Quality gear <b>✓</b> Flexible rentals <b>✓</b> Local
            providers
          </div>
        </div>
        <div className="hero-art">
          <Image
            src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1400&q=85"
            alt="Dramatic mountain peaks ready to explore"
            fill
            priority
            sizes="(max-width: 800px) 100vw, 55vw"
          />
          <div className="art-top">
            GO OUTSIDE.
            <br />
            COME ALIVE.
          </div>
          <div className="art-bottom">
            <span>THE OUTDOORS IS CALLING</span>
            <strong>Answer with adventure.</strong>
            <Link href="/gear" aria-label="Explore gear">
              ↗
            </Link>
          </div>
          <div className="floating-tag">↗ Built for your next big thing</div>
        </div>
      </section>
      <div className="category-strip">
        <div className="shell">
          <span>FIND YOUR KIND OF OUTSIDE</span>
          {[
            "Camping",
            "Cycling",
            "Fitness",
            "Water sports",
            "Winter sports",
          ].map((x) => (
            <Link key={x} href={`/gear?search=${encodeURIComponent(x)}`}>
              {x} ↗
            </Link>
          ))}
        </div>
      </div>
      <section className="shell section">
        <div className="section-heading">
          <div>
            <div className="eyebrow">GOOD GEAR. GREAT MEMORIES.</div>
            <h2>Big plans. Meet the gear.</h2>
          </div>
          <Link href="/gear">Explore all gear ↗</Link>
        </div>
        <DataState
          loading={loading}
          error={error}
          empty={!getRows(data).length}
          retry={reload}
        >
          <div className="grid cards">
            {getRows(data).map((x) => (
              <GearCard key={x.id} item={x} />
            ))}
          </div>
        </DataState>
      </section>
      <section id="how-it-works" className="shell section">
        <div className="eyebrow">LESS HASSLE, MORE HAPPY TRAILS</div>
        <h2>Get out there in three easy steps.</h2>
        <div className="grid steps">
          {[
            [
              "01",
              "Find your fit",
              "Explore quality sports and outdoor gear from local providers.",
            ],
            [
              "02",
              "Make it yours. For a bit.",
              "Pick your dates, request a rental, and pay after confirmation.",
            ],
            [
              "03",
              "Go make a memory",
              "Pick up your gear, enjoy the adventure, and return it when you’re done.",
            ],
          ].map(([n, t, d]) => (
            <article key={n}>
              <span>{n} ↗</span>
              <h3>{t}</h3>
              <p>{d}</p>
            </article>
          ))}
        </div>
      </section>
      <section id="why-gearup" className="shell cta">
        <div>
          <div className="eyebrow">OWN THE EXPERIENCE. RENT THE GEAR.</div>
          <h2>
            Your gear could be
            <br />
            someone’s next adventure.
          </h2>
          <p>Give your equipment a life beyond the storage room.</p>
        </div>
        <Link className="btn" href="/auth/register">
          Become a provider ↗
        </Link>
      </section>
    </>
  );
}
