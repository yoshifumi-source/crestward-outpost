"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Map, Target, Compass, BookOpen } from "lucide-react";

export function BottomNav() {
  const pathname = usePathname();

  // Hide nav on onboarding pages if desired
  if (pathname.startsWith("/onboarding") || pathname.startsWith("/discovery/")) {
    return null;
  }

  const navItems = [
    { href: "/", label: "ホーム", icon: Home },
    { href: "/story", label: "ストーリー", icon: Map },
    { href: "/quests", label: "クエスト", icon: Target },
    { href: "/profile", label: "コンパス", icon: Compass },
    { href: "/journal", label: "冒険録", icon: BookOpen },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around bg-white/90 backdrop-blur-xl border-t border-stone-200/80 px-2 py-2 pb-6 shadow-[0_-8px_30px_rgba(0,0,0,0.06)] max-w-lg mx-auto">
      {navItems.map((item) => {
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
            {/* Active Glow Pill */}
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
  );
}
