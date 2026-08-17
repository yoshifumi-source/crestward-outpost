"use client";

import { UserSettings, Skill } from "@/types";
import { Sparkles, Coins, Zap, Heart, Shield, Award, User } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface AdventurerStatusCardProps {
  settings: UserSettings;
  skills?: Skill[];
  onOpenCheckIn?: () => void;
}

export function AdventurerStatusCard({ settings, skills = [], onOpenCheckIn }: AdventurerStatusCardProps) {
  const hpPercent = Math.round((settings.currentHp / settings.maxHp) * 100);
  const mpPercent = Math.round((settings.currentMp / settings.maxMp) * 100);
  const xpPercent = Math.round((settings.xp / settings.xpToNextLevel) * 100);

  return (
    <div className="relative overflow-hidden rounded-3xl glass-card-dark text-white p-5 shadow-xl border border-white/10 mb-6 group">
      {/* Background ambient lighting */}
      <div className="absolute -top-12 -right-12 w-36 h-36 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none group-hover:bg-emerald-500/30 transition-all duration-700"></div>
      <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-amber-500/15 rounded-full blur-2xl pointer-events-none"></div>

      {/* Header: Name, Title & Level */}
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 p-0.5 shadow-md flex items-center justify-center">
            <div className="w-full h-full bg-stone-900/80 rounded-[14px] flex items-center justify-center">
              <User className="w-6 h-6 text-emerald-300" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-black text-base tracking-tight text-stone-100">{settings.name}</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-400/20 text-amber-300 border border-amber-400/30">
                Lv. {settings.level}
              </span>
            </div>
            <p className="text-xs font-medium text-stone-400 flex items-center gap-1 mt-0.5">
              <Award className="w-3.5 h-3.5 text-emerald-400" /> {settings.title}
            </p>
          </div>
        </div>

        {/* Gold Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-300 font-mono font-bold text-sm shadow-inner">
          <Coins className="w-4 h-4 text-amber-400 animate-pulse" />
          <span>{settings.gold}</span>
          <span className="text-[10px] font-sans text-amber-400/80">G</span>
        </div>
      </div>

      {/* Level XP Progress */}
      <div className="mb-4 bg-stone-900/60 p-2.5 rounded-2xl border border-white/5">
        <div className="flex justify-between text-[11px] font-bold text-stone-300 mb-1.5">
          <span className="flex items-center gap-1 text-emerald-400">
            <Sparkles className="w-3.5 h-3.5" /> 次のレベルまで
          </span>
          <span className="font-mono text-stone-400">
            {settings.xp} / {settings.xpToNextLevel} XP ({xpPercent}%)
          </span>
        </div>
        <div className="w-full bg-stone-800/80 h-2 rounded-full overflow-hidden p-0.5">
          <div 
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-300 rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" 
            style={{ width: `${xpPercent}%` }}
          />
        </div>
      </div>

      {/* HP & MP Dual Status Bars */}
      <div className="grid grid-cols-2 gap-3 relative z-10">
        {/* HP */}
        <div className="bg-stone-900/60 p-3 rounded-2xl border border-rose-500/20">
          <div className="flex justify-between items-center text-xs font-bold mb-1.5">
            <span className="flex items-center gap-1 text-rose-400">
              <Heart className="w-3.5 h-3.5 fill-rose-500/40 text-rose-400" /> HP (体力)
            </span>
            <span className="font-mono text-[11px] text-stone-300">{settings.currentHp}/{settings.maxHp}</span>
          </div>
          <div className="w-full bg-stone-800 h-2 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-rose-600 to-rose-400 rounded-full transition-all duration-500"
              style={{ width: `${hpPercent}%` }}
            />
          </div>
        </div>

        {/* MP */}
        <div className="bg-stone-900/60 p-3 rounded-2xl border border-indigo-500/20">
          <div className="flex justify-between items-center text-xs font-bold mb-1.5">
            <span className="flex items-center gap-1 text-indigo-400">
              <Zap className="w-3.5 h-3.5 fill-indigo-500/40 text-indigo-400" /> MP (気力)
            </span>
            <span className="font-mono text-[11px] text-stone-300">{settings.currentMp}/{settings.maxMp}</span>
          </div>
          <div className="w-full bg-stone-800 h-2 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-indigo-600 to-indigo-400 rounded-full transition-all duration-500"
              style={{ width: `${mpPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Daily Check-in CTA button */}
      {onOpenCheckIn && (
        <button
          onClick={onOpenCheckIn}
          className="mt-3 w-full py-2 px-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-xs font-bold text-stone-200 flex items-center justify-center gap-1.5 transition-all active:scale-[0.98]"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>朝のデイリーチェックイン（HP/MP回復）</span>
        </button>
      )}
    </div>
  );
}
