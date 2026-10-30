"use client";

import React, { useState, useRef } from "react";
import { Link } from "react-router";
import { motion, useReducedMotion } from "framer-motion";
import { api } from "convex/_generated/api";
import { useQuery } from "convex/react";
import { Sparkles, ArrowRight, Eye, Video, Palette, Share2, Layers } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Navbar } from "./navbar";

interface LoaderData {
  isSignedIn: boolean;
  initialStats?: {
    videosProcessed: number;
    agentsDeployed: number;
    activeAgents: number;
    projectsCreated: number;
    totalUsers: number;
    videosToday: number;
    agentsToday: number;
  } | null;
}

// Pastel watercolor paint droplets floating around the artwork
const PAINT_DROPLETS = [
  { id: 1, color: "#FA7268", size: 10, top: "12%", left: "14%", delay: 0.1, duration: 4.8 },
  { id: 2, color: "#F59E0B", size: 13, top: "24%", right: "8%", delay: 0.5, duration: 5.4 },
  { id: 3, color: "#38B000", size: 9, bottom: "20%", left: "10%", delay: 0.3, duration: 4.6 },
  { id: 4, color: "#00A896", size: 12, top: "6%", right: "22%", delay: 0.7, duration: 5.8 },
  { id: 5, color: "#845EC2", size: 11, bottom: "14%", right: "16%", delay: 0.2, duration: 5.1 },
  { id: 6, color: "#FA7268", size: 8, top: "40%", left: "6%", delay: 0.4, duration: 4.9 },
  { id: 7, color: "#F59E0B", size: 10, bottom: "34%", right: "5%", delay: 0.8, duration: 5.3 },
];

