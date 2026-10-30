"use client";

import React from "react";
import { Link } from "react-router";
import { motion, useReducedMotion } from "framer-motion";
import { api } from "convex/_generated/api";
import { useQuery } from "convex/react";
import { Sparkles, ArrowRight, Eye } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Navbar } from "./navbar";
import WatercolorCanvas from "./WatercolorCanvas";

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

export default function HeroSection({ loaderData }: { loaderData: LoaderData }) {
  const shouldReduceMotion = useReducedMotion();

  const ctaLink = loaderData?.isSignedIn ? "/dashboard" : "/sign-up";

  return (
    <section className="relative min-h-screen overflow-hidden bg-[#FAF8F5] text-[#1C1917] transition-colors duration-500 dark:bg-[#0C0B0E] dark:text-[#F5F5F7]">
      <Navbar loaderData={loaderData} />

      {/* ── Paper Grain Texture Overlay ─────────────────────────── */}
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

      {/* ── Main Centered Hero Content ──────────────────────────── */}
      <div className="relative z-10 mx-auto max-w-5xl px-6 pt-28 pb-16 text-center sm:px-8 lg:pt-36 lg:pb-24">
        
        {/* Pill Badge */}
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 rounded-full border border-[#FA7268]/25 bg-[#FA7268]/10 px-4 py-1.5 text-xs font-medium text-[#FA7268] backdrop-blur-sm dark:border-[#FA7268]/30 dark:bg-[#FA7268]/15"
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span>AI Content Studio for YouTube Creators</span>
        </motion.div>

        {/* Centered Headline */}
        <motion.h1
          initial={shouldReduceMotion ? false : { opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="font-serif mx-auto mt-6 max-w-3xl text-5xl font-normal tracking-tight text-balance sm:text-6xl lg:text-7xl leading-[1.08]"
        >
          Paint your{" "}
          <span className="relative inline-block">
            <span className="bg-gradient-to-r from-[#FA7268] via-[#F59E0B] via-50% to-[#845EC2] bg-clip-text text-transparent">
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
        </motion.h1>

        {/* Centered Subheadline */}
        <motion.p
          initial={shouldReduceMotion ? false : { opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mx-auto mt-6 max-w-xl text-lg text-balance text-[#57534E] leading-relaxed sm:text-xl dark:text-[#A8A29E]"
        >
          Upload once. Get titles, thumbnails, descriptions and tweets that feel like you.
        </motion.p>

        {/* Centered CTA Buttons */}
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
        >
          <Button
            asChild
            size="lg"
            className="group relative overflow-hidden rounded-full bg-gradient-to-r from-[#FA7268] via-[#F59E0B] to-[#FA7268] bg-[length:200%_auto] px-8 py-6 text-base font-medium text-white shadow-lg shadow-[#FA7268]/25 transition-all duration-300 hover:bg-right hover:shadow-xl hover:shadow-[#FA7268]/35 active:scale-95"
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
            className="rounded-full border-[#E7E5E4] bg-white/70 px-7 py-6 text-base font-medium text-[#292524] backdrop-blur-md transition-all duration-200 hover:border-[#D6D3D1] hover:bg-white active:scale-95 dark:border-[#27272A] dark:bg-[#18181B]/70 dark:text-[#FAFAFA] dark:hover:bg-[#18181B]"
          >
            <a href="#features" className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-[#FA7268]" />
              <span>See how it works</span>
            </a>
          </Button>
        </motion.div>

        {/* ── CENTERPIECE ARTWORK: Directly Below in the Center ─── */}
        <motion.div
          initial={
            shouldReduceMotion
              ? false
              : {
                  opacity: 0,
                  filter: "blur(20px)",
                  scale: 0.94,
                  y: 25,
                }
          }
          animate={{
            opacity: 1,
            filter: "blur(0px)",
            scale: 1,
            y: 0,
          }}
          transition={{
            duration: 1.4,
            delay: 0.35,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="mt-12 sm:mt-16"
        >
          <WatercolorCanvas />
        </motion.div>
      </div>
    </section>
  );
}
