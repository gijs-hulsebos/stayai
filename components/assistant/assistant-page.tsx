"use client";

import Image from "next/image";
import { ArrowRight, BadgeCheck, Bookmark, CalendarDays, Check, ExternalLink, Heart, MapPin, Minus, Plus, RefreshCw, Send, Sparkles, Star, Users, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { AuthGate } from "@/components/auth/auth-gate";
import type { AssistantAction, AssistantResponse, HotelResult, RequestedField, SearchContext } from "@/lib/models";
import { useProduct } from "@/lib/product-context";

const prompts = [
  ["A quiet design hotel in Lisbon", "For a considered city break"],
  ["A coastal stay for two", "With room to slow down"],
  ["A family hotel in Amsterdam", "Practical, central and calm"],
  ["Show my reservations", "Open your demo bookings"],
];

function currency(value: number, code = "EUR") {
  return new Intl.NumberFormat("en", { style: "currency", currency: code, maximumFractionDigits: 0 }).format(value);
}

function displayError(message: string) {
  const normalized = message.toLowerCase();
  if (normalized.includes("rapidapi") || normalized.includes("xotelo-hotel-prices")) {
    return "Live hotel search is not connected yet. Once Xotelo access is enabled, StayAI can search current stays and rates here.";
  }
  if (normalized.includes("invalid or expired session")) {
    return "Your secure session has expired. Sign in again to continue this conversation.";
  }
  return message;
}

function formatStayDates(context?: SearchContext) {
  if (!context?.checkIn || !context.checkOut) return "Not selected";
  const format = (value: string) => new Intl.DateTimeFormat("en", { day: "numeric", month: "short" }).format(new Date(`${value}T12:00:00`));
  return `${format(context.checkIn)} — ${format(context.checkOut)}`;
}

type BriefSection = "destination" | "dates" | "party" | "preferences";

function localIso(date: Date) {
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 10);
}

