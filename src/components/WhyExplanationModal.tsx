"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Quest, QuestChapter, Milestone, MainStory, FutureVision } from "@/types";
import { Compass, Sparkles, MapPin, ChevronDown, Flag, Target } from "lucide-react";

interface WhyExplanationModalProps {
  quest: Quest | null;
  chapter?: QuestChapter;
  milestone?: Milestone;
  mainStory?: MainStory | null;
  futureVision?: FutureVision | null;
  isOpen: boolean;
  onClose: () => void;
}

export function WhyExplanationModal({
  quest,
  chapter,
  milestone,
  mainStory,
  futureVision,
  isOpen,
  onClose
}: WhyExplanationModalProps) {
  if (!quest) return null;

  const steps = [
    {
      level: "現在のクエスト (Quest)",
      title: quest.title,
      icon: Target,
      color: "border-emerald-500 bg-emerald-50 text-emerald-800",
      badgeColor: "bg-emerald-600 text-white"
    },
    ...(milestone ? [{
      level: "マイルストーン (Milestone)",
      title: milestone.title,
      icon: Flag,
      color: "border-teal-400 bg-teal-50 text-teal-900",
      badgeColor: "bg-teal-600 text-white"
    }] : []),
    ...(chapter ? [{
      level: "チャプター (Chapter)",
      title: chapter.title,
      icon: MapPin,
      color: "border-indigo-400 bg-indigo-50 text-indigo-900",
      badgeColor: "bg-indigo-600 text-white"
    }] : []),
    ...(mainStory ? [{
      level: "メインストーリー (Main Story)",
      title: mainStory.title,
      icon: Compass,
      color: "border-amber-400 bg-amber-50 text-amber-900",
      badgeColor: "bg-amber-600 text-white"
    }] : []),
    ...(futureVision ? [{
      level: "目指す未来の情景 (Future Vision)",
      title: futureVision.content,
      icon: Sparkles,
      color: "border-purple-400 bg-purple-50 text-purple-900",
      badgeColor: "bg-purple-600 text-white"
    }] : [])
  ];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-sm mx-auto rounded-3xl p-6 bg-white/95 backdrop-blur-2xl border border-stone-100 shadow-2xl">
        <DialogHeader className="mb-3 text-center">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 mx-auto flex items-center justify-center mb-2 shadow-sm">
            <Compass className="w-5 h-5 animate-spin-slow" />
          </div>
          <DialogTitle className="text-lg font-black text-stone-800">
            なぜこれをやるのか？ (WHY)
          </DialogTitle>
          <DialogDescription className="text-xs font-medium text-stone-500">
            小さなクエストが、あなたの目指す未来とどのように繋がっているかを確認できます。
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 relative my-2">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div key={idx} className="relative">
                <div className={`p-3.5 rounded-2xl border ${step.color} shadow-sm transition-all`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${step.badgeColor}`}>
                      {step.level}
                    </span>
                    <Icon className="w-3.5 h-3.5 opacity-60" />
                  </div>
                  <p className="text-xs font-bold leading-relaxed mt-1">
                    {step.title}
                  </p>
                </div>

                {idx < steps.length - 1 && (
                  <div className="flex justify-center my-0.5">
                    <ChevronDown className="w-4 h-4 text-stone-300 animate-bounce" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <Button
          onClick={onClose}
          className="w-full bg-stone-900 hover:bg-black text-white rounded-2xl py-5 font-bold text-xs shadow-md mt-2"
        >
          納得してクエストに戻る
        </Button>
      </DialogContent>
    </Dialog>
  );
}
