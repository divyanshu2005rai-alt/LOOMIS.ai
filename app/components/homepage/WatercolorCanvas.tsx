"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Sparkles, Palette, Video, MessageSquare, Twitter, FileText, CheckCircle2 } from "lucide-react";

// Spectrum of quilling circle colors inspired by the artwork
const SWIRL_COLORS = [
  "#FF3366", "#FF5E36", "#FFAA00", "#FFD600", 
  "#AEEA00", "#00E676", "#00B0FF", "#2979FF", 
  "#651FFF", "#D500F9", "#FF1744", "#FF9100"
];

// Interactive floating feature chips that sprout from the swirl
const CREATIVE_TAGS = [
  { id: 1, label: "Click-Worthy Titles", icon: Sparkles, color: "#FA7268", x: "-38%", y: "-22%", delay: 0.2 },
  { id: 2, label: "SDXL Thumbnails", icon: Palette, color: "#F59E0B", x: "36%", y: "-28%", delay: 0.4 },
  { id: 3, label: "SEO Descriptions", icon: FileText, color: "#00A896", x: "-36%", y: "16%", delay: 0.6 },
  { id: 4, label: "Viral Tweets & Threads", icon: Twitter, color: "#845EC2", x: "38%", y: "14%", delay: 0.8 },
];

