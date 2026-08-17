"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles, Coins, Award, CheckCircle2, ArrowRight } from "lucide-react";
import { Quest } from "@/types";

interface QuestCompletionModalProps {
  quest: Quest | null;
  leveledUp: boolean;
  newLevel: number;
  isOpen: boolean;
  onClose: () => void;
}

export function QuestCompletionModal({
  quest,
  leveledUp,
  newLevel,
  isOpen,
  onClose
}: QuestCompletionModalProps) {
  if (!quest) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xs mx-auto rounded-3xl p-6 bg-white/95 backdrop-blur-2xl border border-stone-100 shadow-2xl text-center animate-fanfare">
        {/* Celebration Icon */}
        <div className="relative mx-auto w-16 h-16 mb-3">
          <div className="absolute inset-0 bg-amber-400/30 rounded-full animate-ping" />
          <div className="relative w-16 h-16 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 p-1 shadow-lg flex items-center justify-center">
            {leveledUp ? (
              <Award className="w-8 h-8 text-white animate-bounce" />
            ) : (
              <CheckCircle2 className="w-8 h-8 text-white" />
            )}
          </div>
        </div>

        {/* Level Up Banner */}
        {leveledUp ? (
          <div className="mb-2">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-black bg-gradient-to-r from-amber-500 to-yellow-400 text-stone-900 shadow-md tracking-wider animate-pulse">
              🎉 レベルアップ！
            </span>
            <h2 className="text-xl font-black text-stone-800 mt-2">
              Lv. {newLevel} に到達！
            </h2>
            <p className="text-xs font-bold text-amber-600 mt-1">
              冒険者としての器がさらに広がりました！
            </p>
          </div>
        ) : (
          <div className="mb-2">
            <span className="inline-block px-3 py-1 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-700 uppercase tracking-widest">
              クエスト達成
            </span>
            <h2 className="text-lg font-black text-stone-800 mt-2 leading-snug">
              クエストクリア！
            </h2>
          </div>
        )}

        <p className="text-xs font-medium text-stone-600 bg-stone-50 p-3 rounded-2xl border border-stone-100 my-3 leading-relaxed">
          {quest.title}
        </p>

        {/* Rewards Earned */}
        <div className="grid grid-cols-2 gap-2 my-4">
          <div className="p-3 bg-emerald-50/80 border border-emerald-100 rounded-2xl flex flex-col items-center justify-center">
            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-0.5">獲得経験値</span>
            <div className="flex items-center gap-1 text-emerald-700 font-mono font-black text-base">
              <Sparkles className="w-4 h-4 text-emerald-500" />
              +{quest.xpReward} XP
            </div>
          </div>

          <div className="p-3 bg-amber-50/80 border border-amber-100 rounded-2xl flex flex-col items-center justify-center">
            <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-0.5">獲得ゴールド</span>
            <div className="flex items-center gap-1 text-amber-700 font-mono font-black text-base">
              <Coins className="w-4 h-4 text-amber-500" />
              +{quest.goldReward} G
            </div>
          </div>
        </div>

        {/* Skill tag improvements */}
        {quest.skillTags && quest.skillTags.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-1.5 mb-4">
            {quest.skillTags.map((tag, i) => (
              <span key={i} className="text-[10px] font-bold px-2.5 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-lg">
                📈 {tag} +{Math.round(quest.xpReward / 2)}XP
              </span>
            ))}
          </div>
        )}

        <Button
          onClick={onClose}
          className="w-full bg-stone-900 hover:bg-black text-white rounded-2xl py-6 font-bold text-sm shadow-md"
        >
          冒険を続ける <ArrowRight className="w-4 h-4 ml-1.5" />
        </Button>
      </DialogContent>
    </Dialog>
  );
}
