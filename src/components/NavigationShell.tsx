"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  Home, 
  Map, 
  Target, 
  Compass, 
  BookOpen, 
  Hammer, 
  HelpCircle, 
  Sparkles,
  Zap,
  Shield,
  ChevronRight,
  Download
} from "lucide-react";
import { useEffect, useState } from "react";
import { storage } from "@/services/storage";
import { UserSettings } from "@/types";

export function NavigationShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [settings, setSettings] = useState<UserSettings | null>(null);

  useEffect(() => {
    setSettings(storage.getSettings());
  }, [pathname]);

  // Hide nav on onboarding pages if desired
  const isOnboarding = pathname.startsWith("/onboarding") || pathname.startsWith("/discovery/");

  const navItems = [
    { href: "/", label: "ホーム", icon: Home, desc: "ダッシュボード" },
    { href: "/story", label: "ストーリー航海図", icon: Map, desc: "目標ツリー・階層管理" },
    { href: "/quests", label: "クエスト掲示板", icon: Target, desc: "本日の行動・数値目標" },
    { href: "/quest-builder", label: "クエスト作成工房", icon: Hammer, desc: "AI逆算・多階層設計" },
    { href: "/journal", label: "冒険録", icon: BookOpen, desc: "達成ログ・軌跡" },
    { href: "/profile", label: "コンパス（自己探索）", icon: Compass, desc: "価値観・バックアップ" },
    { href: "/guide", label: "使い方ガイド", icon: HelpCircle, desc: "操作マニュアル" },
  ];

  const mobileNavItems = [
    { href: "/", label: "ホーム", icon: Home },
    { href: "/story", label: "ストーリー", icon: Map },
    { href: "/quests", label: "クエスト", icon: Target },
    { href: "/profile", label: "コンパス", icon: Compass },
    { href: "/journal", label: "冒険録", icon: BookOpen },
  ];

  if (isOnboarding) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* ========================================================================= */}
      {/* 💻 DESKTOP SIDEBAR (Visible only on md: screens and above) */}
      {/* ========================================================================= */}
      <aside className="hidden md:flex flex-col w-64 fixed inset-y-0 left-0 z-40 bg-white/80 backdrop-blur-xl border-r border-stone-200/80 shadow-sm p-4 justify-between">
        <div>
          {/* Logo & Brand Header */}
          <Link href="/" className="flex items-center gap-2.5 px-3 py-3 mb-4 rounded-2xl hover:bg-stone-50 transition-colors group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 p-0.5 shadow-md flex items-center justify-center group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-stone-900 rounded-[14px] flex items-center justify-center">
                <Compass className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-black text-stone-500 uppercase tracking-wider font-mono">
                  OUTPOST v2.0
                </span>
              </div>
              <h1 className="text-base font-black text-stone-800 tracking-tight">
                Crestward
              </h1>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-2xl text-xs font-bold transition-all group ${
                    isActive 
                      ? "bg-emerald-600 text-white shadow-sm shadow-emerald-600/20" 
                      : "text-stone-600 hover:text-stone-900 hover:bg-stone-100/70"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`p-1.5 rounded-xl transition-all ${
                      isActive ? "bg-white/20 text-white" : "bg-stone-100 text-stone-500 group-hover:bg-white group-hover:text-stone-800"
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="block leading-none">{item.label}</span>
                      <span className={`text-[10px] font-normal leading-none mt-1 block ${
                        isActive ? "text-emerald-100" : "text-stone-400"
                      }`}>
                        {item.desc}
                      </span>
                    </div>
                  </div>
                  {isActive && <ChevronRight className="w-4 h-4 text-emerald-200" />}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Adventurer Mini-Badge & Quick Stats */}
        {settings && (
          <div className="pt-3 border-t border-stone-200/80">
            <Link 
              href="/profile"
              className="block p-3 rounded-2xl bg-stone-50/90 border border-stone-200/70 hover:bg-stone-100/80 transition-colors group"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-stone-400 font-mono">
                  ADVENTURER
                </span>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-mono">
                  Lv.{settings.level}
                </span>
              </div>
              <div className="font-bold text-xs text-stone-800 truncate mb-1">
                {settings.name}
              </div>
              <div className="flex items-center justify-between text-[11px] font-mono font-bold text-stone-500">
                <span className="flex items-center gap-1 text-indigo-700">
                  <Zap className="w-3 h-3 text-indigo-500 fill-indigo-500" />
                  {settings.currentMp}/{settings.maxMp} MP
                </span>
                <span className="text-amber-700">
                  {settings.gold} G
                </span>
              </div>
            </Link>
          </div>
        )}
      </aside>

      {/* ========================================================================= */}
      {/* 📱 / 💻 MAIN CONTENT WRAPPER */}
      {/* ========================================================================= */}
      <div className="flex-1 md:pl-64 min-h-screen">
        {children}
      </div>

      {/* ========================================================================= */}
      {/* 📱 MOBILE BOTTOM NAVIGATION (Visible only on mobile screens < md) */}
      {/* ========================================================================= */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around bg-white/90 backdrop-blur-xl border-t border-stone-200/80 px-2 py-2 pb-6 shadow-[0_-8px_30px_rgba(0,0,0,0.06)] max-w-lg mx-auto">
        {mobileNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center w-full py-1 rounded-2xl transition-all duration-300 relative group ${
                isActive 
                  ? "text-emerald-700 font-black scale-105" 
                  : "text-stone-400 hover:text-stone-700 font-bold"
              }`}
            >
              {isActive && (
                <span className="absolute -top-2 w-8 h-1 bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
              )}
              <div className={`p-1.5 rounded-xl transition-all ${
                isActive ? "bg-emerald-50 text-emerald-600 shadow-sm" : "group-hover:bg-stone-50"
              }`}>
                <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className="text-[10px] tracking-tight mt-0.5">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
