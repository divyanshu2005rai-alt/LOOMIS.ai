"use client";

import React from "react";
import { Link } from "react-router";

export default function FooterSection() {
  return (
    <footer className="border-t border-[#E7E5E4]/80 bg-[#FAF8F5] py-10 transition-colors duration-500 dark:border-[#27272A]/80 dark:bg-[#0C0B0E]">
      <div className="mx-auto max-w-5xl px-6 text-center">
        <div className="mb-4 flex flex-wrap justify-center gap-6 text-sm">
          <Link
            to="https://x.com/rasmickyy"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="X/Twitter"
            className="text-[#78716C] transition-colors hover:text-[#FA7268] dark:text-[#A1A1AA] dark:hover:text-[#FA7268]"
          >
            <svg
              className="size-5"
              xmlns="http://www.w3.org/2000/svg"
              width="1em"
              height="1em"
              viewBox="0 0 24 24"
            >
              <path
                fill="currentColor"
                d="M10.488 14.651L15.25 21h7l-7.858-10.478L20.93 3h-2.65l-5.117 5.886L8.75 3h-7l7.51 10.015L2.32 21h2.65zM16.25 19L5.75 5h2l10.5 14z"
              />
            </svg>
          </Link>
        </div>
        <p className="text-xs text-[#78716C] dark:text-[#A1A1AA]">
          © {new Date().getFullYear()} YouPac AI. Paint your video's story.
        </p>
      </div>
    </footer>
  );
}
