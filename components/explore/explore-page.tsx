"use client";

import Image from "next/image";
import { ArrowRight, Bike, Check, CloudRain, Coffee, Compass, Footprints, MapPin, Plus, Sparkles, TreePine, Waves, X } from "lucide-react";
import { useEffect, useState, type ComponentType } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useProduct } from "@/lib/product-context";

type Experience = {
  id: string;
  title: string;
  category: string;
  time: string;
  image: string;
  description: string;
  detail: string;
  location: string;
  distance: string;
  Icon: ComponentType<{ size?: number }>;
};

const experiences: Experience[] = [
  { id: "forest", title: "Early forest walk", category: "Nature", time: "90 minutes", image: "/forest-walk.png", description: "A quiet trail through beech and pine.", detail: "Leave just after sunrise for the calmest route. The 6 km loop is a measured start to a day in the Veluwe.", location: "Veluwe trailhead", distance: "Nearby", Icon: Footprints },
  { id: "bike", title: "Veluwe by bicycle", category: "Active", time: "Half day", image: "/stayai-arrival-exterior-v3.png", description: "Electric bikes delivered to your door.", detail: "Follow a low-traffic route across heathland and forest. Helmets, a lock and a prepared picnic can be included.", location: "Hoenderloo heathland", distance: "8 min ride", Icon: Bike },
  { id: "wellness", title: "Woodland wellness", category: "Wellness", time: "75 minutes", image: "/rain-spa.png", description: "A warm, restorative pause among the trees.", detail: "Private sauna and treatment rooms are available throughout the afternoon. StayAI can help shape a quiet itinerary.", location: "Veluwe woodland spa", distance: "Nearby", Icon: Waves },
  { id: "restaurant", title: "Dinner at De Echoput", category: "Dining", time: "Evening", image: "/stayai-arrival-interior-v2.png", description: "Local produce and considered Dutch cooking.", detail: "An intimate dining room known for seasonal ingredients from the Veluwe. Smart casual dress is recommended.", location: "Hoog Soeren", distance: "12 min drive", Icon: Coffee },
  { id: "museum", title: "Kröller-Müller Museum", category: "Culture", time: "2–3 hours", image: "/stayai-arrival-threshold-v1.png", description: "Modern masters within a sculpture garden.", detail: "Pair the museum collection with a slow walk through one of Europe’s largest sculpture gardens. Advance entry is recommended.", location: "Otterlo", distance: "18 min drive", Icon: Compass },
  { id: "rain", title: "A good rainy day", category: "Culture", time: "Flexible", image: "/stayai-arrival-suite-v1.png", description: "Art, wellness and a long lunch nearby.", detail: "Combine the Kröller-Müller Museum with woodland wellness, or simply stay in and let us arrange lunch at the lodge.", location: "Across the Veluwe", distance: "Weather-ready", Icon: CloudRain },
];

const categories = ["All", "Nature", "Active", "Wellness", "Dining", "Culture"];

export function ExplorePage() {
  const [selected, setSelected] = useState<Experience | null>(null);
  const [category, setCategory] = useState("All");
  const [chosen, setChosen] = useState<Set<string>>(() => new Set());
  const { startFlow } = useProduct();
  const visibleExperiences = category === "All" ? experiences : experiences.filter((experience) => experience.category === category);

  const toggleChosen = (id: string) => {
    setChosen((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const planChosen = () => {
    const titles = experiences.filter((experience) => chosen.has(experience.id)).map((experience) => experience.title);
    void startFlow("plan", `Build an itinerary around ${titles.join(", ")}.`);
  };

  useEffect(() => {
    const close = (event: KeyboardEvent) => { if (event.key === "Escape") setSelected(null); };
    document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, []);

  useEffect(() => {
    document.body.style.overflow = selected ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [selected]);

  return (
    <main className="explore-page" id="main-content">
      <header className="explore-location-hero">
        <div className="explore-location-copy"><span><MapPin /> Veluwe, Netherlands</span><h1>Explore<br /><em>your stay.</em></h1><p>Forest, culture and considered dining—curated around the region and the pace of your trip.</p></div>
        <div className="explore-location-card"><div className="location-map-mark"><i><TreePine /></i><span>Veluwe</span><small>52.1061° N · 5.8268° E</small></div><div className="location-rings"><i /><i /><i /></div><div className="location-facts"><span><b>5 min</b><small>to the forest</small></span><span><b>18 min</b><small>to Otterlo</small></span><span><b>12 min</b><small>to dining</small></span></div></div>
      </header>

      <section className="explore-toolbar" aria-label="Filter activities"><div><span>Curated around your location</span><h2>Choose what feels right</h2></div><div className="explore-filters">{categories.map((item) => <button className={category === item ? "active" : ""} key={item} onClick={() => setCategory(item)}>{item}</button>)}</div></section>

      <section className="experience-grid" aria-label="Things to do">
        {visibleExperiences.map((experience, index) => (
          <article className={`experience-tile experience-${index + 1}`} key={experience.id}>
            <button className="experience-card" onClick={() => setSelected(experience)}>
              <span className="experience-image"><Image src={experience.image} alt="" fill sizes="(max-width: 760px) 100vw, 50vw" /></span>
              <span className="experience-overlay" />
              <span className="experience-copy"><small>{experience.category} · {experience.time}</small><strong>{experience.title}</strong><span>{experience.description}</span><em><MapPin /> {experience.location} · {experience.distance}</em></span>
              <i><ArrowRight /></i>
            </button>
            <button className={`activity-choice ${chosen.has(experience.id) ? "is-chosen" : ""}`} onClick={() => toggleChosen(experience.id)} aria-pressed={chosen.has(experience.id)}>{chosen.has(experience.id) ? <Check /> : <Plus />}<span>{chosen.has(experience.id) ? "Added to your day" : "Add to your day"}</span></button>
          </article>
        ))}
      </section>

      <AnimatePresence>{chosen.size > 0 && <motion.aside className="itinerary-dock" initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 18 }}><div><span>{String(chosen.size).padStart(2,"0")}</span><p><strong>{chosen.size === 1 ? "One activity selected" : `${chosen.size} activities selected`}</strong><small>StayAI can arrange the best order around your booking.</small></p></div><button onClick={planChosen}><Sparkles /> Plan this with StayAI <ArrowRight /></button></motion.aside>}</AnimatePresence>

      <AnimatePresence>
        {selected && (
          <motion.div className="experience-modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(event) => { if (event.currentTarget === event.target) setSelected(null); }}>
            <motion.div className="experience-modal" role="dialog" aria-modal="true" aria-labelledby="experience-title" initial={{ opacity: 0, y: 24, scale: .98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 16 }} transition={{ duration: .32, ease: [0.16, 1, 0.3, 1] }}>
              <button className="experience-close" onClick={() => setSelected(null)} aria-label="Close details"><X /></button>
              <div className="experience-modal-image"><Image src={selected.image} alt="" fill sizes="(max-width: 760px) 100vw, 48vw" /></div>
              <div className="experience-modal-copy"><selected.Icon size={22} /><small>{selected.category} · {selected.time}</small><h2 id="experience-title">{selected.title}</h2><span className="modal-location"><MapPin /> {selected.location} · {selected.distance}</span><p>{selected.detail}</p><button onClick={() => void startFlow(selected.id === "rain" ? "rain" : "plan", `Plan my day around ${selected.title}.`)}><Sparkles /> Plan this with StayAI <ArrowRight /></button></div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
