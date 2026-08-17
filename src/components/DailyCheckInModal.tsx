"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { storage } from "@/services/storage";
import { DailyCheckIn } from "@/types";
import { Sparkles, Moon, Sun, Smile, BatteryCharging, Heart, Zap } from "lucide-react";

interface DailyCheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckInComplete: () => void;
}

interface MetricGaugeProps {
  label: string;
  icon: any;
  value: number;
  onChange: (val: number) => void;
  colorTheme: {
    text: string;
    bg: string;
    border: string;
    barActive: string;
    barInactive: string;
  };
  levelsText: string[];
}

function MetricGauge({ label, icon: Icon, value, onChange, colorTheme, levelsText }: MetricGaugeProps) {
  return (
    <div className="bg-stone-50/90 p-3.5 rounded-2xl border border-stone-200/80 shadow-2xs">
      <div className="flex justify-between items-center text-xs font-bold text-stone-800 mb-2">
        <span className={`flex items-center gap-1.5 ${colorTheme.text}`}>
          <Icon className="w-4 h-4" /> {label}
        </span>
        <span className={`text-[11px] font-mono font-black px-2 py-0.5 rounded-md ${colorTheme.bg} ${colorTheme.text} border ${colorTheme.border}`}>
          Lv.{value} ({levelsText[value - 1]})
        </span>
      </div>

      {/* 5-Step Visual Energy Bar Meter */}
      <div className="grid grid-cols-5 gap-1.5 h-6">
        {[1, 2, 3, 4, 5].map((lvl) => {
          const isActive = lvl <= value;
          return (
            <button
              key={lvl}
              type="button"
              onClick={() => onChange(lvl)}
              className={`rounded-lg transition-all duration-200 flex items-center justify-center font-mono font-bold text-[10px] select-none ${
                isActive 
                  ? `${colorTheme.barActive} text-white shadow-xs scale-100` 
                  : `${colorTheme.barInactive} text-stone-400 hover:bg-stone-200/70`
              }`}
            >
              {lvl}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function DailyCheckInModalComponent({ isOpen, onClose, onCheckInComplete }: DailyCheckInModalProps) {
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

    const settings = storage.getSettings();
    settings.currentHp = calculatedHp;
    settings.currentMp = calculatedMp;
    settings.lastCheckInDate = todayStr;
    storage.saveSettings(settings);

    storage.addStoryLog({
      id: `log_${Date.now()}`,
      date: Date.now(),
      type: "journal_insight",
      title: "朝のチェックイン完了",
      description: `本日のコンディション: HP ${calculatedHp} / MP ${calculatedMp} で冒険を開始しました。`
    });

    onCheckInComplete();
    onClose();
  };

  const statusLabels = ["不調 20%", "やや不足 40%", "普通 60%", "良好 80%", "万全 100%"];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-sm mx-auto rounded-3xl p-5 bg-white/95 backdrop-blur-xl border border-stone-100 shadow-2xl">
        <DialogHeader className="mb-2 text-center">
          <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200/80 mx-auto flex items-center justify-center mb-1.5 shadow-2xs">
            <Sun className="w-5 h-5 animate-spin-slow" />
          </div>
          <DialogTitle className="text-lg font-black text-stone-800">
            朝のチェックイン（ステータス調整）
          </DialogTitle>
          <DialogDescription className="text-xs font-medium text-stone-500">
            各メーターをタップして、本日のエネルギー量を設定してください。
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2.5 py-1">
          {/* Sleep */}
          <MetricGauge
            label="睡眠の質"
            icon={Moon}
            value={sleep}
            onChange={setSleep}
            levelsText={statusLabels}
            colorTheme={{
              text: "text-indigo-700",
              bg: "bg-indigo-50",
              border: "border-indigo-200",
              barActive: "bg-gradient-to-r from-indigo-500 to-indigo-600",
              barInactive: "bg-stone-100 border border-stone-200/50"
            }}
          />

          {/* Energy */}
          <MetricGauge
            label="活力・エネルギー"
            icon={BatteryCharging}
            value={energy}
            onChange={setEnergy}
            levelsText={statusLabels}
            colorTheme={{
              text: "text-amber-800",
              bg: "bg-amber-50",
              border: "border-amber-200",
              barActive: "bg-gradient-to-r from-amber-500 to-amber-600",
              barInactive: "bg-stone-100 border border-stone-200/50"
            }}
          />

          {/* Mood */}
          <MetricGauge
            label="気分・モチベーション"
            icon={Smile}
            value={mood}
            onChange={setMood}
            levelsText={statusLabels}
            colorTheme={{
              text: "text-emerald-800",
              bg: "bg-emerald-50",
              border: "border-emerald-200",
              barActive: "bg-gradient-to-r from-emerald-500 to-emerald-600",
              barInactive: "bg-stone-100 border border-stone-200/50"
            }}
          />

          {/* Physical Condition */}
          <MetricGauge
            label="身体の調子・軽さ"
            icon={Heart}
            value={physical}
            onChange={setPhysical}
            levelsText={statusLabels}
            colorTheme={{
              text: "text-rose-800",
              bg: "bg-rose-50",
              border: "border-rose-200",
              barActive: "bg-gradient-to-r from-rose-500 to-rose-600",
              barInactive: "bg-stone-100 border border-stone-200/50"
            }}
          />

          {/* Recovery Preview */}
          <div className="bg-stone-900 text-white p-3 rounded-2xl border border-white/10 flex items-center justify-around mt-3 shadow-inner">
            <div className="text-center">
              <span className="text-[10px] font-bold text-stone-400 block mb-0.5">本日のHP (体力)</span>
              <span className="text-sm font-black text-rose-400 flex items-center justify-center gap-1">
                <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" /> {calculatedHp} / 100
              </span>
            </div>
            <div className="h-6 w-px bg-stone-700" />
            <div className="text-center">
              <span className="text-[10px] font-bold text-stone-400 block mb-0.5">本日のMP (気力)</span>
              <span className="text-sm font-black text-indigo-400 flex items-center justify-center gap-1">
                <Zap className="w-3.5 h-3.5 fill-indigo-500 text-indigo-500" /> {calculatedMp} / 10
              </span>
            </div>
          </div>
        </div>

        <Button
          onClick={handleSave}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl py-5 font-bold text-sm shadow-lg shadow-emerald-600/20 mt-2"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          体調を記録して冒険を開始する
        </Button>
      </DialogContent>
    </Dialog>
  );
}

export { DailyCheckInModalComponent as DailyCheckInModal };
