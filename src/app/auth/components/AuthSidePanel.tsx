"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Sun, BookOpen, Sparkles, Heart, Cross } from "lucide-react";

interface AuthSidePanelProps {
  title: string;
  subtitle: string;
}

export function AuthSidePanel({ title, subtitle }: AuthSidePanelProps) {
  const t = useTranslations("authPanel.verses");
  const [mounted, setMounted] = useState(false);

  const verses = [
    { text: t("verse1.text"), ref: t("verse1.ref") },
    { text: t("verse2.text"), ref: t("verse2.ref") },
    { text: t("verse3.text"), ref: t("verse3.ref") },
    { text: t("verse4.text"), ref: t("verse4.ref") },
    { text: t("verse5.text"), ref: t("verse5.ref") },
  ];

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-primary/5 via-primary/10 to-accent/10 overflow-hidden">
      {/* Animated background patterns */}
      <div className="absolute inset-0">
        {/* Large glowing orb */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-30"
          style={{
            background: "radial-gradient(circle, hsl(var(--primary)) 0%, transparent 70%)",
            animation: "pulse 4s ease-in-out infinite",
          }}
        />

        {/* Secondary orb */}
        <div
          className="absolute top-1/4 right-1/4 w-[300px] h-[300px] rounded-full opacity-20"
          style={{
            background: "radial-gradient(circle, hsl(var(--accent)) 0%, transparent 70%)",
            animation: "pulse 5s ease-in-out infinite 1s",
          }}
        />

        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(hsl(var(--primary)) 1px, transparent 1px),
              linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)
            `,
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden">
        {mounted && [...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-primary/40"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${5 + Math.random() * 10}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
      </div>

      {/* Central beacon/sun icon */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
        <div className="relative">
          {/* Outer glow rings */}
          <div
            className="absolute inset-0 -m-20 rounded-full border border-primary/20"
            style={{ animation: "spin 30s linear infinite" }}
          />
          <div
            className="absolute inset-0 -m-32 rounded-full border border-primary/10"
            style={{ animation: "spin 40s linear infinite reverse" }}
          />
          <div
            className="absolute inset-0 -m-44 rounded-full border border-primary/5"
            style={{ animation: "spin 50s linear infinite" }}
          />

          {/* Radiating lines */}
          {mounted && [...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute top-1/2 left-1/2 h-0.5 bg-gradient-to-r from-primary/30 to-transparent origin-left"
              style={{
                width: "120px",
                transform: `rotate(${i * 30}deg) translateX(40px)`,
                animation: `pulse ${2 + i * 0.2}s ease-in-out infinite`,
                animationDelay: `${i * 0.1}s`,
              }}
            />
          ))}

          {/* Central icon */}
          <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-primary to-primary/80 shadow-2xl flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-primary/50 animate-ping opacity-20" />
            <Sun className="w-12 h-12 text-primary-foreground" />
          </div>
        </div>
      </div>

      {/* Floating icons */}
      {mounted && (
        <>
          <FloatingIcon
            Icon={BookOpen}
            className="top-[15%] left-[20%]"
            delay={0}
            size={28}
          />
          <FloatingIcon
            Icon={Cross}
            className="top-[25%] right-[15%]"
            delay={1}
            size={24}
          />
          <FloatingIcon
            Icon={Heart}
            className="bottom-[30%] left-[15%]"
            delay={2}
            size={22}
          />
          <FloatingIcon
            Icon={Sparkles}
            className="bottom-[20%] right-[20%]"
            delay={1.5}
            size={26}
          />
        </>
      )}

      {/* Floating scripture snippets */}
      {mounted && verses.map((verse, i) => (
        <div
          key={i}
          className="absolute glass px-4 py-2 rounded-lg text-sm opacity-0"
          style={{
            left: `${10 + (i % 3) * 30}%`,
            top: `${15 + Math.floor(i / 3) * 35}%`,
            animation: `fadeInFloat 8s ease-in-out infinite`,
            animationDelay: `${i * 2}s`,
          }}
        >
          <p className="text-foreground/80 font-medium">&ldquo;{verse.text}&rdquo;</p>
          <p className="text-xs text-muted-foreground mt-0.5">{verse.ref}</p>
        </div>
      ))}

      {/* Bottom gradient overlay */}
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-background/90 via-background/50 to-transparent" />

      {/* Title content */}
      <div className="absolute bottom-8 left-8 right-8 z-10">
        <h1 className="text-3xl font-bold mb-2 text-foreground">
          {title}
        </h1>
        <p className="text-muted-foreground">
          {subtitle}
        </p>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0) translateX(0);
            opacity: 0.4;
          }
          25% {
            transform: translateY(-20px) translateX(10px);
            opacity: 0.8;
          }
          50% {
            transform: translateY(-10px) translateX(-5px);
            opacity: 0.6;
          }
          75% {
            transform: translateY(-30px) translateX(5px);
            opacity: 0.9;
          }
        }

        @keyframes fadeInFloat {
          0%, 100% {
            opacity: 0;
            transform: translateY(20px);
          }
          10%, 40% {
            opacity: 0.9;
            transform: translateY(0);
          }
          50% {
            opacity: 0;
            transform: translateY(-10px);
          }
        }

        @keyframes spin {
          from {
            transform: translate(-50%, -50%) rotate(0deg);
          }
          to {
            transform: translate(-50%, -50%) rotate(360deg);
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 0.6;
            transform: scale(1.05);
          }
        }

        @keyframes floatIcon {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-15px) rotate(5deg);
          }
        }
      `}</style>
    </div>
  );
}

interface FloatingIconProps {
  Icon: React.ComponentType<{ className?: string; size?: number }>;
  className: string;
  delay: number;
  size: number;
}

function FloatingIcon({ Icon, className, delay, size }: FloatingIconProps) {
  return (
    <div
      className={`absolute ${className}`}
      style={{
        animation: `floatIcon 6s ease-in-out infinite`,
        animationDelay: `${delay}s`,
      }}
    >
      <div className="glass p-3 rounded-xl shadow-lg">
        <Icon className="text-primary" size={size} />
      </div>
    </div>
  );
}
