"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { storage } from "@/services/storage";
import { Pattern, Tension, Value } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, X, ArrowRight, ShieldQuestion, Heart, Sparkles, Target, Flame } from "lucide-react";

// Fallback translations for legacy English inputs
const TRANSLATION_MAP: Record<string, string> = {
  "Growth through improvement": "改善による自己成長",
  "Desire for effective self-control": "自律と自己決定の欲求",
  "Contribution through competence": "能力を通じた貢献と価値提供",
  "Growth & Optimization": "創造性とプロセスの最適化",
  "Autonomy & Freedom": "自律と自由な余白",
  "Family & Connection": "家族との豊かな時間",
  "Family and personal time": "家族の時間と個人の時間の調和",
  "Balanced personal time": "自分を回復・成長させる一人時間"
};

const translateText = (text?: string): string => {
  if (!text) return "";
  return TRANSLATION_MAP[text] || text;
};

export default function ReviewDiscoveryPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  
  // 選択状態の管理
  const [acceptedPatterns, setAcceptedPatterns] = useState<Set<number>>(new Set());
  const [acceptedValues, setAcceptedValues] = useState<Set<number>>(new Set());
  const [acceptedTensions, setAcceptedTensions] = useState<Set<number>>(new Set());

  useEffect(() => {
    const raw = localStorage.getItem("crestward_imported_analysis");
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        setData(parsed);
        
        // デフォルトで全て選択状態にする
        if (parsed.patterns) setAcceptedPatterns(new Set(parsed.patterns.map((_: any, i: number) => i)));
        if (parsed.values) setAcceptedValues(new Set(parsed.values.map((_: any, i: number) => i)));
        if (parsed.tensions) setAcceptedTensions(new Set(parsed.tensions.map((_: any, i: number) => i)));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  if (!data) {
    return <div className="p-6 text-stone-500 font-bold">分析データを読み込んでいます...</div>;
  }

  const handleConfirm = () => {
    const existingPatterns = storage.getPatterns();
    const existingValues = storage.getValues();
    const existingTensions = storage.getTensions();

    const newPatterns: Pattern[] = (data.patterns || [])
      .filter((_: any, i: number) => acceptedPatterns.has(i))
      .map((p: any) => ({
        id: `pat_${Date.now()}_${Math.random()}`,
        title: translateText(p.title),
        description: translateText(p.description),
        confidence: p.confidence,
        source: "ai-import",
        userResponse: "accepted"
      }));

    const newValues: Value[] = (data.values || [])
      .filter((_: any, i: number) => acceptedValues.has(i))
      .map((v: any) => ({
        id: `val_${Date.now()}_${Math.random()}`,
        name: translateText(v.name),
        level: 4, // 初期レベル高めに設定
        createdAt: Date.now(),
        updatedAt: Date.now()
      }));

    const newTensions: Tension[] = (data.tensions || [])
      .filter((_: any, i: number) => acceptedTensions.has(i))
      .map((t: any) => ({
        id: `ten_${Date.now()}_${Math.random()}`,
        title: translateText(t.title),
        currentState: translateText(t.currentState),
        desiredState: translateText(t.desiredState),
        relatedValueIds: [],
        createdAt: Date.now()
      }));

    storage.savePatterns([...existingPatterns, ...newPatterns]);
    storage.saveValues([...existingValues, ...newValues]);
    storage.saveTensions([...existingTensions, ...newTensions]);

    // 次のStory Candidate選択画面へ
    router.push("/discovery/story-candidate");
  };

  const toggleSet = (setter: any, index: number) => {
    setter((prev: Set<number>) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  return (
    <div className="min-h-screen flex flex-col p-6 max-w-md mx-auto pt-6 pb-28">
      <header className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-5 h-5 text-emerald-600" />
          <h1 className="text-xl font-black text-stone-800 tracking-tight">
            この分析はしっくりきますか？
          </h1>
        </div>
        <p className="text-xs font-medium text-stone-500 leading-relaxed">
          AIがあなたの記録から抽出した「行動パターン」や「価値観の候補」です。自分にしっくりくるものだけを選んで残してください。
        </p>
      </header>

      {/* Patterns */}
      {data.patterns && data.patterns.length > 0 && (
        <section className="mb-6">
          <h2 className="text-[11px] font-black text-stone-500 uppercase tracking-widest mb-3 flex items-center gap-1.5 px-1">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> 
            抽出された行動パターン・傾向
          </h2>
          <div className="space-y-2.5">
            {data.patterns.map((p: any, i: number) => {
              const isSelected = acceptedPatterns.has(i);
              const title = translateText(p.title);
              const desc = translateText(p.description);

              return (
                <div 
                  key={`pat_${i}`} 
                  className={`cursor-pointer p-4 rounded-2xl border transition-all ${
                    isSelected 
                      ? 'bg-white border-emerald-500 shadow-sm ring-1 ring-emerald-500/50' 
                      : 'bg-stone-50/70 border-stone-200 opacity-50'
                  }`}
                  onClick={() => toggleSet(setAcceptedPatterns, i)}
                >
                  <div className="flex items-start gap-3">
                    <div className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center mt-0.5 transition-colors ${
                      isSelected ? 'bg-emerald-600 text-white' : 'bg-stone-200 text-stone-400'
                    }`}>
                      {isSelected ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                    </div>
                    <div>
                      <h3 className={`text-xs font-black mb-1 ${isSelected ? 'text-stone-800' : 'text-stone-500'}`}>
                        {title}
                      </h3>
                      <p className={`text-[11px] leading-relaxed ${isSelected ? 'text-stone-600' : 'text-stone-400'}`}>
                        {desc}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Values */}
      {data.values && data.values.length > 0 && (
        <section className="mb-6">
          <h2 className="text-[11px] font-black text-stone-500 uppercase tracking-widest mb-3 flex items-center gap-1.5 px-1">
            <Heart className="w-3.5 h-3.5 text-rose-500" /> 
            大切にしたい価値観（Values）の候補
          </h2>
          <div className="space-y-2.5">
            {data.values.map((v: any, i: number) => {
              const isSelected = acceptedValues.has(i);
              const name = translateText(v.name);
              const desc = translateText(v.description);

              return (
                <div 
                  key={`val_${i}`} 
                  className={`cursor-pointer p-4 rounded-2xl border transition-all ${
                    isSelected 
                      ? 'bg-white border-rose-400 shadow-sm ring-1 ring-rose-400/50' 
                      : 'bg-stone-50/70 border-stone-200 opacity-50'
                  }`}
                  onClick={() => toggleSet(setAcceptedValues, i)}
                >
                  <div className="flex items-start gap-3">
                    <div className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center mt-0.5 transition-colors ${
                      isSelected ? 'bg-rose-500 text-white' : 'bg-stone-200 text-stone-400'
                    }`}>
                      {isSelected ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                    </div>
                    <div>
                      <h3 className={`text-xs font-black mb-1 ${isSelected ? 'text-stone-800' : 'text-stone-500'}`}>
                        {name}
                      </h3>
                      {desc && (
                        <p className={`text-[11px] leading-relaxed ${isSelected ? 'text-stone-600' : 'text-stone-400'}`}>
                          {desc}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Tensions */}
      {data.tensions && data.tensions.length > 0 && (
        <section className="mb-6">
          <h2 className="text-[11px] font-black text-stone-500 uppercase tracking-widest mb-3 flex items-center gap-1.5 px-1">
            <Target className="w-3.5 h-3.5 text-indigo-600" /> 
            抱えているギャップ（現状 vs 理想）
          </h2>
          <div className="space-y-3">
            {data.tensions.map((t: any, i: number) => {
              const isSelected = acceptedTensions.has(i);
              const title = translateText(t.title);
              const cur = translateText(t.currentState);
              const des = translateText(t.desiredState);

              return (
                <div 
                  key={`ten_${i}`} 
                  className={`cursor-pointer p-4 rounded-2xl border transition-all ${
                    isSelected 
                      ? 'bg-white border-indigo-400 shadow-sm ring-1 ring-indigo-400/50' 
                      : 'bg-stone-50/70 border-stone-200 opacity-50'
                  }`}
                  onClick={() => toggleSet(setAcceptedTensions, i)}
                >
                  <div className="flex items-start gap-3">
                    <div className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center mt-0.5 transition-colors ${
                      isSelected ? 'bg-indigo-600 text-white' : 'bg-stone-200 text-stone-400'
                    }`}>
                      {isSelected ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                    </div>
                    <div className="flex-1">
                      <h3 className={`text-xs font-black mb-2 ${isSelected ? 'text-stone-800' : 'text-stone-500'}`}>
                        {title}
                      </h3>
                      <div className="space-y-2 text-[11px]">
                        <div className={`p-2.5 rounded-xl border ${isSelected ? 'bg-stone-50 border-stone-200/80 text-stone-700' : 'bg-stone-100/50 border-stone-100 text-stone-400'}`}>
                          <span className="block text-[9px] font-black text-stone-400 mb-0.5 uppercase">現在 (Current State)</span>
                          {cur}
                        </div>
                        <div className={`p-2.5 rounded-xl border ${isSelected ? 'bg-emerald-50 border-emerald-200/80 text-emerald-900' : 'bg-stone-100/50 border-stone-100 text-stone-400'}`}>
                          <span className="block text-[9px] font-black text-emerald-600 mb-0.5 uppercase">理想 (Desired State)</span>
                          {des}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <div className="mt-4">
        <Button 
          onClick={handleConfirm}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl py-6 text-sm font-bold shadow-lg shadow-emerald-600/25"
        >
          選択した価値観で物語を決定する <ArrowRight className="w-4 h-4 ml-1.5" />
        </Button>
      </div>
    </div>
  );
}