export default function WatercolorCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const [mouse, setMouse] = useState({ x: 0.5, y: 0.5, active: false });
  const [activeChip, setActiveChip] = useState<number | null>(null);

  // ── Wet Droplets & Condensation Canvas Simulation (Image 2) ──
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener("resize", handleResize);

    // Generate static and dynamic water beads
    interface Droplet {
      x: number;
      y: number;
      r: number;
      alpha: number;
      speedY: number;
      glowColor: string;
    }

    const droplets: Droplet[] = [];
    const count = 90;
    const colors = ["#00F5D4", "#00BBF9", "#FEE440", "#F15BB5", "#9B5DE5", "#FFFFFF"];

    for (let i = 0; i < count; i++) {
      droplets.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 3 + 1,
        alpha: Math.random() * 0.6 + 0.2,
        speedY: Math.random() * 0.4 + 0.1,
        glowColor: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    // Render loop
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      droplets.forEach((d) => {
        // Move slowly downward like water on glass
        if (!shouldReduceMotion) {
          d.y += d.speedY;
          if (d.y > height + 10) {
            d.y = -10;
            d.x = Math.random() * width;
          }
        }

        // Draw droplet highlight
        ctx.save();
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = d.glowColor;
        ctx.globalAlpha = d.alpha * 0.8;
        ctx.shadowColor = d.glowColor;
        ctx.shadowBlur = d.r * 2.5;
        ctx.fill();

        // Inner white specular reflection
        ctx.beginPath();
        ctx.arc(d.x - d.r * 0.3, d.y - d.r * 0.3, d.r * 0.35, 0, Math.PI * 2);
        ctx.fillStyle = "#FFFFFF";
        ctx.globalAlpha = 0.9;
        ctx.fill();
        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [shouldReduceMotion]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (shouldReduceMotion || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setMouse({ x, y, active: true });
  };

  const handleMouseLeave = () => {
    setMouse({ x: 0.5, y: 0.5, active: false });
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="group relative mx-auto aspect-[4/3] w-full max-w-4xl select-none overflow-hidden rounded-[2.5rem] border border-black/10 bg-[#FAF8F5] p-4 shadow-2xl transition-all duration-700 sm:aspect-[16/10] sm:p-8 dark:border-white/10 dark:bg-[#0A0A0E] dark:shadow-[#000000]/70"
    >
      {/* ── Background Wet Atmosphere & Light Glows (Image 2) ───── */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        {/* Luminous Cyan/Teal glow on top left */}
        <div
          style={{
            transform: `translate(${(mouse.x - 0.5) * 40}px, ${(mouse.y - 0.5) * 40}px)`,
          }}
          className="absolute -top-16 -left-16 h-80 w-80 rounded-full bg-gradient-to-br from-[#00F5D4]/30 to-[#00BBF9]/25 blur-3xl transition-transform duration-300 dark:from-[#00D2FF]/25 dark:to-[#0077B6]/25"
        />

        {/* Fiery Amber / Coral glow in center right */}
        <div
          style={{
            transform: `translate(${(mouse.x - 0.5) * -45}px, ${(mouse.y - 0.5) * -45}px)`,
          }}
          className="absolute top-1/4 -right-12 h-96 w-96 rounded-full bg-gradient-to-bl from-[#FF5E36]/30 via-[#FFAA00]/25 to-[#FF3366]/20 blur-3xl transition-transform duration-300 dark:from-[#FF6B4A]/25 dark:via-[#FFAA00]/20"
        />

        {/* Violet / Indigo pool in bottom left */}
        <div
          style={{
            transform: `translate(${(mouse.x - 0.5) * 30}px, ${(mouse.y - 0.5) * 30}px)`,
          }}
          className="absolute -bottom-16 left-1/4 h-80 w-80 rounded-full bg-gradient-to-tr from-[#8338EC]/25 to-[#3A86FF]/20 blur-3xl transition-transform duration-300 dark:from-[#8338EC]/20"
        />

        {/* Glass reflection gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-transparent to-black/5 mix-blend-overlay dark:from-white/10 dark:to-black/40" />
      </div>

      {/* ── HTML5 Wet Droplets & Condensation Canvas ─────────────── */}
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 z-10 h-full w-full opacity-60 mix-blend-screen dark:opacity-80"
      />

      {/* ── The Rainbow Swirl & Bicycle Illustration (Image 1) ──── */}
      <div className="relative z-20 flex h-full w-full flex-col items-center justify-center">
        {/* Center Swirl Bouquet */}
        <div className="relative flex flex-col items-center">
          
          {/* Swirling Rainbow Rings Cluster (60+ layered concentric petals) */}
          <motion.div
            animate={
              shouldReduceMotion
                ? false
                : {
                    rotate: [0, 4, -4, 0],
                    scale: [1, 1.025, 1],
                  }
            }
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="relative flex h-56 w-56 items-center justify-center sm:h-72 sm:w-72 md:h-80 md:w-80"
          >
            {/* Concentric rotating SVG spirals */}
            <svg
              viewBox="0 0 320 320"
              className="h-full w-full overflow-visible drop-shadow-xl"
            >
              <defs>
                <radialGradient id="swirl-glow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8" />
                  <stop offset="60%" stopColor="#FFAA00" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#FF3366" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* Ambient radial glow core */}
              <circle cx="160" cy="160" r="140" fill="url(#swirl-glow)" />

              {/* Outer quilling discs */}
              {[
                { cx: 160, cy: 50, r: 36, fill: "#FF3366" },
                { cx: 215, cy: 75, r: 38, fill: "#FF5E36" },
                { cx: 255, cy: 125, r: 40, fill: "#FFAA00" },
                { cx: 260, cy: 185, r: 38, fill: "#00E676" },
                { cx: 235, cy: 240, r: 36, fill: "#00B0FF" },
                { cx: 185, cy: 270, r: 34, fill: "#2979FF" },
                { cx: 130, cy: 270, r: 35, fill: "#651FFF" },
                { cx: 80, cy: 235, r: 38, fill: "#9B5DE5" },
                { cx: 55, cy: 180, r: 37, fill: "#D500F9" },
                { cx: 65, cy: 120, r: 38, fill: "#FF1744" },
                { cx: 105, cy: 70, r: 36, fill: "#FF70A6" },
              ].map((c, i) => (
                <g key={i}>
                  <circle
                    cx={c.cx}
                    cy={c.cy}
                    r={c.r}
                    fill={c.fill}
                    fillOpacity="0.85"
                  />
                  <circle
                    cx={c.cx}
                    cy={c.cy}
                    r={c.r * 0.65}
                    fill="none"
                    stroke="#FFFFFF"
                    strokeWidth="2.5"
                    strokeOpacity="0.6"
                  />
                  <circle
                    cx={c.cx}
                    cy={c.cy}
                    r={c.r * 0.35}
                    fill="#FFFFFF"
                    fillOpacity="0.4"
                  />
                </g>
              ))}

              {/* Inner swirling rings */}
              {[
                { cx: 135, cy: 120, r: 32, fill: "#FFD600" },
                { cx: 185, cy: 115, r: 34, fill: "#FF5E36" },
                { cx: 210, cy: 160, r: 35, fill: "#00F5D4" },
                { cx: 175, cy: 205, r: 36, fill: "#3A86FF" },
                { cx: 125, cy: 195, r: 33, fill: "#D500F9" },
                { cx: 115, cy: 155, r: 32, fill: "#FF3366" },
                { cx: 160, cy: 160, r: 42, fill: "#FF9100" },
              ].map((c, i) => (
                <g key={`inner-${i}`}>
                  <circle
                    cx={c.cx}
                    cy={c.cy}
                    r={c.r}
                    fill={c.fill}
                    fillOpacity="0.9"
                  />
                  <circle
                    cx={c.cx}
                    cy={c.cy}
                    r={c.r * 0.6}
                    fill="none"
                    stroke="#FFFFFF"
                    strokeWidth="2"
                    strokeOpacity="0.75"
                  />
                  <circle
                    cx={c.cx}
                    cy={c.cy}
                    r={c.r * 0.25}
                    fill="#FFFFFF"
                    fillOpacity="0.8"
                  />
                </g>
              ))}
            </svg>

            {/* Radiant Rainbow Beams converging downward to bike handlebars */}
            <div className="pointer-events-none absolute -bottom-10 h-16 w-16">
              <div className="h-full w-full bg-gradient-to-b from-[#FFAA00]/80 via-[#FF3366]/60 to-transparent blur-[2px]" />
            </div>
          </motion.div>

          {/* ── Bicycle and Rider Silhouette ─────────────────────── */}
          <div className="relative -mt-6 flex flex-col items-center">
            {/* The Bicycle Rider Illustration SVG */}
            <svg
              viewBox="0 0 160 120"
              className="h-24 w-32 sm:h-28 sm:w-36 overflow-visible drop-shadow-md"
            >
              {/* Bicycle Wheels with Rainbow Hubs */}
              <circle
                cx="32"
                cy="90"
                r="24"
                fill="none"
                stroke="url(#bike-wheel-grad)"
                strokeWidth="4"
              />
              <circle cx="32" cy="90" r="4" fill="#FA7268" />
              {/* Spokes */}
              <line x1="32" y1="66" x2="32" y2="114" stroke="#D1D5DB" strokeWidth="1" strokeOpacity="0.6" />
              <line x1="8" y1="90" x2="56" y2="90" stroke="#D1D5DB" strokeWidth="1" strokeOpacity="0.6" />

              <circle
                cx="128"
                cy="90"
                r="24"
                fill="none"
                stroke="url(#bike-wheel-grad)"
                strokeWidth="4"
              />
              <circle cx="128" cy="90" r="4" fill="#00A896" />
              <line x1="128" y1="66" x2="128" y2="114" stroke="#D1D5DB" strokeWidth="1" strokeOpacity="0.6" />
              <line x1="104" y1="90" x2="152" y2="90" stroke="#D1D5DB" strokeWidth="1" strokeOpacity="0.6" />

              {/* Bicycle Frame */}
              <path
                d="M 32 90 L 70 90 L 95 62 L 56 62 Z"
                fill="none"
                stroke="#F59E0B"
                strokeWidth="4"
                strokeLinejoin="round"
              />
              {/* Handlebar & Fork */}
              <path
                d="M 128 90 L 108 42 L 100 40"
                fill="none"
                stroke="#FA7268"
                strokeWidth="4"
                strokeLinecap="round"
              />
              {/* Seat & Post */}
              <path
                d="M 56 62 L 52 48 M 44 48 L 60 48"
                fill="none"
                stroke="#1C1917"
                strokeWidth="3.5"
                strokeLinecap="round"
                className="dark:stroke-white"
              />

              {/* Child / Rider figure */}
              <circle cx="82" cy="30" r="14" fill="#FA7268" />
              <path
                d="M 72 32 C 72 20, 92 20, 92 32 Z"
                fill="#845EC2"
              />
              {/* Colorful pattern clothing */}
              <path
                d="M 75 42 L 60 56 L 68 76 L 82 82 L 80 62 L 95 48 Z"
                fill="#00A896"
              />
              <path
                d="M 78 44 L 102 44"
                fill="none"
                stroke="#F59E0B"
                strokeWidth="4"
                strokeLinecap="round"
              />

              <defs>
                <linearGradient id="bike-wheel-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FA7268" />
                  <stop offset="35%" stopColor="#F59E0B" />
                  <stop offset="70%" stopColor="#00A896" />
                  <stop offset="100%" stopColor="#845EC2" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        {/* ── Interactive Floating Tags (Titles, Thumbnails, etc.) ── */}
        {CREATIVE_TAGS.map((tag) => {
          const Icon = tag.icon;
          return (
            <motion.div
              key={tag.id}
              initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: tag.delay, duration: 0.6 }}
              whileHover={{ scale: 1.08, y: -4 }}
              onHoverStart={() => setActiveChip(tag.id)}
              onHoverEnd={() => setActiveChip(null)}
              style={{
                left: `calc(50% + ${tag.x})`,
                top: `calc(50% + ${tag.y})`,
              }}
              className="absolute hidden -translate-x-1/2 -translate-y-1/2 cursor-pointer sm:flex items-center gap-2 rounded-2xl border border-white/60 bg-white/80 px-4 py-2 text-xs font-semibold shadow-lg backdrop-blur-md transition-shadow hover:shadow-xl sm:text-sm dark:border-white/10 dark:bg-black/70 dark:text-white"
            >
              <div
                style={{ backgroundColor: `${tag.color}25`, color: tag.color }}
                className="flex h-7 w-7 items-center justify-center rounded-xl"
              >
                <Icon className="h-4 w-4" />
              </div>
              <span className="text-nowrap">{tag.label}</span>
              <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
            </motion.div>
          );
        })}
      </div>

      {/* Bottom pill caption */}
      <div className="relative z-20 mt-2 text-center text-xs font-medium text-muted-foreground/80">
        <span>✨ Move your cursor over the glass to feel the watercolor droplets & rainbow swirls</span>
      </div>
    </div>
  );
}
