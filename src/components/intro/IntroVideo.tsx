"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Play } from "lucide-react";
import { meta } from "@data/meta";
import { easeBezier } from "@design/tokens";

interface IntroVideoProps {
  onDone: () => void;
}

const formatTime = (value: number): string => {
  if (!Number.isFinite(value) || value <= 0) {
    return "00:00";
  }
  const minutes = Math.floor(value / 60);
  const seconds = Math.floor(value % 60);
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
};

export function IntroVideo({ onDone }: IntroVideoProps) {
  const video = useRef<HTMLVideoElement>(null);
  const reducedMotion = useReducedMotion();
  const [playing, setPlaying] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [failed, setFailed] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const element = video.current;
    if (!element) {
      return;
    }

    if (reducedMotion === true) {
      element.pause();
      setBlocked(true);
      return;
    }

    const attempt = element.play();
    if (attempt) {
      attempt.then(() => setPlaying(true)).catch(() => setBlocked(true));
    }
  }, [reducedMotion]);

  const toggle = (): void => {
    const element = video.current;
    if (!element) {
      return;
    }
    if (element.paused) {
      setBlocked(false);
      void element.play().then(() => setPlaying(true)).catch(() => setBlocked(true));
    } else {
      element.pause();
      setPlaying(false);
    }
  };

  return (
    <div
      className="intro-shell absolute inset-0 flex flex-col items-center overflow-hidden bg-[color:var(--t-intro-black)] px-[120px] pb-[42px] pt-[40px]"
      data-testid="intro-video"
    >
      <motion.header
        className="flex w-full max-w-[1480px] items-center justify-between border-b border-[color:var(--t-intro-dim)] pb-4"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: easeBezier }}
      >
        <div className="flex items-center gap-4">
          <span className="grid h-9 w-9 place-items-center border border-[color:var(--t-intro-gray)] font-display text-[20px] leading-none text-[color:var(--t-intro-white)]">
            P
          </span>
          <div>
            <p className="type-figure text-[color:var(--t-intro-white)]">Opening film</p>
            <p className="mt-1 type-caption text-[color:var(--t-intro-gray)]">
              16:9 · {meta.deckTitle}
            </p>
          </div>
        </div>

        <button
          type="button"
          className="type-figure text-[color:var(--t-intro-gray)] transition-colors duration-200 hover:text-[color:var(--t-intro-white)]"
          onClick={onDone}
          data-no-advance
        >
          Skip film →
        </button>
      </motion.header>

      <motion.div
        className="relative mt-6 w-full max-w-[1480px] overflow-hidden border border-[color:var(--t-intro-dim)] bg-[color:var(--t-intro-black)]"
        style={{ aspectRatio: "16 / 9" }}
        initial={{ opacity: 0, scale: 0.985 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: easeBezier, delay: 0.1 }}
        data-no-advance
      >
        {failed ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center px-16 text-center">
            <p className="type-figure text-[color:var(--t-intro-gray)]">Film unavailable</p>
            <p className="mt-4 max-w-[680px] font-display text-[46px] italic leading-tight text-[color:var(--t-intro-white)]">
              The presentation continues.
            </p>
            <p className="mt-4 type-caption text-[color:var(--t-intro-gray)]">
              Place a 16:9 video at <span className="font-mono">public/media/intro.mp4</span>.
            </p>
            <button
              type="button"
              className="mt-8 border border-[color:var(--t-intro-gray)] px-8 py-3 type-figure text-[color:var(--t-intro-white)] transition-colors duration-200 hover:bg-[color:var(--t-intro-white)] hover:text-[color:var(--t-intro-black)]"
              onClick={onDone}
            >
              Continue to the deck
            </button>
          </div>
        ) : (
          <>
            <video
              ref={video}
              src={meta.introVideo}
              poster="/media/intro-poster.jpg"
              className="absolute inset-0 h-full w-full object-contain"
              autoPlay
              playsInline
              preload="auto"
              onPlay={() => {
                setPlaying(true);
                setBlocked(false);
              }}
              onPause={() => setPlaying(false)}
              onEnded={onDone}
              onError={() => setFailed(true)}
              onTimeUpdate={(event) => {
                const element = event.currentTarget;
                const total = element.duration;
                setDuration(Number.isFinite(total) ? total : 0);
                setProgress(Number.isFinite(total) && total > 0 ? element.currentTime / total : 0);
              }}
              onClick={toggle}
            />

            {blocked ? (
              <button
                type="button"
                className="intro-play-scrim group absolute inset-0 grid place-items-center"
                onClick={toggle}
                aria-label="Play the opening film"
              >
                <span className="flex flex-col items-center gap-5">
                  <span className="grid h-24 w-24 place-items-center rounded-full border border-[color:var(--t-intro-gray)] text-[color:var(--t-intro-white)] transition-transform duration-300 group-hover:scale-105">
                    <Play size={34} strokeWidth={1.2} aria-hidden />
                  </span>
                  <span className="type-figure text-[color:var(--t-intro-white)]">Play film</span>
                </span>
              </button>
            ) : null}
          </>
        )}
      </motion.div>

      <motion.footer
        className="mt-5 flex w-full max-w-[1480px] items-center justify-between gap-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, ease: easeBezier, delay: 0.4 }}
      >
        <div className="flex items-center gap-4">
          <button
            type="button"
            className="border border-[color:var(--t-intro-dim)] px-4 py-2 type-caption text-[color:var(--t-intro-gray)] transition-colors duration-200 hover:border-[color:var(--t-intro-gray)] hover:text-[color:var(--t-intro-white)]"
            onClick={toggle}
            data-no-advance
          >
            {playing ? "Pause" : "Play"}
          </button>
          <span className="type-figure tabular text-[color:var(--t-intro-gray)]">
            {formatTime(progress * duration)} / {formatTime(duration)}
          </span>
        </div>

        <div className="relative h-[2px] flex-1 overflow-hidden bg-[color:var(--t-intro-dim)]">
          <span
            className="absolute inset-y-0 left-0 bg-[color:var(--t-intro-white)]"
            style={{ width: `${Math.round(progress * 1000) / 10}%` }}
          />
        </div>

        <p className="type-figure whitespace-nowrap text-[color:var(--t-intro-gray)]">
          Enter to skip · auto-advances at the end
        </p>
      </motion.footer>
    </div>
  );
}
