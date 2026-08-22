"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Quest, QuestMetric, MetricProgressLog } from "@/types";
import { storage } from "@/services/storage";
import { 
  BarChart3, 
  Plus, 
  Sparkles, 
  History, 
  CheckCircle2, 
  TrendingUp, 
  Calendar, 
  Clock, 
  ArrowRight,
  Target
} from "lucide-react";

interface MetricTargetItem {
  id: string;
  title: string;
  metric?: QuestMetric;
  levelType?: "story" | "project" | "milestone" | "quest";
}

interface MetricProgressModalProps {
  quest?: Quest | null;
  targetItem?: MetricTargetItem | null;
  isOpen: boolean;
  onClose: () => void;
  onProgressUpdated?: (item: any, isCompleted: boolean) => void;
}

export function MetricProgressModal({
  quest,
  targetItem,
  isOpen,
  onClose,
  onProgressUpdated
}: MetricProgressModalProps) {
  const [mode, setMode] = useState<"add" | "absolute">("add");
  const [inputValue, setInputValue] = useState<string>("");
  const [note, setNote] = useState<string>("");
  const [showHistory, setShowHistory] = useState<boolean>(false);

  const activeTarget = targetItem || (quest ? {
    id: quest.id,
    title: quest.title,
    metric: quest.metric,
    levelType: "quest" as const
  } : null);

  useEffect(() => {
    if (isOpen) {
      setInputValue("");
      setNote("");
      setMode("add");
      setShowHistory(false);
    }
  }, [isOpen, activeTarget?.id]);

  if (!activeTarget || !activeTarget.metric) return null;

  const { targetValue, currentValue, unit, history = [] } = activeTarget.metric;
  const currentPercent = Math.min(100, Math.round((currentValue / targetValue) * 1000) / 10);

  const num = parseFloat(inputValue) || 0;
  const projectedValue = mode === "add" 
    ? Math.max(0, currentValue + num) 
    : Math.max(0, num);
  const projectedPercent = Math.min(100, Math.round((projectedValue / targetValue) * 1000) / 10);
  const isGoalReached = projectedValue >= targetValue;

  const levelLabels = {
    story: "Level 1: 🌟 大目標",
    project: "Level 2: 📱 達成手段",
    milestone: "Level 3: 🚩 工程",
    quest: "Level 4: ⚔️ クエスト"
  };

  const handleSave = () => {
    if (isNaN(num) || num === 0) {
      if (mode === "add") return;
    }

    const levelType = activeTarget.levelType || "quest";
    let updatedResult: any = null;
    let isCompleted = false;

    if (levelType === "story") {
      const res = storage.updateStoryMetric(activeTarget.id, num, mode === "absolute", note);
      updatedResult = res.story;
      isCompleted = res.isCompleted;
    } else if (levelType === "project") {
      const res = storage.updateProjectMetric(activeTarget.id, num, mode === "absolute", note);
      updatedResult = res.project;
      isCompleted = res.isCompleted;
    } else if (levelType === "milestone") {
      const res = storage.updateMilestoneMetric(activeTarget.id, num, mode === "absolute", note);
      updatedResult = res.milestone;
      isCompleted = res.isCompleted;
    } else {
      const res = storage.updateQuestMetric(activeTarget.id, num, mode === "absolute", note);
      updatedResult = res.quest;
      isCompleted = res.isCompleted;
    }

    if (onProgressUpdated && updatedResult) {
      onProgressUpdated(updatedResult, isCompleted);
    }
    onClose();
  };

  // Quick addition chips based on unit
  const quickPills = unit.includes("円")
    ? [1000, 5000, 10000, 50000, 100000]
    : unit.includes("km") || unit.includes("キロ")
    ? [1, 3, 5, 10, 15]
    : unit.includes("ページ")
    ? [5, 10, 20, 30, 50]
    : [1, 5, 10, 20, 50];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-sm mx-auto rounded-3xl p-6 bg-white/95 backdrop-blur-2xl border border-stone-100 shadow-2xl">
        <DialogHeader className="text-center">
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 mx-auto flex items-center justify-center mb-2 shadow-sm">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
          </div>
          <DialogTitle className="text-base font-black text-stone-800 leading-snug">
            {levelLabels[activeTarget.levelType || "quest"]} 進捗記録
          </DialogTitle>
          <DialogDescription className="text-xs font-medium text-stone-500 line-clamp-1">
            {activeTarget.title}
          </DialogDescription>
        </DialogHeader>

        {/* Current Progress Display Card */}
        <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/80 my-2">
          <div className="flex justify-between items-baseline mb-1.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-stone-400">
              現在の到達度
            </span>
            <div className="font-mono text-xs">
              <span className="text-sm font-black text-emerald-700 font-mono">
                {currentValue.toLocaleString()}
              </span>
              <span className="text-stone-400 font-bold mx-1">/</span>
              <span className="text-stone-600 font-bold">
                {targetValue.toLocaleString()} {unit}
              </span>
              <span className="ml-1.5 text-xs font-black text-emerald-600">
                ({currentPercent}%)
              </span>
            </div>
          </div>
          <Progress value={currentPercent} className="h-2 bg-stone-200 *:bg-emerald-600" />
        </div>

        {/* Mode Switch Tabs */}
        <div className="flex bg-stone-100 p-1 rounded-xl gap-1 my-1">
          <button
            type="button"
            onClick={() => setMode("add")}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
              mode === "add" ? "bg-white text-stone-800 shadow-xs" : "text-stone-500 hover:text-stone-800"
            }`}
          >
            ＋ 今日の分を加算
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("absolute");
              if (!inputValue) setInputValue(String(currentValue));
            }}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
              mode === "absolute" ? "bg-white text-stone-800 shadow-xs" : "text-stone-500 hover:text-stone-800"
            }`}
          >
            累計値を直接指定
          </button>
        </div>

        {/* Input Section */}
        <div className="space-y-3 py-1">
          <div>
            <label className="block text-[11px] font-bold text-stone-600 mb-1">
              {mode === "add" ? `今回進んだ量 (${unit})` : `現在の累計値 (${unit})`}
            </label>
            <div className="relative">
              <Input
                type="number"
                step="any"
                autoFocus
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={mode === "add" ? `例: 25` : `例: 80`}
                className="text-base font-bold font-mono rounded-xl pr-12 text-stone-800"
              />
              <span className="absolute right-3 top-2.5 text-xs font-bold text-stone-400 pointer-events-none">
                {unit}
              </span>
            </div>

            {/* Quick addition chips */}
            {mode === "add" && (
              <div className="flex flex-wrap gap-1 mt-2">
                {quickPills.map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setInputValue(String(val))}
                    className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-white border border-stone-200/80 text-stone-600 hover:bg-stone-50 active:scale-95 transition-all"
                  >
                    +{val.toLocaleString()}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Optional Note */}
          <div>
            <label className="block text-[11px] font-bold text-stone-600 mb-1">
              ひとことメモ（任意）
            </label>
            <Input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="例: 第3章読了、ココナラで1件受注 など"
              className="text-xs rounded-xl"
            />
          </div>

          {/* Projected Preview Banner */}
          {num > 0 && (
            <div className={`p-3 rounded-xl border text-xs font-bold ${
              isGoalReached 
                ? "bg-amber-50 border-amber-300 text-amber-900" 
                : "bg-emerald-50/80 border-emerald-200 text-emerald-900"
            }`}>
              <div className="flex justify-between items-center mb-1">
                <span>記録後の到達度:</span>
                <span className="font-mono font-black text-sm">
                  {projectedValue.toLocaleString()} / {targetValue.toLocaleString()} {unit} ({projectedPercent}%)
                </span>
              </div>
              {isGoalReached ? (
                <p className="text-[11px] text-amber-800 font-bold flex items-center gap-1 mt-0.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  🎉 おめでとうございます！目標数値を100%達成します！
                </p>
              ) : (
                <p className="text-[10px] text-emerald-700 font-medium">
                  目標まであと {(Math.max(0, targetValue - projectedValue)).toLocaleString()} {unit}
                </p>
              )}
            </div>
          )}
        </div>

        {/* History Accordion */}
        {history.length > 0 && (
          <div className="border-t border-stone-100 pt-2">
            <button
              type="button"
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center justify-between w-full text-[10px] font-bold text-stone-400 hover:text-stone-700 py-1"
            >
              <span className="flex items-center gap-1">
                <History className="w-3 h-3" /> 進捗ログ履歴 ({history.length}件)
              </span>
              <span>{showHistory ? "閉じる" : "表示"}</span>
            </button>

            {showHistory && (
              <div className="max-h-32 overflow-y-auto space-y-1.5 mt-1.5 pr-1">
                {history.map((h: MetricProgressLog) => (
                  <div key={h.id} className="p-2 rounded-lg bg-stone-50 border border-stone-100 text-[10px] flex justify-between items-center">
                    <div>
                      <span className="font-mono text-emerald-700 font-bold mr-1.5">
                        {h.amountAdded >= 0 ? `+${h.amountAdded.toLocaleString()}` : h.amountAdded.toLocaleString()} {unit}
                      </span>
                      {h.note && <span className="text-stone-600">{h.note}</span>}
                    </div>
                    <span className="text-stone-400 font-mono text-[9px]">
                      {new Date(h.date).toLocaleDateString("ja-JP", { month: "numeric", day: "numeric" })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <DialogFooter className="flex flex-col gap-2 mt-1">
          <Button
            onClick={handleSave}
            disabled={!inputValue || isNaN(num) || (mode === "add" && num <= 0)}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl py-5 font-bold text-xs shadow-md"
          >
            <CheckCircle2 className="w-4 h-4 mr-1.5" />
            進捗を記録する
          </Button>
          <Button
            onClick={onClose}
            variant="ghost"
            className="w-full text-stone-400 hover:text-stone-700 text-xs font-bold py-2"
          >
            キャンセル
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
