"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Quest, QuestChapter, Milestone, MainStory, FutureVision, GoalProject } from "@/types";
import { Compass, Sparkles, MapPin, ChevronDown, Flag, Target, FolderKanban } from "lucide-react";
import { storage } from "@/services/storage";

interface WhyExplanationModalProps {
  quest: Quest | null;
  chapter?: QuestChapter;
  milestone?: Milestone;
  project?: GoalProject;
  mainStory?: MainStory | null;
  futureVision?: FutureVision | null;
  isOpen: boolean;
  onClose: () => void;
}

export function WhyExplanationModal({
  quest,
  chapter,
  milestone,
  project,
  mainStory,
  futureVision,
  isOpen,
  onClose
}: WhyExplanationModalProps) {
  if (!quest) return null;

  // Resolve parent project if not passed directly
  let resolvedProject = project;
  if (!resolvedProject && quest.projectId) {
    resolvedProject = storage.getProjects().find(p => p.id === quest.projectId);
  }

  // Resolve parent story if not passed directly
  let resolvedStory = mainStory;
  if (!resolvedStory && quest.storyId) {
    resolvedStory = storage.getStories().find(s => s.id === quest.storyId) || null;
  }

  // Resolve parent milestone if not passed directly
  let resolvedMilestone = milestone;
  if (!resolvedMilestone && quest.milestoneId) {
    resolvedMilestone = storage.getMilestones().find(m => m.id === quest.milestoneId);
  }

  const steps = [
    {
      level: "Level 4: 現在挑戦中のクエスト",
      title: quest.title,
      icon: Target,
      color: "border-emerald-500 bg-emerald-50 text-emerald-800",
      badgeColor: "bg-emerald-600 text-white"
    },
    ...(resolvedMilestone ? [{
      level: "Level 3: 工程（マイルストーン）",
      title: resolvedMilestone.title,
      icon: Flag,
      color: "border-teal-400 bg-teal-50 text-teal-900",
      badgeColor: "bg-teal-600 text-white"
    }] : []),
    ...(resolvedProject ? [{
      level: "Level 2: 達成手段（プロジェクト）",
      title: resolvedProject.title,
      icon: FolderKanban,
      color: "border-indigo-400 bg-indigo-50 text-indigo-900",
      badgeColor: "bg-indigo-600 text-white"
    }] : []),
    ...(chapter && !resolvedProject ? [{
      level: "物語の章（チャプター）",
      title: chapter.title,
      icon: MapPin,
      color: "border-indigo-400 bg-indigo-50 text-indigo-900",
      badgeColor: "bg-indigo-600 text-white"
    }] : []),
    ...(resolvedStory ? [{
      level: "Level 1: 大目標（メインストーリー）",
      title: resolvedStory.title,
      icon: Compass,
      color: "border-amber-400 bg-amber-50 text-amber-900",
      badgeColor: "bg-amber-600 text-white"
    }] : []),
    ...(futureVision ? [{
      level: "🌟 補足: 目指す究極の理想 & 価値観",
      title: futureVision.content,
      icon: Sparkles,
      color: "border-purple-400 bg-purple-50 text-purple-900",
      badgeColor: "bg-purple-600 text-white"
    }] : [])
  ];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-sm mx-auto rounded-3xl p-6 bg-white/95 backdrop-blur-2xl border border-stone-100 shadow-2xl">
        <DialogHeader className="mb-2 text-center">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 mx-auto flex items-center justify-center mb-1.5 shadow-sm">
            <Compass className="w-5 h-5 text-amber-600" />
          </div>
          <DialogTitle className="text-base font-black text-stone-800">
            このタスクを行う目的（WHY）
          </DialogTitle>
          <DialogDescription className="text-xs font-medium text-stone-500">
            今の手元のアクションが、どの手段・大目標・理想に繋がっているのかを確認できます。
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-1.5 relative my-2 max-h-[60vh] overflow-y-auto pr-1">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div key={idx} className="relative">
                <div className={`p-3 rounded-2xl border ${step.color} shadow-2xs transition-all`}>
                  <div className="flex items-center justify-between mb-0.5">
                    <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${step.badgeColor}`}>
                      {step.level}
                    </span>
                    <Icon className="w-3.5 h-3.5 opacity-60" />
                  </div>
                  <p className="text-xs font-bold leading-snug mt-1">
                    {step.title}
                  </p>
                </div>

                {idx < steps.length - 1 && (
                  <div className="flex justify-center my-0.5">
                    <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <Button
          onClick={onClose}
          className="w-full bg-stone-900 hover:bg-black text-white rounded-2xl py-5 font-bold text-xs shadow-md mt-1"
        >
          納得してクエストに戻る
        </Button>
      </DialogContent>
    </Dialog>
  );
}
