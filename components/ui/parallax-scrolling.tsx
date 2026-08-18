"use client";

import { ArrowDown, ArrowRight, Compass, Sparkles } from "lucide-react";
import { motion, useMotionValueEvent, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import type { MotionValue } from "motion/react";
import { useLayoutEffect, useRef } from "react";
import { PremiumLink } from "@/lib/premium-navigation";

const SCENE_MARKERS = [0, 0.2, 0.43, 0.67, 1] as const;
const WALKTHROUGH_VIDEO = "/walkthrough-spatial-v3/video/stayai-scroll-master-bidirectional-qp23-1080p60.mp4?v=bidirectional-scroll-23";
const WALKTHROUGH_DURATION = 5.5;
const BIDIRECTIONAL_LAST_FRAME = 659;
// Every stop is an exact, independently decodable frame in the all-intra master.
const VIDEO_SCENE_TIMES = [0, 1.4, 2.7, 4, 5.4833] as const;
const SCENE_STEPS = [
  {
    step: "01",
    title: "Tell us what you’re looking for",
    body: "Describe the kind of stay you have in mind.",
    range: [0.14, 0.195, 0.225, 0.32],
  },
  {
    step: "02",
    title: "Choose your dates",
    body: "Tell us when you’re going and who’s coming.",
    range: [0.33, 0.425, 0.455, 0.56],
  },
  {
    step: "03",
    title: "Add what matters to you",
    body: "Share the details that make the stay feel right.",
    range: [0.57, 0.665, 0.7, 0.82],
  },
  {
    step: "04",
    title: "Your stay is sorted",
    body: "StayAI finds the best matches for your trip.",
    range: [0.83, 0.985, 1],
  },
] as const;

function SceneWord({
  progress,
  word,
  index,
  count,
  range,
}: {
  progress: MotionValue<number>;
  word: string;
  index: number;
  count: number;
  range: readonly number[];
}) {
  const entryStart = range[0] ?? 0;
  const entryEnd = range[1] ?? entryStart + 0.08;
  const entrySpan = Math.max(0.025, entryEnd - entryStart);
  const wordStart = entryStart + (index / Math.max(1, count)) * entrySpan * 0.38;
  const wordEnd = Math.min(entryEnd, wordStart + entrySpan * 0.58);
  const hasExit = range.length === 4;
  const exitStart = range[2] ?? 1;
  const exitEnd = range[3] ?? 1;
  const input = hasExit ? [wordStart, wordEnd, exitStart, exitEnd] : [wordStart, wordEnd];
  const opacity = useTransform(progress, input, hasExit ? [0, 1, 1, 0] : [0, 1]);
  const y = useTransform(progress, input, hasExit ? [28, 0, 0, -14] : [28, 0]);
  const rotateX = useTransform(progress, [wordStart, wordEnd], [36, 0]);
  const filter = useTransform(progress, input, hasExit ? ["blur(6px)", "blur(0px)", "blur(0px)", "blur(3px)"] : ["blur(6px)", "blur(0px)"]);

  return <motion.span className="parallax__word" style={{ opacity, y, rotateX, filter }}>{word}</motion.span>;
}

function SceneNarrative({
  progress,
  step,
  title,
  body,
  range,
}: {
  progress: MotionValue<number>;
  step: string;
  title: string;
  body: string;
  range: readonly number[];
}) {
  const words = title.split(" ");
  const entryStart = range[0] ?? 0;
  const entryEnd = range[1] ?? entryStart + 0.08;
  const exitStart = range.length === 4 ? range[2] ?? 1 : 1;
  const exitEnd = range.length === 4 ? range[3] ?? 1 : 1;
  const opacity = useTransform(progress, [...range], range.length === 4 ? [0, 1, 1, 0] : [0, 1, 1]);
  const eyebrowX = useTransform(progress, [entryStart, entryEnd], [-24, 0]);
  const eyebrowTracking = useTransform(progress, [entryStart, entryEnd], [".36em", ".2em"]);
  const ruleScale = useTransform(progress, [entryStart, entryEnd], [0, 1]);
  const stepScale = useTransform(progress, [entryStart, entryEnd], [.72, 1]);
  const stepRotate = useTransform(progress, [entryStart, entryEnd], [-24, 0]);
  const bodyInput = range.length === 4 ? [entryStart, entryEnd, exitStart, exitEnd] : [entryStart, entryEnd];
  const bodyOpacity = useTransform(progress, bodyInput, range.length === 4 ? [0, 1, 1, 0] : [0, 1]);
  const bodyX = useTransform(progress, bodyInput, range.length === 4 ? [-18, 0, 0, 20] : [-18, 0]);
  const ghostX = useTransform(progress, [entryStart, range.at(-1) ?? 1], [36, -26]);
  const ghostOpacity = useTransform(progress, [...range], range.length === 4 ? [0, .065, .065, 0] : [0, .065, .065]);

  return (
    <motion.div className="parallax__scene-copy" data-step={step} style={{ opacity }}>
      <motion.i className="parallax__rule" style={{ scaleX: ruleScale }} />
      <motion.span className="parallax__scene-kicker" style={{ x: eyebrowX, letterSpacing: eyebrowTracking }}><motion.i style={{ scale: stepScale, rotate: stepRotate }}>{step}</motion.i> How StayAI works</motion.span>
      <h2>{words.map((word, index) => <SceneWord key={`${word}-${index}`} progress={progress} word={word} index={index} count={words.length} range={range} />)}</h2>
      <motion.p style={{ opacity: bodyOpacity, x: bodyX }}>{body}</motion.p>
      <motion.b className="parallax__ghost-step" style={{ x: ghostX, opacity: ghostOpacity }}>{step}</motion.b>
    </motion.div>
  );
}

function toReverseVideoTime(forwardTime: number) {
  const forwardFrame = Math.max(0, Math.min(329, Math.round(forwardTime * 60)));
  return (BIDIRECTIONAL_LAST_FRAME - forwardFrame) / 60;
}

function mapScrollToVideo(scrollProgress: number) {
  for (let index = 1; index < SCENE_MARKERS.length; index += 1) {
    const scrollStart = SCENE_MARKERS[index - 1] ?? 0;
    const scrollEnd = SCENE_MARKERS[index] ?? 1;
    if (scrollProgress > scrollEnd) continue;

    const videoStart = (VIDEO_SCENE_TIMES[index - 1] ?? 0) / WALKTHROUGH_DURATION;
    const videoEnd = (VIDEO_SCENE_TIMES[index] ?? WALKTHROUGH_DURATION) / WALKTHROUGH_DURATION;
    const localProgress = (scrollProgress - scrollStart) / Math.max(0.0001, scrollEnd - scrollStart);
    return videoStart + (videoEnd - videoStart) * Math.max(0, Math.min(1, localProgress));
  }

  return 1;
}

export function ParallaxComponent() {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const isNativePlaybackRef = useRef(false);
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });
  const progress = useSpring(scrollYProgress, {
    stiffness: 80,
    damping: 20,
    mass: 0.6,
    restDelta: 0.00005,
  });
  const titleY = useTransform(progress, [0, 1], [0, -180]);
  const titleScale = useTransform(progress, [0, 0.075, 0.135], [1, 1, 0.975]);
  const titleOpacity = useTransform(progress, [0, 0.075, 0.135], [1, 1, 0]);
  const titleFirstX = useTransform(progress, [0, 0.19], [0, -54]);
  const titleSecondX = useTransform(progress, [0, 0.19], [0, 78]);
  const titleTracking = useTransform(progress, [0, 0.12, 0.19], ["-.075em", "-.052em", "-.025em"]);
  const eyebrowX = useTransform(progress, [0, 0.19], [0, 38]);
  const supportX = useTransform(progress, [0, 0.19], [0, -24]);
  const actionsY = useTransform(progress, [0, 0.19], [0, 20]);
  const bookingY = useTransform(progress, [0, 1], [0, -110]);
  const bookingOpacity = useTransform(progress, [0, 0.075, 0.135], [0.92, 0.92, 0]);
  const shadeOpacity = useTransform(progress, [0, 1], [0.24, 0.38]);
  const fadeOpacity = useTransform(progress, [0.95, 1], [0, 1]);
  const meterScale = useTransform(progress, [0, 1], [0, 1]);

  useMotionValueEvent(progress, "change", (scrollProgress) => {
    const video = videoRef.current;
    if (
      !video
      || isNativePlaybackRef.current
      || video.readyState < HTMLMediaElement.HAVE_METADATA
    ) return;

    const duration = WALKTHROUGH_DURATION;
    const lastFrameTime = Math.max(0, (Math.floor(duration * 60) - 1) / 60);
    const targetTime = Math.min(
      lastFrameTime,
      Math.round(mapScrollToVideo(scrollProgress) * duration * 60) / 60,
    );
    if (Math.abs(video.currentTime - targetTime) >= 1 / 120) video.currentTime = targetTime;

  });

  useLayoutEffect(() => {
    const previousRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";
    const section = sectionRef.current;
    let wheelLocked = false;
    let wheelUnlockTimer: number | null = null;
    let playbackFrame: number | null = null;
    let playbackSeekHandler: (() => void) | null = null;

    const playNativeTo = (startTime: number, targetTime: number) => {
      const video = videoRef.current;
      if (!video || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) return;

      if (playbackFrame !== null) video.cancelVideoFrameCallback(playbackFrame);
      if (playbackSeekHandler) video.removeEventListener("seeked", playbackSeekHandler);
      video.pause();
      isNativePlaybackRef.current = true;
      video.playbackRate = 1;

      const beginPlayback = () => {
        playbackSeekHandler = null;
        const stopOnTarget = (_now: number, metadata: VideoFrameCallbackMetadata) => {
          if (metadata.mediaTime >= targetTime - 1 / 120) {
            video.pause();
            video.currentTime = targetTime;
            isNativePlaybackRef.current = false;
            playbackFrame = null;
            return;
          }
          playbackFrame = video.requestVideoFrameCallback(stopOnTarget);
        };

        playbackFrame = video.requestVideoFrameCallback(stopOnTarget);
        void video.play().catch(() => {
          if (playbackFrame !== null) video.cancelVideoFrameCallback(playbackFrame);
          playbackFrame = null;
          isNativePlaybackRef.current = false;
          video.currentTime = targetTime;
        });
      };

      if (Math.abs(video.currentTime - startTime) >= 1 / 120) {
        playbackSeekHandler = beginPlayback;
        video.addEventListener("seeked", beginPlayback, { once: true });
        video.currentTime = startTime;
      } else {
        beginPlayback();
      }
    };

    const resetHome = () => {
      window.scrollTo(0, 0);
      if (playbackFrame !== null && videoRef.current) {
        videoRef.current.cancelVideoFrameCallback(playbackFrame);
        playbackFrame = null;
      }
      if (playbackSeekHandler && videoRef.current) {
        videoRef.current.removeEventListener("seeked", playbackSeekHandler);
        playbackSeekHandler = null;
      }
      isNativePlaybackRef.current = false;
      if (videoRef.current && videoRef.current.readyState >= HTMLMediaElement.HAVE_METADATA) {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      }
    };
    resetHome();
    window.addEventListener("pageshow", resetHome);

    const onWheel = (event: WheelEvent) => {
      if (!section || Math.abs(event.deltaY) < 4) return;

      const travel = Math.max(1, section.offsetHeight - window.innerHeight);
      const progressNow = Math.max(0, Math.min(1, (window.scrollY - section.offsetTop) / travel));
      const insideWalkthrough = window.scrollY >= section.offsetTop - 2
        && window.scrollY <= section.offsetTop + travel + 2;
      if (!insideWalkthrough) return;

      const direction = Math.sign(event.deltaY);
      const target = direction > 0
        ? SCENE_MARKERS.find((marker) => marker > progressNow + 0.012)
        : [...SCENE_MARKERS].reverse().find((marker) => marker < progressNow - 0.012);

      // At either boundary, return control to the normal page scroll.
      if (target === undefined) return;

      event.preventDefault();
      if (wheelLocked) return;

      wheelLocked = true;
      const targetIndex = SCENE_MARKERS.indexOf(target);
      const forwardTarget = VIDEO_SCENE_TIMES[targetIndex] ?? WALKTHROUGH_DURATION;
      const forwardCurrent = mapScrollToVideo(progressNow) * WALKTHROUGH_DURATION;
      const videoStart = direction > 0 ? forwardCurrent : toReverseVideoTime(forwardCurrent);
      const videoTarget = direction > 0 ? forwardTarget : toReverseVideoTime(forwardTarget);
      const transitionMs = Math.abs(videoTarget - videoStart) * 1000;
      if (wheelUnlockTimer !== null) window.clearTimeout(wheelUnlockTimer);
      wheelUnlockTimer = window.setTimeout(() => {
        wheelLocked = false;
      }, Math.max(900, transitionMs + 260));

      window.scrollTo({
        top: section.offsetTop + target * travel,
        behavior: "auto",
      });

      if (videoTarget > videoStart + 1 / 60) {
        playNativeTo(videoStart, videoTarget);
      }
    };

    window.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      window.removeEventListener("pageshow", resetHome);
      window.removeEventListener("wheel", onWheel);
      if (wheelUnlockTimer !== null) window.clearTimeout(wheelUnlockTimer);
      if (playbackFrame !== null && videoRef.current) {
        videoRef.current.cancelVideoFrameCallback(playbackFrame);
      }
      if (playbackSeekHandler && videoRef.current) {
        videoRef.current.removeEventListener("seeked", playbackSeekHandler);
      }
      videoRef.current?.pause();
      isNativePlaybackRef.current = false;
      window.history.scrollRestoration = previousRestoration;
    };
  }, []);

  return (
    <div className="parallax">
      <section className="parallax__header" id="main-content" ref={sectionRef}>
        <div className="parallax__visuals">
          <div className="parallax__layers">
            <div className="parallax__video">
              <video
                ref={videoRef}
                className="parallax__film"
                muted
                playsInline
                preload="auto"
                disablePictureInPicture
                aria-label="A scroll-controlled walkthrough from the lakefront exterior into the bedroom"
                onLoadedMetadata={(event) => {
                  const video = event.currentTarget;
                  video.pause();
                  video.currentTime = 0;
                }}
                onCanPlay={(event) => {
                  const video = event.currentTarget;
                  if (video.dataset.scrollPrimed) return;
                  video.dataset.scrollPrimed = "true";
                  video.addEventListener("seeked", () => {
                    video.currentTime = 0;
                  }, { once: true });
                  video.currentTime = 0.2;
                }}
              >
                <source src={WALKTHROUGH_VIDEO} type="video/mp4" />
                Your browser does not support embedded video.
              </video>
            </div>
            <motion.div className="parallax__layer parallax__title-layer" style={prefersReducedMotion ? undefined : { y: titleY, scale: titleScale, opacity: titleOpacity }}>
              <motion.p className="parallax__eyebrow" style={{ x: eyebrowX }}>Private stays, perfectly hosted</motion.p>
              <motion.h1 className="parallax__title" style={{ letterSpacing: titleTracking }}><motion.span style={{ x: titleFirstX }}>Your stay,</motion.span><motion.em style={{ x: titleSecondX }}>sorted.</motion.em></motion.h1>
              <motion.p className="parallax__support" style={{ x: supportX }}>From arrival to late checkout, every detail of your luxury rental handled in one calm conversation.</motion.p>
              <motion.div className="parallax__actions" style={{ y: actionsY }}>
                <PremiumLink href="/stay" transitionLabel="Your private stay">Open my stay <ArrowRight /></PremiumLink>
                <PremiumLink href="/assistant" transitionLabel="Your private concierge"><Sparkles /> Ask StayAI</PremiumLink>
              </motion.div>
            </motion.div>
            <motion.div className="parallax__booking" style={prefersReducedMotion ? undefined : { y: bookingY, opacity: bookingOpacity }}>
              <div><span>AI-first hotel search</span><strong><i /> Xotelo data</strong></div>
              <h2>Search. Save. Reserve.</h2>
              <p><Compass /> Current hotel results <span>·</span> Demo reservations</p>
            </motion.div>
            {SCENE_STEPS.map((scene) => (
              <SceneNarrative key={scene.step} progress={progress} {...scene} />
            ))}
            <motion.div className="parallax__shade" style={prefersReducedMotion ? undefined : { opacity: shadeOpacity }} />
            <div className="parallax__grain" />
          </div>
          <motion.div className="parallax__fade" style={prefersReducedMotion ? undefined : { opacity: fadeOpacity }} />
          <span className="parallax__scroll"><i /><ArrowDown /> Scroll to enter</span>
          <span className="parallax__counter">Five scenes</span>
          {!prefersReducedMotion && (
            <span className="parallax__meter" aria-hidden="true">
              <motion.i style={{ scaleY: meterScale }} />
              {SCENE_MARKERS.map((stop) => (
                <b key={stop} style={{ top: `${stop * 100}%` }} />
              ))}
            </span>
          )}
        </div>
      </section>
    </div>
  );
}
