"use client";

import Link from "next/link";
import Image from "next/image";
import { getRows } from "@/lib/api";
import { useApiData } from "@/hooks/use-api-data";
import { DataState } from "@/components/shared/data-state";
import { GearCard } from "@/components/gear/gear-card";

const activities = [
  { name: "Camping", detail: "A little closer to nature", image: "photo-1504851149312-7a075b496cc7" },
  { name: "Cycling", detail: "Take the scenic route", image: "photo-1485965120184-e220f721d03e" },
  { name: "Water sports", detail: "Find your own current", image: "photo-1502680390469-be75c86b636f" },
];
const photo = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1000&q=85`;

export function HomePage() {
  const { data, error, loading, reload } = useApiData("gear?limit=4");
  const categories = useApiData("categories");
  function categoryHref(name: string) {
    const slug = name.toLowerCase().replace(/\s+/g, "-");
    const category = getRows(categories.data).find(item => item.slug === slug || item.name?.toLowerCase() === name.toLowerCase());
    return category ? `/gear?categoryId=${encodeURIComponent(category.id)}` : `/gear?category=${encodeURIComponent(slug)}`;
  }
  return (
    <main className="home">
      <section className="shell hero">
        <div className="hero-copy">
          <div className="eyebrow"><span /> Less owning. More exploring</div>
          <h1>Great outdoors.<br />Good company.<br /><span>Gear sorted.</span></h1>
          <p>Rent sports and outdoor gear from local providers. Pack for the experience, without owning all the equipment.</p>
          <div className="hero-actions"><Link href="/gear" className="btn">Explore the gear <span aria-hidden="true">↗</span></Link><Link href="#how-it-works" className="quiet-link">How it works <span aria-hidden="true">→</span></Link></div>
          <div className="hero-footnote"><span className="trail-mark" aria-hidden="true">↗</span><span>For the weekend plans.<br /><strong>And the why-not plans.</strong></span></div>
        </div>
        <div className="hero-art">
          <Image src={photo("photo-1464822759023-fed622ff2c3b")} alt="Sunlight reaching rugged mountain peaks beneath an open sky" fill priority sizes="(max-width: 800px) 100vw, 55vw" />
          <div className="scene-label"><span className="scene-dot" /> A change of scenery</div>
          <div className="art-bottom"><div><span>Your next chapter starts outside</span><strong>Less stuff.<br />More stories.</strong></div><Link href={categoryHref("Camping")} aria-label="Explore camping gear">↗</Link></div>
        </div>
      </section>
      <div className="category-strip"><div className="shell"><span>What’s your kind<br />of outside?</span>{getRows(categories.data).map(category => <Link key={category.id} href={`/gear?categoryId=${encodeURIComponent(category.id)}`}>{category.name}<span aria-hidden="true">↗</span></Link>)}</div></div>
      <section className="shell section">
        <div className="section-heading"><div><div className="eyebrow">The outdoors, your way</div><h2>A different kind of everyday</h2></div><Link className="quiet-link" href="/gear">Browse all gear <span aria-hidden="true">↗</span></Link></div>
        <div className="activity-grid">{activities.map((activity, i) => <Link className="activity-card" href={categoryHref(activity.name)} key={activity.name}><div className="activity-image"><Image src={photo(activity.image)} alt={activity.name === "Camping" ? "Tent pitched in a quiet forest campsite" : activity.name === "Cycling" ? "Bicycle ready for a ride" : "Surfer riding an ocean wave"} fill sizes="(max-width: 640px) 100vw, 33vw" /><span className="activity-index">0{i + 1}</span></div><div className="activity-caption"><div><h3>{activity.name}</h3><p>{activity.detail}</p></div><span aria-hidden="true">↗</span></div></Link>)}</div>
        <div className="section-heading gear-heading"><div><div className="eyebrow">From local providers</div><h2>Find your next piece of gear</h2></div><Link className="quiet-link" href="/gear">View the collection <span aria-hidden="true">↗</span></Link></div>
        <DataState loading={loading} error={error} empty={!getRows(data).length} retry={reload}><div className="grid cards">{getRows(data).map(item => <GearCard key={item.id} item={item} />)}</div></DataState>
      </section>
      <section id="how-it-works" className="how-section"><div className="shell section"><div className="section-heading"><div><div className="eyebrow">Less planning. More doing</div><h2>From someday<br />to this weekend</h2></div><p>The right gear, for just as long as you need it.<br />Here’s how to get going.</p></div><div className="grid steps">{[["01", "Find your fit", "Explore sports and outdoor equipment from local providers. Find the right gear for your plans."], ["02", "Pick your days", "Choose your rental dates and send a request. Pay securely once your provider confirms."], ["03", "Make it a good one", "Pick up your gear, head outside, and return it when your adventure is done."]].map(([n, title, description]) => <article key={n}><span>{n}<span aria-hidden="true">↗</span></span><h3>{title}</h3><p>{description}</p></article>)}</div></div></section>
      <section id="why-gearup" className="shell provider-section"><div className="cta"><div><div className="eyebrow">Good gear deserves another adventure</div><h2>Less time in storage.<br />More time out there.</h2><p>List your equipment and help someone else get outside.</p><Link className="btn" href="/auth/register">Become a provider <span aria-hidden="true">↗</span></Link></div><div className="provider-note"><span aria-hidden="true">↗</span><p>Your gear.<br />Their next great story.</p></div></div></section>
    </main>
  );
}

