"use client";

import Image from "next/image";
import { ArrowRight, BadgeCheck, Bookmark, CalendarDays, ExternalLink, Hotel, MapPin, RefreshCw, Sparkles, Users, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { AuthGate } from "@/components/auth/auth-gate";
import type { Reservation } from "@/lib/models";
import { usePremiumNavigation } from "@/lib/premium-navigation";
import { useProduct } from "@/lib/product-context";

type Tab = "upcoming" | "cancelled" | "saved";

function money(value: number, currency: string) {
  return new Intl.NumberFormat("en", { style: "currency", currency, maximumFractionDigits: 0 }).format(value);
}

function date(value: string) {
  return new Intl.DateTimeFormat("en", { day: "numeric", month: "short", year: "numeric" }).format(new Date(`${value}T12:00:00`));
}

function ReservationDetail({ reservation, onClose }: { reservation: Reservation; onClose: () => void }) {
  const { cancelReservation } = useProduct();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cancel = async () => { setBusy(true); setError(null); try { await cancelReservation(reservation.id); onClose(); } catch (err) { setError(err instanceof Error ? err.message : "Could not cancel this reservation."); } finally { setBusy(false); } };
  return <motion.div className="stay-detail-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(event) => { if (event.currentTarget === event.target) onClose(); }}><motion.aside className="stay-detail" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}><button className="stay-detail-close" onClick={onClose}><X /></button><div className="stay-detail-image">{reservation.imageUrl ? <Image src={reservation.imageUrl} alt="" fill unoptimized sizes="520px" /> : <Hotel />}</div><div className="stay-detail-content"><span className="demo-label">DEMO RESERVATION</span><div className="stay-detail-status"><i className={reservation.status} />{reservation.status}</div><h2>{reservation.hotelName}</h2>{reservation.placeName && <p><MapPin />{reservation.placeName}</p>}<dl><div><dt>REFERENCE</dt><dd>{reservation.reference}</dd></div><div><dt>DATES</dt><dd>{date(reservation.checkIn)} — {date(reservation.checkOut)}</dd></div><div><dt>PARTY</dt><dd>{reservation.adults} adults · {reservation.rooms} room{reservation.rooms === 1 ? "" : "s"}</dd></div><div><dt>QUOTED TOTAL</dt><dd>{money(reservation.totalPrice, reservation.currency)}</dd></div><div><dt>RATE SOURCE</dt><dd>{reservation.providerName || "Xotelo partner"}</dd></div><div><dt>RATE CHECKED</dt><dd>{new Date(reservation.rateCollectedAt).toLocaleString()}</dd></div></dl><div className="demo-notice"><Sparkles /><p><strong>For demonstration only</strong><span>No payment, hotel confirmation or inventory hold has been made.</span></p></div>{reservation.hotelUrl && <a href={reservation.hotelUrl} target="_blank" rel="noreferrer">View hotel source <ExternalLink /></a>}{reservation.status === "confirmed" && !confirming && <button className="cancel-trigger" onClick={() => setConfirming(true)}>Cancel demo reservation</button>}{confirming && <div className="cancel-confirm"><strong>Cancel {reservation.reference}?</strong><p>This keeps the record visible under Cancelled.</p><div><button onClick={() => setConfirming(false)}>Keep reservation</button><button disabled={busy} onClick={cancel}>{busy ? "Cancelling…" : "Confirm cancellation"}</button></div></div>}{error && <p className="inline-error">{error}</p>}</div></motion.aside></motion.div>;
}

function MyStayExperience() {
  const { navigate } = usePremiumNavigation();
  const { reservations, bookmarks, dataLoading, dataError, refreshData, toggleBookmark } = useProduct();
  const [tab, setTab] = useState<Tab>("upcoming");
  const [selected, setSelected] = useState<Reservation | null>(null);
  const visibleReservations = reservations.filter((item) => tab === "cancelled" ? item.status === "cancelled" : item.status === "confirmed");
  return <main className="my-stay-page" id="main-content"><header className="my-stay-hero"><div><span>YOUR PRIVATE SPACE</span><h1>My stay,<br /><em>clearly arranged.</em></h1><p>Demo reservations and saved hotels, gathered in one quiet place.</p></div><button onClick={() => navigate("/assistant", "Opening your concierge")}><Sparkles /> Ask StayAI <ArrowRight /></button></header><section className="my-stay-shell"><div className="my-stay-toolbar"><nav>{(["upcoming", "cancelled", "saved"] as Tab[]).map((item) => <button className={tab === item ? "active" : ""} key={item} onClick={() => setTab(item)}>{item}<span>{item === "saved" ? bookmarks.length : reservations.filter((reservation) => reservation.status === (item === "upcoming" ? "confirmed" : "cancelled")).length}</span></button>)}</nav><button onClick={() => void refreshData()} disabled={dataLoading}><RefreshCw className={dataLoading ? "spin" : ""} /> Refresh</button></div>{dataError && <div className="stay-data-error"><p>{dataError}</p><button onClick={() => void refreshData()}>Try again</button></div>}{dataLoading && reservations.length === 0 && bookmarks.length === 0 ? <div className="stay-loading"><span /><p>Opening your private records</p></div> : tab === "saved" ? bookmarks.length ? <div className="saved-grid">{bookmarks.map((bookmark) => <article key={bookmark.id}><div>{bookmark.hotel.imageUrl ? <Image src={bookmark.hotel.imageUrl} alt="" fill unoptimized sizes="(max-width:760px) 100vw, 420px" /> : <Bookmark />}</div><small>SAVED FROM XOTELO</small><h2>{bookmark.hotel.name}</h2><p>{bookmark.hotel.placeName || bookmark.hotel.reason}</p><footer><button onClick={() => navigate("/assistant", "Searching this stay")}>Ask about this stay <ArrowRight /></button><button onClick={() => void toggleBookmark(bookmark.hotel)}>Remove</button></footer></article>)}</div> : <Empty kind="saved" onExplore={() => navigate("/assistant", "Opening your concierge")} /> : visibleReservations.length ? <div className="reservation-list">{visibleReservations.map((reservation, index) => <motion.button key={reservation.id} onClick={() => setSelected(reservation)} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * .06 }}><div className="reservation-list-image">{reservation.imageUrl ? <Image src={reservation.imageUrl} alt="" fill unoptimized sizes="240px" /> : <Hotel />}</div><span className="reservation-index">{String(index + 1).padStart(2, "0")}</span><div className="reservation-main"><small>{reservation.status === "confirmed" ? "UPCOMING DEMO STAY" : "CANCELLED DEMO STAY"}</small><h2>{reservation.hotelName}</h2><p><MapPin />{reservation.placeName || "Location from Xotelo"}</p></div><div className="reservation-meta"><span><CalendarDays /><small>DATES</small><strong>{date(reservation.checkIn)} — {date(reservation.checkOut)}</strong></span><span><Users /><small>PARTY</small><strong>{reservation.adults} guests · {reservation.rooms} room</strong></span></div><div className="reservation-reference"><i className={reservation.status} />{reservation.reference}<ArrowRight /></div></motion.button>)}</div> : <Empty kind={tab} onExplore={() => navigate("/assistant", "Opening your concierge")} />}</section><AnimatePresence>{selected && <ReservationDetail reservation={reservations.find((item) => item.id === selected.id) || selected} onClose={() => setSelected(null)} />}</AnimatePresence></main>;
}

function Empty({ kind, onExplore }: { kind: Tab; onExplore: () => void }) {
  return <div className="stay-empty"><span>{kind === "saved" ? <Bookmark /> : <Sparkles />}</span><small>{kind.toUpperCase()}</small><h2>{kind === "upcoming" ? "No demo stays yet." : kind === "cancelled" ? "Nothing cancelled." : "No saved stays yet."}</h2><p>{kind === "cancelled" ? "Cancelled demo reservations will remain here for reference." : "Tell StayAI what you have in mind and start with current Xotelo hotel data."}</p>{kind !== "cancelled" && <button onClick={onExplore}>Start with StayAI <ArrowRight /></button>}</div>;
}

export function StayPage() { return <AuthGate><MyStayExperience /></AuthGate>; }