export default function HeroSection({ loaderData }: { loaderData: LoaderData }) {
  const liveStats = useQuery(api.stats.getHeroStats);
  const stats = liveStats || loaderData?.initialStats;
  const shouldReduceMotion = useReducedMotion();

  // Mouse parallax state for watercolor blobs
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Track cursor position normalized to [-1, 1] relative to center
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (shouldReduceMotion) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const x = (e.clientX - centerX) / (rect.width / 2);
    const y = (e.clientY - centerY) / (rect.height / 2);
    setMousePos({ x, y });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 });
  };

  const ctaLink = loaderData?.isSignedIn ? "/dashboard" : "/sign-up";

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative min-h-screen overflow-hidden bg-[#FAF8F5] text-[#1C1917] transition-colors duration-500 dark:bg-[#0C0B0E] dark:text-[#F5F5F7]"
    >
      <Navbar loaderData={loaderData} />

      {/* ── Paper Grain Texture Overlay (pure SVG noise filter) ───── */}
      <svg
        className="pointer-events-none fixed inset-0 z-40 h-full w-full opacity-[0.035] mix-blend-multiply dark:opacity-[0.055] dark:mix-blend-screen"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <filter id="hero-paper-grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="3" stitchTiles="stitch" />
          <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#hero-paper-grain)" />
      </svg>

      {/* ── Main Hero Layout ──────────────────────────────────────── */}
      <div className="relative z-10 mx-auto max-w-7xl px-6 pt-28 pb-16 sm:px-8 lg:px-12 lg:pt-36 lg:pb-24">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-8">
          
          {/* ── LEFT COLUMN: Text & Actions (takes ~45-50% width) ──── */}
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="order-2 text-center lg:order-1 lg:col-span-5 lg:text-left xl:col-span-5"
          >
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-[#FA7268]/25 bg-[#FA7268]/10 px-3.5 py-1.5 text-xs font-medium text-[#FA7268] backdrop-blur-sm dark:border-[#FA7268]/30 dark:bg-[#FA7268]/15">
              <Sparkles className="h-3.5 w-3.5" />
              <span>AI Content Studio for YouTube</span>
            </div>

            {/* Headline: Elegant serif, soft organic typography */}
            <h1 className="font-serif mt-5 text-5xl font-normal tracking-tight text-balance sm:text-6xl lg:text-6xl xl:text-7xl leading-[1.08]">
              Paint your{" "}
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-[#FA7268] via-[#F59E0B] to-[#845EC2] bg-clip-text text-transparent">
                  video's story.
                </span>
                {/* Organic watercolor brush stroke underline */}
                <svg
                  className="absolute -bottom-2 left-0 w-full overflow-visible opacity-75"
                  height="8"
                  viewBox="0 0 100 8"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <path
                    d="M 0 5 Q 35 1, 65 4 T 100 3"
                    fill="none"
                    stroke="url(#watercolor-underline)"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient id="watercolor-underline" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#FA7268" />
                      <stop offset="50%" stopColor="#F59E0B" />
                      <stop offset="100%" stopColor="#845EC2" />
                    </linearGradient>
                  </defs>
                </svg>
              </span>
            </h1>

            {/* Subheadline in clean, highly legible sans-serif */}
            <p className="mx-auto mt-6 max-w-xl text-lg text-balance text-[#57534E] leading-relaxed sm:text-xl lg:mx-0 dark:text-[#A8A29E]">
              Upload once. Get titles, thumbnails, descriptions and tweets that feel like you.
            </p>

            {/* Call To Action Buttons */}
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start">
              <Button
                asChild
                size="lg"
                className="group relative overflow-hidden rounded-full bg-gradient-to-r from-[#FA7268] via-[#F59E0B] to-[#FA7268] bg-[length:200%_auto] px-7 py-6 text-base font-medium text-white shadow-lg shadow-[#FA7268]/25 transition-all duration-300 hover:bg-right hover:shadow-xl hover:shadow-[#FA7268]/35 active:scale-95"
              >
                <Link to={ctaLink}>
                  <span>Start creating</span>
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                size="lg"
                className="rounded-full border-[#E7E5E4] bg-white/70 px-6 py-6 text-base font-medium text-[#292524] backdrop-blur-md transition-all duration-200 hover:border-[#D6D3D1] hover:bg-white active:scale-95 dark:border-[#27272A] dark:bg-[#18181B]/70 dark:text-[#FAFAFA] dark:hover:bg-[#18181B]"
              >
                <a href="#features" className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-[#FA7268]" />
                  <span>See how it works</span>
                </a>
              </Button>
            </div>

            {/* Live Stats Row */}
            {stats && (
              <div className="mt-12 grid grid-cols-3 gap-3 border-t border-[#E7E5E4]/80 pt-6 text-left dark:border-[#27272A]/80">
                <div>
                  <div className="font-serif text-2xl font-normal text-[#1C1917] sm:text-3xl dark:text-[#F5F5F7]">
                    {stats.videosProcessed.toLocaleString()}
                  </div>
                  <div className="mt-0.5 text-xs text-[#78716C] dark:text-[#A1A1AA]">
                    Videos packaged
                  </div>
                </div>
                <div>
                  <div className="font-serif text-2xl font-normal text-[#1C1917] sm:text-3xl dark:text-[#F5F5F7]">
                    {stats.agentsDeployed.toLocaleString()}
                  </div>
                  <div className="mt-0.5 text-xs text-[#78716C] dark:text-[#A1A1AA]">
                    Agents active
                  </div>
                </div>
                <div>
                  <div className="font-serif text-2xl font-normal text-[#1C1917] sm:text-3xl dark:text-[#F5F5F7]">
                    {stats.projectsCreated.toLocaleString()}
                  </div>
                  <div className="mt-0.5 text-xs text-[#78716C] dark:text-[#A1A1AA]">
                    Stories told
                  </div>
                </div>
              </div>
            )}
          </motion.div>

          {/* ── RIGHT COLUMN: Main Watercolor Artwork (takes 55-60% width) ── */}
          <div className="order-1 flex justify-center lg:order-2 lg:col-span-7 xl:col-span-7">
            <div className="relative w-full max-w-lg lg:max-w-2xl">
              
              {/* Soft drifting watercolor blobs behind artwork with mouse parallax */}
              <motion.div
                animate={
                  shouldReduceMotion
                    ? false
                    : {
                        x: mousePos.x * 24,
                        y: mousePos.y * 24,
                        scale: [1, 1.05, 1],
                      }
                }
                transition={{
                  x: { type: "spring", stiffness: 45, damping: 20 },
                  y: { type: "spring", stiffness: 45, damping: 20 },
                  scale: { duration: 9, repeat: Infinity, ease: "easeInOut" },
                }}
                className="pointer-events-none absolute -inset-8 -z-10"
              >
                {/* Coral pigment bloom */}
                <div className="absolute top-4 left-6 h-64 w-64 rounded-full bg-[#FA7268]/25 blur-3xl dark:bg-[#FA7268]/20" />
                {/* Amber warm bloom */}
                <div className="absolute top-16 right-8 h-60 w-60 rounded-full bg-[#F59E0B]/20 blur-3xl dark:bg-[#F59E0B]/18" />
                {/* Leaf green & Teal bloom */}
                <div className="absolute bottom-10 left-12 h-64 w-64 rounded-full bg-[#00A896]/20 blur-3xl dark:bg-[#00A896]/18" />
                {/* Violet bloom */}
                <div className="absolute -bottom-6 right-10 h-72 w-72 rounded-full bg-[#845EC2]/25 blur-3xl dark:bg-[#845EC2]/22" />
              </motion.div>

              {/* Floating Pastel Paint Droplets */}
              {!shouldReduceMotion &&
                PAINT_DROPLETS.map((drop) => (
                  <motion.div
                    key={drop.id}
                    animate={{
                      y: [0, 10, 0],
                      x: mousePos.x * (drop.id % 2 === 0 ? 12 : -12),
                      opacity: [0.7, 0.95, 0.7],
                    }}
                    transition={{
                      y: { duration: drop.duration, repeat: Infinity, ease: "easeInOut", delay: drop.delay },
                      opacity: { duration: drop.duration, repeat: Infinity, ease: "easeInOut", delay: drop.delay },
                      x: { type: "spring", stiffness: 50, damping: 20 },
                    }}
                    style={{
                      width: drop.size,
                      height: drop.size,
                      backgroundColor: drop.color,
                      top: drop.top,
                      bottom: drop.bottom,
                      left: drop.left,
                      right: drop.right,
                    }}
                    className="pointer-events-none absolute z-20 rounded-full blur-[0.6px] shadow-sm"
                  />
                ))}

              {/* ── Main Artwork with 1.5s Watercolor "Bleed-in" Transition ── */}
              <motion.div
                initial={
                  shouldReduceMotion
                    ? false
                    : {
                        opacity: 0,
                        filter: "blur(22px)",
                        scale: 0.94,
                      }
                }
                animate={{
                  opacity: 1,
                  filter: "blur(0px)",
                  scale: 1,
                }}
                transition={{
                  duration: 1.5,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="relative overflow-hidden p-2 sm:p-4"
              >
                {/* Hand-painted feathered frame with radial gradient mask (no hard rectangle) */}
                <div
                  style={{
                    maskImage:
                      "radial-gradient(ellipse 90% 92% at 50% 48%, black 58%, rgba(0,0,0,0.85) 75%, transparent 98%)",
                    WebkitMaskImage:
                      "radial-gradient(ellipse 90% 92% at 50% 48%, black 58%, rgba(0,0,0,0.85) 75%, transparent 98%)",
                  }}
                  className="relative mx-auto aspect-[3/4] max-h-[580px] w-full overflow-hidden transition-transform duration-700 hover:scale-[1.01]"
                >
                  <img
                    src="/hero-artwork.jpg"
                    alt="Child on bicycle carrying a colorful swirl rainbow cloud of ideas"
                    className="h-full w-full object-cover object-center filter saturate-[1.08] contrast-[1.02]"
                    loading="eager"
                    decoding="async"
                  />
                  {/* Subtle paper grain texture highlight inside artwork */}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-[#FAF8F5]/10 via-transparent to-[#F59E0B]/10 mix-blend-overlay dark:from-black/20" />
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
