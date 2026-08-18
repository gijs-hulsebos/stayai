"use client";

import Image from "next/image";
import { ArrowRight, Check, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { useProduct } from "@/lib/product-context";
import { PremiumLink } from "@/lib/premium-navigation";
import { ParallaxComponent } from "@/components/ui/parallax-scrolling";

function ProductExplanation() {
  return (
    <section className="functional-story">
      <motion.div className="functional-story-copy" initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .35 }} transition={{ duration: .9, ease: [0.16, 1, 0.3, 1] }}>
        <span className="functional-index">01 · One connected stay</span>
        <h2>Hospitality,<br /><em>without the hunt.</em></h2>
        <p>StayAI turns a natural conversation into a focused hotel search, current rates and a clear shortlist.</p>
        <PremiumLink href="/assistant" transitionLabel="Your private concierge">Meet your assistant <ArrowRight /></PremiumLink>
        <div className="functional-assurances"><span>Private arrival</span><span>24/7 concierge</span><span>Local curation</span></div>
      </motion.div>
      <motion.div className="functional-story-image" initial={{ opacity: 0, scale: .985 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true, amount: .2 }} transition={{ duration: 1.15, ease: [0.16, 1, 0.3, 1] }}>
        <Image src="/walkthrough-spatial-v3/4k/02-jacuzzi.jpg" alt="Private lakeside hotel terrace" fill quality={95} sizes="(max-width: 800px) 100vw, 58vw" />
        <div className="functional-image-meta"><span>A stay matched to you</span><strong>Evening, made effortless.</strong></div>
      </motion.div>
    </section>
  );
}

function BookingTeaser() {
  const [proposalVisible, setProposalVisible] = useState(false);
  const { startFlow } = useProduct();

  return (
    <section className="functional-teaser">
      <motion.div className="functional-teaser-heading" initial={{ opacity: 0, y: 26 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .4 }} transition={{ duration: .85, ease: [0.16, 1, 0.3, 1] }}>
        <span className="functional-index">02 · See it work</span>
        <h2>Ask naturally.<br /><em>Act confidently.</em></h2>
        <p>The assistant searches current hotel data, checks rates and asks before creating any demo reservation.</p>
      </motion.div>
      <motion.div className="functional-demo" aria-live="polite" initial={{ opacity: 0, y: 34 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .25 }} transition={{ duration: 1, delay: .08, ease: [0.16, 1, 0.3, 1] }}>
        <div className="functional-demo-live"><span><i /> StayAI concierge</span><small>Xotelo search · ready</small></div>
        <div className="functional-demo-prompt"><small>YOU</small><p>Find a quiet boutique stay in Lisbon.</p></div>
        {!proposalVisible ? (
          <button className="functional-demo-start" onClick={() => setProposalVisible(true)}><Sparkles /> Preview the response <ArrowRight /></button>
        ) : (
          <motion.div className="functional-demo-change" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .42, ease: [0.16, 1, 0.3, 1] }}>
            <div className="functional-demo-status"><span><Check /> Search ready</span><small>Current hotel data</small></div>
            <div className="functional-demo-dates"><div><small>Destination</small><strong>Lisbon</strong><span>PORTUGAL</span></div><ArrowRight /><div><small>Style</small><strong>Boutique</strong><span>QUIET</span></div></div>
            <div className="functional-demo-total"><span>Next step</span><strong>Add dates</strong></div>
            <div className="functional-demo-actions"><button onClick={() => void startFlow("search", "Find a quiet boutique stay in Lisbon.")}>Continue in Assistant <ArrowRight /></button><button onClick={() => setProposalVisible(false)}>Reset preview</button></div>
          </motion.div>
        )}
      </motion.div>
    </section>
  );
}

function ProductPortal() {
  return (
    <section className="cinematic-product functional-portal">
      <div className="cinematic-product-heading">
        <div className="cinematic-scene-index dark"><span>03</span><i /> Your product</div>
        <h2>Everything ready.<br /><em>Exactly where expected.</em></h2>
        <p>Move from inspiration into a clear, connected guest experience.</p>
      </div>
      <div className="cinematic-product-panels">
        <PremiumLink className="cinematic-product-panel cinematic-stay-panel" href="/stay" transitionLabel="Your private stay">
          <div className="cinematic-panel-image"><Image src="/walkthrough-spatial-v3/4k/04-dining-from-fireplace-source-v3.jpg" alt="Luxury woodland dining room and fireplace" fill quality={95} sizes="(max-width: 800px) 100vw, 64vw" /></div>
          <div className="cinematic-panel-content"><span>01 · My Stay</span><h3>Your reservations</h3><p>Upcoming, cancelled and saved stays</p><small>Private · Supabase protected</small><i><ArrowRight /></i></div>
        </PremiumLink>
        <PremiumLink className="cinematic-product-panel cinematic-assistant-panel" href="/assistant" transitionLabel="Your private concierge">
          <span className="cinematic-panel-number">02 · Assistant</span><div className="cinematic-assistant-core"><Sparkles /><i /></div><p>How can I help?</p><div className="cinematic-assistant-query"><span>Ask about your stay</span><ArrowRight /></div>
        </PremiumLink>
      </div>
      <div className="cinematic-product-footer"><span>StayAI · Guest experience, connected.</span><PremiumLink className="cinematic-button" href="/stay" transitionLabel="Your private stay"><span>Enter my stay <ArrowRight size={15} /></span></PremiumLink></div>
    </section>
  );
}

export function CinematicHomepage() {
  return <main className="cinematic-homepage"><ParallaxComponent /><ProductExplanation /><BookingTeaser /><ProductPortal /></main>;
}