function TripBrief({ context, onReset, onSearch, busy }: { context?: SearchContext; onReset: () => void; onSearch: (message: string) => void; busy: boolean }) {
  const [draft, setDraft] = useState<SearchContext>(context || {});
  const [active, setActive] = useState<BriefSection>("destination");
  useEffect(() => {
    if (!context) return;
    setDraft((current) => ({ ...current, ...context }));
  }, [context]);

  const preferences = [...new Set([...(draft.atmosphere || []), ...(draft.amenities || []), ...(draft.accessibility || [])])];
  const party = draft.adults
    ? `${draft.adults} ${draft.adults === 1 ? "guest" : "guests"} · ${draft.rooms || 1} ${draft.rooms === 1 ? "room" : "rooms"}`
    : "Not selected";
  const completed = [draft.destination, draft.checkIn && draft.checkOut, draft.adults, draft.budget || preferences.length].filter(Boolean).length;
  const today = localIso(new Date());

  const setWeekend = () => {
    const start = new Date();
    const daysUntilSaturday = ((6 - start.getDay() + 7) % 7) || 7;
    start.setDate(start.getDate() + daysUntilSaturday);
    const end = new Date(start);
    end.setDate(end.getDate() + 2);
    setDraft((current) => ({ ...current, checkIn: localIso(start), checkOut: localIso(end) }));
  };
  const setNextMonth = () => {
    const start = new Date();
    start.setMonth(start.getMonth() + 1, 1);
    const end = new Date(start);
    end.setDate(end.getDate() + 4);
    setDraft((current) => ({ ...current, checkIn: localIso(start), checkOut: localIso(end) }));
  };
  const setParty = (adults: number, children = 0, rooms = 1, pets = 0) => setDraft((current) => ({ ...current, adults, children, rooms, pets }));
  const adjust = (field: "adults" | "children" | "rooms" | "pets", amount: number) => {
    const minimum = field === "adults" || field === "rooms" ? 1 : 0;
    const fallback = field === "adults" ? 2 : field === "rooms" ? 1 : 0;
    setDraft((current) => ({
      ...current,
      adults: current.adults || 2,
      rooms: current.rooms || 1,
      [field]: Math.max(minimum, (current[field] ?? fallback) + amount),
    }));
  };
  const togglePreference = (value: string) => setDraft((current) => {
    const selected = [...new Set([...(current.atmosphere || []), ...(current.amenities || []), ...(current.accessibility || [])])];
    const next = selected.includes(value) ? selected.filter((item) => item !== value) : [...selected, value];
    return { ...current, atmosphere: next, amenities: [], accessibility: [] };
  });
  const reset = () => {
    setDraft({});
    setActive("destination");
    onReset();
  };
  const search = () => {
    if (!draft.destination) return;
    const details = [`Destination: ${draft.destination}`];
    if (draft.checkIn && draft.checkOut) details.push(`Dates: ${draft.checkIn} to ${draft.checkOut}`);
    if (draft.adults) details.push(`Party: ${draft.adults} adults, ${draft.children || 0} children, ${draft.pets || 0} pets, ${draft.rooms || 1} rooms`);
    if (draft.budget) details.push(`Nightly budget: ${draft.budget}`);
    if (preferences.length) details.push(`Preferences: ${preferences.join(", ")}`);
    onSearch(`${details.join(". ")}. Find the strongest matching stays.`);
  };

  const sections: Array<{ id: BriefSection; label: string; value: string; icon: React.ReactNode; complete: boolean }> = [
    { id: "destination", label: "Destination", value: draft.destination || "Select a place", icon: <MapPin />, complete: Boolean(draft.destination) },
    { id: "dates", label: "Dates", value: formatStayDates(draft), icon: <CalendarDays />, complete: Boolean(draft.checkIn && draft.checkOut) },
    { id: "party", label: "Party", value: party, icon: <Users />, complete: Boolean(draft.adults) },
    { id: "preferences", label: "Preferences", value: draft.budget || preferences.slice(0, 2).join(" · ") || "Add your priorities", icon: <Bookmark />, complete: Boolean(draft.budget || preferences.length) },
  ];

  return <aside className="assistant-brief" aria-label="Build a trip search">
    <div className="assistant-brief-inner">
      <header>
        <div><span>BUILD YOUR SEARCH</span><p>Select several details, then search</p></div>
        <em>{completed}/4</em>
      </header>
      <div className="brief-progress" aria-hidden="true"><i style={{ width: `${Math.max(7, completed * 25)}%` }} /></div>
      <nav className="brief-section-tabs" aria-label="Search details">
        {sections.map((section) => <button type="button" key={section.id} className={`${active === section.id ? "active" : ""} ${section.complete ? "complete" : ""}`} onClick={() => setActive(section.id)}><span>{section.icon}<small>{section.label}</small></span><strong>{section.value}</strong><ArrowRight /></button>)}
      </nav>

      <AnimatePresence mode="wait">
        <motion.section className="brief-editor" key={active} initial={{ opacity: 0, y: 7 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} transition={{ duration: .2 }}>
          {active === "destination" && <><label>CHOOSE A DESTINATION</label><div className="brief-choice-grid">{["Lisbon", "Amsterdam", "Copenhagen", "Paris"].map((city) => <button type="button" key={city} className={draft.destination === city ? "selected" : ""} onClick={() => setDraft((current) => ({ ...current, destination: city }))}>{city}{draft.destination === city ? <Check /> : <Plus />}</button>)}</div></>}
          {active === "dates" && <><label>TRAVEL DATES</label><div className="brief-date-fields"><span>CHECK-IN<input type="date" min={today} value={draft.checkIn || ""} onChange={(event) => setDraft((current) => ({ ...current, checkIn: event.target.value }))} /></span><span>CHECK-OUT<input type="date" min={draft.checkIn || today} value={draft.checkOut || ""} onChange={(event) => setDraft((current) => ({ ...current, checkOut: event.target.value }))} /></span></div><div className="brief-shortcuts"><button type="button" onClick={setWeekend}>This weekend</button><button type="button" onClick={setNextMonth}>Next month</button><button type="button" onClick={() => setDraft((current) => ({ ...current, checkIn: undefined, checkOut: undefined }))}>Flexible</button></div></>}
          {active === "party" && <><label>WHO IS COMING?</label><div className="brief-shortcuts"><button type="button" onClick={() => setParty(2)}>For two</button><button type="button" onClick={() => setParty(1)}>Solo</button><button type="button" onClick={() => setParty(2, 2, 2)}>Family</button></div><div className="brief-counters">{([['Adults', 'adults', draft.adults ?? 2], ['Children', 'children', draft.children ?? 0], ['Rooms', 'rooms', draft.rooms ?? 1], ['Pets', 'pets', draft.pets ?? 0]] as const).map(([label, field, value]) => <div key={field}><span>{label}</span><p><button type="button" onClick={() => adjust(field, -1)}><Minus /></button><b>{value}</b><button type="button" onClick={() => adjust(field, 1)}><Plus /></button></p></div>)}</div></>}
          {active === "preferences" && <><label>WHAT MATTERS MOST?</label><div className="brief-choice-grid preferences">{["Quiet", "Design-led", "Boutique", "Pool", "Wellness", "Breakfast", "Pet-friendly", "Central"].map((value) => <button type="button" key={value} className={preferences.includes(value) ? "selected" : ""} onClick={() => togglePreference(value)}>{value}{preferences.includes(value) ? <Check /> : <Plus />}</button>)}</div><label className="brief-budget-label">NIGHTLY BUDGET</label><div className="brief-shortcuts budget">{["Under €200", "€200–€400", "€400+", "Flexible"].map((value) => <button type="button" key={value} className={draft.budget === value ? "selected" : ""} onClick={() => setDraft((current) => ({ ...current, budget: value }))}>{value}</button>)}</div></>}
        </motion.section>
      </AnimatePresence>

      <div className="brief-note"><BadgeCheck /><p><strong>Your complete brief</strong><span>Nothing is sent until you press Search stays.</span></p></div>
      <div className="brief-actions"><button className="brief-reset" type="button" onClick={reset} disabled={busy}>Clear</button><button className="brief-search" type="button" onClick={search} disabled={busy || !draft.destination}><Sparkles />{busy ? "Searching…" : "Search stays"}<ArrowRight /></button></div>
    </div>
  </aside>;
}

function Activity() {
  const { activity } = useProduct();
  return <motion.div className="agent-progress" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}><span className="assistant-avatar"><Sparkles /></span><div>{activity.map((step, index) => <p className={step.state} key={step.id}><i>{step.state === "complete" ? <Check /> : <span />}</i>{step.label}{index === activity.length - 1 && step.state === "active" && <b>•••</b>}</p>)}</div></motion.div>;
}

