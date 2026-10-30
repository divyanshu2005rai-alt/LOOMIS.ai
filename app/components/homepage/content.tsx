"use client";

import React from "react";
import { Link } from "react-router";
import { 
  ArrowRight, 
  Palette, 
  MessageSquare, 
  Sparkles,
  Video,
  FileText,
  Share2,
  Zap,
  Eye,
  CheckCircle2
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";

export default function ContentSection() {
  return (
    <div className="relative overflow-hidden bg-[#FAF8F5] text-[#1C1917] transition-colors duration-500 dark:bg-[#0C0B0E] dark:text-[#F5F5F7]">
      
      {/* ── Section 1: Workflow Overview (Compact & Tight Proportions) ── */}
      <section id="features" className="relative py-12 md:py-16">
        {/* Soft watercolor ambient light blobs */}
        <div className="pointer-events-none absolute -top-12 left-1/4 h-72 w-72 rounded-full bg-[#FA7268]/15 blur-3xl dark:bg-[#FA7268]/12" />
        <div className="pointer-events-none absolute top-1/3 -right-12 h-80 w-80 rounded-full bg-[#F59E0B]/15 blur-3xl dark:bg-[#F59E0B]/12" />

        <div className="relative mx-auto max-w-6xl px-6 sm:px-8">
          <div className="grid items-center gap-8 lg:grid-cols-12 lg:gap-12">
            
            {/* Left Narrative Column */}
            <div className="space-y-4 lg:col-span-6">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 rounded-full border border-[#FA7268]/25 bg-[#FA7268]/10 px-3.5 py-1 text-xs font-medium text-[#FA7268] backdrop-blur-sm dark:border-[#FA7268]/30 dark:bg-[#FA7268]/15">
                <Zap className="h-3.5 w-3.5" />
                <span>Supercharge Your Workflow</span>
              </div>
              
              <h2 className="font-serif text-3xl font-normal tracking-tight sm:text-4xl lg:text-5xl leading-[1.12]">
                AI-Powered Content Creation for{" "}
                <span className="bg-gradient-to-r from-[#FA7268] via-[#F59E0B] to-[#845EC2] bg-clip-text text-transparent">
                  YouTube Creators
                </span>
              </h2>
              
              <div className="space-y-3 text-base text-[#57534E] leading-relaxed dark:text-[#A8A29E]">
                <p>
                  Transform your video workflow with our intelligent creative assistant.
                  Upload your video once, and watch specialized AI agents sculpt high-CTR
                  titles, rich descriptions, stunning thumbnails, and engaging social posts.
                </p>
                <p>
                  <span className="font-semibold text-[#1C1917] dark:text-[#F5F5F7]">Save hours on every video</span>{" "}
                  with automatic transcription and a visual canvas where AI agents understand
                  your channel's unique tone and audience.
                </p>
              </div>
              
              <div className="flex items-center gap-3 pt-2">
                <Button
                  asChild
                  size="default"
                  className="group rounded-full bg-gradient-to-r from-[#FA7268] via-[#F59E0B] to-[#FA7268] bg-[length:200%_auto] px-6 text-sm font-medium text-white shadow-md shadow-[#FA7268]/20 transition-all duration-300 hover:bg-right hover:shadow-lg hover:shadow-[#FA7268]/30 active:scale-95"
                >
                  <Link to="/sign-up">
                    <span>Start Creating</span>
                    <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="default"
                  className="rounded-full border-[#E7E5E4] bg-white/70 px-5 text-sm font-medium text-[#292524] backdrop-blur-md transition-all hover:border-[#D6D3D1] hover:bg-white active:scale-95 dark:border-[#27272A] dark:bg-[#18181B]/70 dark:text-[#FAFAFA] dark:hover:bg-[#18181B]"
                >
                  <a href="#demo-preview" className="flex items-center gap-1.5">
                    <Eye className="h-4 w-4 text-[#FA7268]" />
                    <span>Watch Demo</span>
                  </a>
                </Button>
              </div>
            </div>
            
            {/* Right Visual Representation Cards (Compact & Warm) */}
            <div className="relative lg:col-span-6">
              <div className="grid grid-cols-2 gap-3.5 sm:gap-4">
                <FeaturePreviewCard
                  icon={Video}
                  title="Video Analysis"
                  description="AI understands scenes & speech"
                  iconBg="#00A896"
                  className="translate-y-2"
                />
                <FeaturePreviewCard
                  icon={FileText}
                  title="Smart Titles"
                  description="High-CTR SEO suggestions"
                  iconBg="#FA7268"
                  className="-translate-y-2"
                />
                <FeaturePreviewCard
                  icon={Palette}
                  title="SDXL Thumbnails"
                  description="Eye-catching, bold concepts"
                  iconBg="#F59E0B"
                  className="translate-y-2"
                />
                <FeaturePreviewCard
                  icon={Share2}
                  title="Social Posts"
                  description="Viral X & community threads"
                  iconBg="#845EC2"
                  className="-translate-y-2"
                />
              </div>
            </div>

          </div>
        </div>
      </section>
      
      {/* ── Section 2: Features Suite & Stats (Tightened Height) ───── */}
      <section className="relative border-t border-[#E7E5E4]/70 bg-[#F5F2EB]/50 py-12 md:py-16 dark:border-[#27272A]/70 dark:bg-[#100F14]/60">
        <div className="pointer-events-none absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-[#845EC2]/12 blur-3xl dark:bg-[#845EC2]/10" />

        <div className="relative mx-auto max-w-6xl px-6 sm:px-8">
          
          {/* Section Header */}
          <div className="mx-auto max-w-2xl text-center mb-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#F59E0B]/25 bg-[#F59E0B]/10 px-3.5 py-1 text-xs font-medium text-[#F59E0B] backdrop-blur-sm dark:border-[#F59E0B]/30 dark:bg-[#F59E0B]/15 mb-3">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Powerful Features</span>
            </div>
            <h3 className="font-serif text-3xl font-normal tracking-tight sm:text-4xl">
              Everything You Need to{" "}
              <span className="bg-gradient-to-r from-[#FA7268] via-[#F59E0B] to-[#845EC2] bg-clip-text text-transparent">
                Create Better Content
              </span>
            </h3>
            <p className="mt-2 text-base text-[#57534E] dark:text-[#A8A29E]">
              A complete creative suite that works harmoniously to elevate your YouTube channel.
            </p>
          </div>
          
          {/* Feature Grid: 3 Compact Cards */}
          <div className="grid gap-5 md:grid-cols-3">
            <FeatureCard
              icon={Palette}
              title="Visual Canvas"
              description="Connect video nodes to AI agents and sculpt your YouTube package on a fluid, freeform whiteboard."
              color="#00A896"
            />
            
            <FeatureCard
              icon={Sparkles}
              title="Specialized AI Agents"
              description="Purpose-built agents for titles, descriptions, and thumbnails that respect your channel's authentic voice."
              color="#FA7268"
            />
            
            <FeatureCard
              icon={MessageSquare}
              title="Interactive Refinement"
              description="Chat with agents in real-time, ask for revisions, and tweak outputs until every word feels perfect."
              color="#845EC2"
            />
          </div>
          
          {/* Stats Bar */}
          <div className="mt-12 grid grid-cols-2 gap-4 border-t border-[#E7E5E4]/80 pt-8 sm:grid-cols-4 dark:border-[#27272A]/80">
            <StatCard number="10x" label="Faster Packaging" />
            <StatCard number="50%" label="Higher CTR" />
            <StatCard number="100%" label="Free Tier Powered" />
            <StatCard number="24/7" label="Instant Generation" />
          </div>

        </div>
      </section>

    </div>
  );
}

// Compact Feature Preview Card with Watercolor Icon Accent
const FeaturePreviewCard = ({ 
  icon: Icon, 
  title, 
  description, 
  iconBg,
  className 
}: { 
  icon: any; 
  title: string; 
  description: string; 
  iconBg: string;
  className?: string;
}) => {
  return (
    <div className={cn(
      "group relative rounded-2xl border border-[#E7E5E4] bg-white/75 p-5 shadow-sm backdrop-blur-md transition-all duration-300 hover:border-[#FA7268]/40 hover:shadow-lg hover:shadow-[#FA7268]/10 dark:border-[#27272A] dark:bg-[#141318]/70",
      className
    )}>
      <div
        style={{ backgroundColor: `${iconBg}18`, color: iconBg }}
        className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl"
      >
        <Icon className="h-5 w-5" />
      </div>
      <h4 className="text-sm font-semibold text-[#1C1917] dark:text-[#F5F5F7] mb-1">{title}</h4>
      <p className="text-xs text-[#78716C] dark:text-[#A1A1AA] leading-relaxed">{description}</p>
    </div>
  );
};

// Feature Card for 3-Column Grid
const FeatureCard = ({ 
  icon: Icon, 
  title, 
  description, 
  color 
}: { 
  icon: any; 
  title: string; 
  description: string; 
  color: string;
}) => {
  return (
    <div className="group relative rounded-2xl border border-[#E7E5E4] bg-white/80 p-6 shadow-sm backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-[#FA7268]/40 hover:shadow-xl hover:shadow-[#FA7268]/10 dark:border-[#27272A] dark:bg-[#141318]/80">
      <div
        style={{ backgroundColor: `${color}18`, color }}
        className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl"
      >
        <Icon className="h-5 w-5" />
      </div>
      <h4 className="font-serif text-lg font-normal text-[#1C1917] dark:text-[#F5F5F7] mb-2">{title}</h4>
      <p className="text-sm text-[#57534E] dark:text-[#A8A29E] leading-relaxed">{description}</p>
    </div>
  );
};

// Stat Card with Watercolor Gradient Digits
const StatCard = ({ number, label }: { number: string; label: string }) => {
  return (
    <div className="text-center">
      <p className="font-serif text-3xl font-normal bg-gradient-to-r from-[#FA7268] via-[#F59E0B] to-[#845EC2] bg-clip-text text-transparent sm:text-4xl">
        {number}
      </p>
      <p className="mt-1 text-xs text-[#78716C] dark:text-[#A1A1AA] font-medium">{label}</p>
    </div>
  );
};
