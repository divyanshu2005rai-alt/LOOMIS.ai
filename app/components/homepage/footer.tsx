"use client";

import React from "react";

export default function FooterSection() {
  return (
    <footer className="border-t border-[#E7E5E4]/80 bg-[#FAF8F5] py-8 transition-colors duration-500 dark:border-[#27272A]/80 dark:bg-[#0C0B0E]">
      <div className="mx-auto max-w-5xl px-6 text-center">
        <p className="text-xs text-[#78716C] dark:text-[#A1A1AA]">
          © {new Date().getFullYear()}{" "}
          <span className="font-serif font-bold tracking-tight bg-gradient-to-r from-[#D97706] via-[#F59E0B] to-[#FBBF24] dark:from-[#F59E0B] dark:via-[#FBBF24] dark:to-[#FCD34D] bg-clip-text text-transparent">
            LOOMIS.ai
          </span>
          . Paint your video's story.
        </p>
      </div>
    </footer>
  );
}