function FollowUp({ fields, context }: { fields: RequestedField[]; context?: SearchContext }) {
  const { busy, sendMessage } = useProduct();
  const [destination, setDestination] = useState(context?.destination || "");
  const [checkIn, setCheckIn] = useState(context?.checkIn || "");
  const [checkOut, setCheckOut] = useState(context?.checkOut || "");
  const [adults, setAdults] = useState(context?.adults || 2);
  const [children, setChildren] = useState(context?.children || 0);
  const [pets, setPets] = useState(context?.pets || 0);
  const [rooms, setRooms] = useState(context?.rooms || 1);
  const [budget, setBudget] = useState(context?.budget || "");
  const [preferences, setPreferences] = useState<string[]>([]);
  const today = new Date().toISOString().slice(0, 10);
  const needs = (field: RequestedField) => fields.includes(field);
  const invalidDates = Boolean(needs("dates") && (!checkIn || !checkOut || checkOut <= checkIn));
  const canSubmit = (!needs("destination") || destination.trim()) && !invalidDates && (!needs("budget") || budget);

  const toggle = (value: string) => setPreferences((current) => current.includes(value) ? current.filter((item) => item !== value) : [...current, value]);
  const submit = () => {
    const details: string[] = [];
    if (needs("destination")) details.push(`Destination: ${destination}`);
    if (needs("dates")) details.push(`Dates: ${checkIn} to ${checkOut}`);
    if (needs("guests")) details.push(`Guests: ${adults} adults, ${children} children, ${pets} pets`);
    if (needs("rooms")) details.push(`Rooms: ${rooms}`);
    if (needs("budget")) details.push(`Nightly budget: ${budget}`);
    if (needs("atmosphere") || needs("amenities") || needs("accessibility")) details.push(`Preferences: ${preferences.length ? preferences.join(", ") : "flexible"}`);
    void sendMessage(details.join(". "));
  };

  return <motion.div className="structured-reply" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}><header><span>COMPLETE THE SEARCH</span><small>Only the details StayAI asked for</small></header>
    {needs("destination") && <section><label className="structured-title"><MapPin />Destination</label><input value={destination} onChange={(event) => setDestination(event.target.value)} placeholder="City, area or landmark" autoFocus /><div className="chip-row">{["Lisbon", "Amsterdam", "Copenhagen", "Lake Como"].map((city) => <button className={destination === city ? "active" : ""} onClick={() => setDestination(city)} key={city}>{city}</button>)}</div></section>}
    {needs("dates") && <section><label className="structured-title"><CalendarDays />Travel dates</label><div className="date-pair"><label>CHECK-IN<input type="date" min={today} value={checkIn} onChange={(event) => setCheckIn(event.target.value)} /></label><ArrowRight /><label>CHECK-OUT<input type="date" min={checkIn || today} value={checkOut} onChange={(event) => setCheckOut(event.target.value)} /></label></div>{invalidDates && <small className="field-error">Choose a check-out date after check-in.</small>}</section>}
    {(needs("guests") || needs("rooms")) && <section><label className="structured-title"><Users />Party</label><div className="counter-grid">{[["Adults", adults, setAdults, 1], ["Children", children, setChildren, 0], ["Pets", pets, setPets, 0], ["Rooms", rooms, setRooms, 1]].filter(([label]) => label === "Rooms" ? needs("rooms") : needs("guests")).map(([label, value, setter, min]) => <div key={label as string}><span>{label as string}</span><p><button onClick={() => (setter as React.Dispatch<React.SetStateAction<number>>)((current) => Math.max(min as number, current - 1))}><Minus /></button><b>{value as number}</b><button onClick={() => (setter as React.Dispatch<React.SetStateAction<number>>)((current) => current + 1)}><Plus /></button></p></div>)}</div></section>}
    {needs("budget") && <section><label className="structured-title">Nightly budget</label><div className="choice-grid">{["Under €150", "€150–€250", "€250–€400", "€400+", "Flexible"].map((value) => <button className={budget === value ? "active" : ""} onClick={() => setBudget(value)} key={value}>{value}</button>)}</div></section>}
    {(needs("atmosphere") || needs("amenities") || needs("accessibility")) && <section><label className="structured-title">What matters</label><div className="choice-grid">{["Quiet", "Boutique", "Romantic", "Family-friendly", "Pool", "Breakfast", "Pet-friendly", "Step-free access"].map((value) => <button className={preferences.includes(value) ? "active" : ""} onClick={() => toggle(value)} key={value}>{preferences.includes(value) && <Check />}{value}</button>)}</div></section>}
    <button className="structured-submit" disabled={!canSubmit || busy} onClick={submit}>Continue with StayAI <ArrowRight /></button>
  </motion.div>;
}

