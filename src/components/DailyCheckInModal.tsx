"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { storage } from "@/services/storage";
import { DailyCheckIn } from "@/types";
import { Sparkles, Moon, Sun, Smile, BatteryCharging, Heart, Zap } from "lucide-react";

interface DailyCheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckInComplete: () => void;
}

export function DailyCheckInModal({ isOpen, onClose, onCheckInComplete }: DailyCheckInModalProps) {
  const [sleep, setSleep] = useState<number>(4);
  const [energy, setEnergy] = useState<number>(4);
  const [mood, setMood] = useState<number>(4);
  const [physical, setPhysical] = useState<number>(4);

  // Calculate HP & MP recovery
  const calculatedHp = Math.min(100, Math.round(((sleep + physical) / 10) * 100));
  const calculatedMp = Math.min(10, Math.max(1, Math.round(((energy + mood) / 10) * 10)));

  const handleSave = () => {
    const todayStr = new Date().toISOString().split("T")[0];
    const newCheckIn: DailyCheckIn = {
      id: `checkin_${Date.now()}`,
      date: todayStr,
      sleep,
      energy,
      mood,
      physicalCondition: physical,
      calculatedHp,
      calculatedMp
    };

    const checkIns = storage.getCheckIns();
    storage.saveCheckIns([newCheckIn, ...checkIns.filter(c => c.date !== todayStr)]);

    // Update settings with recovered HP/MP
    const settings = storage.getSettings();
    settings.currentHp = calculatedHp;
    settings.currentMp = calculatedMp;
    settings.lastCheckInDate = todayStr;
    storage.saveSettings(settings);

    // Add story log
    storage.addStoryLog({
      id: `log_${Date.now()}`,
      date: Date.now(),
      type: "journal_insight",
      title: "デイリーチェックイン完了",
      description: `本日のコンディション: HP ${calculatedHp} / MP ${calculatedMp} で冒険を開始しました。`
    });

    onCheckInComplete();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-sm mx-auto rounded-3xl p-6 bg-white/95 backdrop-blur-xl border border-stone-100 shadow-2xl">
        <DialogHeader className="mb-4 text-center">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200/60 mx-auto flex items-center justify-center mb-2 shadow-sm">
            <Sun className="w-6 h-6 animate-spin-slow" />
          </div>
          <DialogTitle className="text-xl font-black text-stone-800">
            朝のチェックイン
          </DialogTitle>
          <DialogDescription className="text-xs font-medium text-stone-500">
            本日の体調を記録し、HP（体力）とMP（気力）を回復しましょう。
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-1">
          {/* Sleep */}
          <div>
            <div className="flex justify-between text-xs font-bold text-stone-700 mb-1.5">
              <span className="flex items-center gap-1 text-indigo-600">
                <Moon className="w-3.5 h-3.5" /> 睡眠の質
              </span>
              <span className="font-mono bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md">{sleep} / 5</span>
            </div>
            <Slider value={[sleep]} min={1} max={5} step={1} onValueChange={(val: any) => setSleep(Array.isArray(val) ? val[0] : Number(val))} />
          </div>

          {/* Energy */}
          <div>
            <div className="flex justify-between text-xs font-bold text-stone-700 mb-1.5">
              <span className="flex items-center gap-1 text-amber-600">
                <BatteryCharging className="w-3.5 h-3.5" /> エネルギー・活力
              </span>
              <span className="font-mono bg-amber-50 text-amber-700 px-2 py-0.5 rounded-md">{energy} / 5</span>
            </div>
            <Slider value={[energy]} min={1} max={5} step={1} onValueChange={(val: any) => setEnergy(Array.isArray(val) ? val[0] : Number(val))} />
          </div>

          {/* Mood */}
          <div>
            <div className="flex justify-between text-xs font-bold text-stone-700 mb-1.5">
              <span className="flex items-center gap-1 text-emerald-600">
                <Smile className="w-3.5 h-3.5" /> 気分・モチベーション
              </span>
              <span className="font-mono bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md">{mood} / 5</span>
            </div>
            <Slider value={[mood]} min={1} max={5} step={1} onValueChange={(val: any) => setMood(Array.isArray(val) ? val[0] : Number(val))} />
          </div>

          {/* Physical Condition */}
          <div>
            <div className="flex justify-between text-xs font-bold text-stone-700 mb-1.5">
              <span className="flex items-center gap-1 text-rose-600">
                <Heart className="w-3.5 h-3.5" /> 身体の調子・軽さ
              </span>
              <span className="font-mono bg-rose-50 text-rose-700 px-2 py-0.5 rounded-md">{physical} / 5</span>
            </div>
            <Slider value={[physical]} min={1} max={5} step={1} onValueChange={(val: any) => setPhysical(Array.isArray(val) ? val[0] : Number(val))} />
          </div>

          {/* Recovery Preview */}
          <div className="bg-stone-50 p-3 rounded-2xl border border-stone-200/80 flex items-center justify-around mt-4 shadow-inner">
            <div className="text-center">
              <span className="text-[10px] font-bold text-stone-400 block mb-0.5">回復HP</span>
              <span className="text-sm font-black text-rose-600 flex items-center justify-center gap-1">
                <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" /> {calculatedHp}
              </span>
            </div>
            <div className="h-6 w-px bg-stone-200" />
            <div className="text-center">
              <span className="text-[10px] font-bold text-stone-400 block mb-0.5">回復MP</span>
              <span className="text-sm font-black text-indigo-600 flex items-center justify-center gap-1">
                <Zap className="w-3.5 h-3.5 fill-indigo-500 text-indigo-500" /> {calculatedMp}
              </span>
            </div>
          </div>
        </div>

        <Button
          onClick={handleSave}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl py-6 font-bold text-base shadow-lg shadow-emerald-600/20 mt-3"
        >
          <Sparkles className="w-5 h-5 mr-2" />
          体調を記録して冒険を始める
        </Button>
      </DialogContent>
    </Dialog>
  );
}