function HotelCard({ hotel, context, index }: { hotel: HotelResult; context?: SearchContext; index: number }) {
  const { toggleBookmark, isBookmarked, createReservation } = useProduct();
  const [confirming, setConfirming] = useState(false);
  const [saving, setSaving] = useState(false);
  const [creating, setCreating] = useState(false);
  const [created, setCreated] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [imageFailed, setImageFailed] = useState(false);
  const saved = isBookmarked(hotel.hotelKey);
  const canReserve = Boolean(context?.checkIn && context?.checkOut);
  const save = async () => { setSaving(true); setError(null); try { await toggleBookmark(hotel); } catch (err) { setError(err instanceof Error ? err.message : "Could not save this stay."); } finally { setSaving(false); } };
  const reserve = async () => {
    if (!context) return;
    setCreating(true); setError(null);
    try { const result = await createReservation(hotel, context); setCreated(result.reference); setConfirming(false); }
    catch (err) { setError(err instanceof Error ? err.message : "Could not create the demo reservation."); }
    finally { setCreating(false); }
  };
  const imageLabel = `${hotel.name}${hotel.placeName ? ` in ${hotel.placeName}` : ""}`;
  return <article className={`hotel-card ${index === 0 ? "is-featured" : ""}`}><div className="hotel-image">{hotel.imageUrl && !imageFailed ? <Image src={hotel.imageUrl} alt={imageLabel} fill unoptimized sizes={index === 0 ? "(max-width: 900px) 100vw, 620px" : "(max-width: 760px) 100vw, 440px"} onError={() => setImageFailed(true)} /> : <div className="hotel-placeholder"><Sparkles /><small>PROPERTY IMAGE UNAVAILABLE</small><strong>{hotel.name}</strong></div>}<div className="hotel-image-meta"><span>{String(index + 1).padStart(2, "0")}</span><em>{hotel.rating ? <><Star fill="currentColor" />{hotel.rating.toFixed(1)}{hotel.reviewCount ? ` · ${hotel.reviewCount.toLocaleString()} reviews` : ""}</> : "STAYAI SELECTION"}</em></div><button className={saved ? "saved" : ""} onClick={save} disabled={saving} aria-label={saved ? `Remove ${hotel.name} from saved stays` : `Save ${hotel.name}`}><Heart fill={saved ? "currentColor" : "none"} /></button></div><div className="hotel-copy"><small>{hotel.accommodationType || "STAY"}{hotel.placeName ? ` · ${hotel.placeName}` : ""}</small><h3>{hotel.name}</h3><p>{hotel.reason}</p>{hotel.highlights.length > 0 && <div className="hotel-highlights">{hotel.highlights.slice(0, 3).map((item) => <span key={item}>{item}</span>)}</div>}<div className="hotel-rate">{hotel.rate ? <><span>FROM <strong>{currency(hotel.rate.nightlyRate, hotel.rate.currency)}</strong> / night</span><small>{hotel.rate.providerName} · checked {new Date(hotel.rate.collectedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</small></> : <><span>RATE ON REQUEST</span><small>Add dates to check current rates</small></>}</div><footer>{hotel.url && <a href={hotel.url} target="_blank" rel="noreferrer">View property <ExternalLink /></a>}<button onClick={() => setConfirming(true)} disabled={!canReserve}>Reserve <ArrowRight /></button></footer>{error && <p className="inline-error">{error}</p>}{created && <div className="reservation-created"><BadgeCheck /><span><strong>Demo reservation created</strong><small>Reference {created}</small></span></div>}</div>
    <AnimatePresence>{confirming && context && <motion.div className="reservation-confirm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><button className="confirm-close" onClick={() => setConfirming(false)}><X /></button><small>DEMO RESERVATION</small><h4>Confirm {hotel.name}</h4><p>{hotel.rate ? "This records a StayAI demonstration only. It does not contact or reserve with the hotel." : "This stores a StayAI demo reservation request. No hotel inventory is held and no charge is made."}</p><dl><div><dt>DATES</dt><dd>{context.checkIn} — {context.checkOut}</dd></div><div><dt>PARTY</dt><dd>{context.adults || 1} guests · {context.rooms || 1} room</dd></div><div><dt>{hotel.rate ? "QUOTED TOTAL" : "PRICE"}</dt><dd>{hotel.rate ? currency(hotel.rate.totalPrice, hotel.rate.currency) : "Rate on request"}</dd></div><div><dt>RATE SOURCE</dt><dd>{hotel.rate?.providerName || "No live quote"}</dd></div></dl><button className="confirm-reservation" disabled={creating} onClick={reserve}>{creating ? "Creating reservation…" : "Create demo reservation"}<BadgeCheck /></button></motion.div>}</AnimatePresence>
  </article>;
}

function ReservationActionCard({ action }: { action: AssistantAction }) {
  const { createReservation, reactivateReservation } = useProduct();
  const [working, setWorking] = useState(false);
  const [completed, setCompleted] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const isCreate = action.kind === "create_reservation";
  if (!isCreate && action.kind !== "reactivate_reservation") return null;

  const execute = async () => {
    setWorking(true);
    setError(null);
    try {
      if (isCreate) {
        if (!action.hotel || !action.searchContext?.checkIn || !action.searchContext.checkOut) throw new Error("This reservation needs a hotel and travel dates.");
        const reservation = await createReservation(action.hotel, action.searchContext);
        setCompleted(`Reservation ${reservation.reference} created`);
      } else {
        if (!action.targetId) throw new Error("This reservation could not be identified.");
        const reservation = await reactivateReservation(action.targetId);
        setCompleted(`Reservation ${reservation.reference} reactivated`);
      }
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "The reservation could not be updated.");
    } finally {
      setWorking(false);
    }
  };

  const hotelName = action.hotel?.name || action.reservation?.hotelName || "this stay";
  const dates = isCreate
    ? `${action.searchContext?.checkIn} — ${action.searchContext?.checkOut}`
    : action.reservation ? `${action.reservation.checkIn} — ${action.reservation.checkOut}` : null;

  return <section className={`assistant-reservation-action ${completed ? "is-complete" : ""}`}>
    <header><span>{completed ? <BadgeCheck /> : <CalendarDays />}</span><div><small>DEMO RESERVATION</small><h3>{completed || (isCreate ? `Confirm ${hotelName}` : `Reactivate ${hotelName}`)}</h3></div></header>
    {!completed && <>
      <p>{isCreate ? "Create this reservation in your StayAI account." : "Move this cancelled reservation back to Upcoming."}</p>
      {dates && <dl>
        <div><dt>DATES</dt><dd>{dates}</dd></div>
        {action.reservation?.reference && <div><dt>REFERENCE</dt><dd>{action.reservation.reference}</dd></div>}
      </dl>}
      <div className="assistant-action-notice"><BadgeCheck /><span>This is a StayAI demonstration record. No hotel inventory is held and no payment is taken.</span></div>
      <button type="button" onClick={() => void execute()} disabled={working}>{working ? "Updating your stay…" : isCreate ? "Create demo reservation" : "Reactivate reservation"}<ArrowRight /></button>
    </>}
    {completed && <p>Your My Stay page has been updated.</p>}
    {error && <p className="inline-error">{error}</p>}
  </section>;
}

function AssistantBubble({ response }: { response: AssistantResponse }) {
  const hotels = response.hotels || [];
  const reservations = response.reservations || [];
  const label = hotels.length
    ? "CURATED SHORTLIST"
    : reservations.length
      ? "YOUR STAYS"
      : response.mode === "clarification"
        ? "A FEW DETAILS"
        : "STAYAI CONCIERGE";
  const meta = hotels.length
    ? `${String(hotels.length).padStart(2, "0")} ${hotels.length === 1 ? "property" : "properties"}${response.searchContext?.destination ? ` · ${response.searchContext.destination}` : ""}`
    : reservations.length
      ? `${String(reservations.length).padStart(2, "0")} ${reservations.length === 1 ? "reservation" : "reservations"}`
      : "PERSONALISED TO YOUR BRIEF";
  return <div className="assistant-bubble"><section className={`assistant-response-note ${hotels.length ? "has-results" : ""}`}><header><span>{label}</span><small>{meta}</small></header><p>{response.reply}</p></section>{reservations.length > 0 && <div className="inline-reservations">{reservations.map((reservation) => <article key={reservation.id}><BadgeCheck /><span><strong>{reservation.hotelName}</strong><small>{reservation.reference} · {reservation.checkIn} — {reservation.checkOut}</small></span><em>{reservation.status}</em></article>)}</div>}{response.actions?.map((action) => <ReservationActionCard key={action.id} action={action} />)}{hotels.length > 0 && <div className="hotel-results">{hotels.map((hotel, index) => <HotelCard key={hotel.hotelKey} hotel={hotel} context={response.searchContext} index={index} />)}</div>}{response.requestedFields.length > 0 && <FollowUp fields={response.requestedFields} context={response.searchContext} />}</div>;
}

function AssistantExperience() {
  const { turns, activity, busy, sendMessage, retryMessage, clearConversation } = useProduct();
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }); }, [turns, activity]);
  useEffect(() => { const pending = sessionStorage.getItem("stayai_pending_prompt"); if (pending) { sessionStorage.removeItem("stayai_pending_prompt"); void sendMessage(pending); } }, []); // intentional one-time handoff
  const submit = () => { const value = input.trim(); if (!value || busy) return; setInput(""); void sendMessage(value); };
  const latestContext = [...turns].reverse().find((turn) => turn.response?.searchContext)?.response?.searchContext;

  return <main className={`assistant-page assistant-first ${turns.length ? "has-conversation" : "is-empty"}`} id="main-content">
    <section className="assistant-shell">
      <div className="conversation" aria-live="polite">
        {turns.length === 0 && <motion.div className="assistant-welcome" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <span>PRIVATE TRAVEL CONCIERGE</span>
          <h1>Where would<br /><em>you like to stay?</em></h1>
          <p>Tell us where you want to go, when you are travelling and what matters to you. StayAI turns the conversation into a considered shortlist.</p>
          <div>{prompts.map(([title, detail], index) => <button key={title} onClick={() => void sendMessage(title)} disabled={busy}><small>0{index + 1}</small><span><strong>{title}</strong><em>{detail}</em></span><ArrowRight /></button>)}</div>
        </motion.div>}
        {turns.map((turn) => turn.role === "user"
          ? <motion.div className="message-row user-row" key={turn.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}><div className="user-message">{turn.text}</div></motion.div>
          : <motion.div className="message-row assistant-row" key={turn.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <span className="assistant-mini"><Sparkles /></span>
              {turn.isError
                ? <div className="assistant-error"><RefreshCw /><div><small>SEARCH CONNECTION</small><strong>We could not complete that search</strong><p>{displayError(turn.text)}</p>{turn.failedMessage && <button onClick={() => void retryMessage(turn.failedMessage!)}>Try again <ArrowRight /></button>}</div></div>
                : turn.response ? <AssistantBubble response={turn.response} /> : <p>{turn.text}</p>}
            </motion.div>)}
        {activity.length > 0 && <Activity />}
        <div ref={endRef} />
      </div>
      <div className="composer-wrap">
        <div className="composer-tools"><span>ASK STAYAI</span><button onClick={clearConversation} disabled={busy}><Plus /> New chat</button></div>
        <form className="composer" onSubmit={(event) => { event.preventDefault(); submit(); }}>
          <Sparkles />
          <label className="sr-only" htmlFor="stayai-message">Ask StayAI</label>
          <input id="stayai-message" value={input} onChange={(event) => setInput(event.target.value)} placeholder="Describe the stay you have in mind…" disabled={busy} autoComplete="off" />
          <button type="submit" aria-label="Send message" disabled={busy || !input.trim()}>{busy ? <i /> : <Send />}</button>
        </form>
        <small>Current hotel data via Xotelo · Reservations are demonstrations only</small>
      </div>
    </section>
    <TripBrief context={latestContext} onReset={clearConversation} onSearch={(message) => void sendMessage(message, { fresh: true })} busy={busy} />
  </main>;
}

export function AssistantPage() { return <AuthGate><AssistantExperience /></AuthGate>; }
