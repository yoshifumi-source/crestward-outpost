"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { storage } from "@/services/storage";
import { Pattern, Tension, Value } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, X, ArrowRight, ShieldQuestion } from "lucide-react";

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
    return <div className="p-6 text-stone-500">データを読み込んでいます...</div>;
  }

  const handleConfirm = () => {
    // 承認されたデータを実際のStorageに保存
    const existingPatterns = storage.getPatterns();
    const existingValues = storage.getValues();
    const existingTensions = storage.getTensions();

    const newPatterns: Pattern[] = (data.patterns || [])
      .filter((_: any, i: number) => acceptedPatterns.has(i))
      .map((p: any) => ({
        id: `pat_${Date.now()}_${Math.random()}`,
        title: p.title,
        description: p.description,
        confidence: p.confidence,
        source: "ai-import",
        userResponse: "accepted"
      }));

    const newValues: Value[] = (data.values || [])
      .filter((_: any, i: number) => acceptedValues.has(i))
      .map((v: any) => ({
        id: `val_${Date.now()}_${Math.random()}`,
        name: v.name,
        level: 1, // 初期レベル
        createdAt: Date.now(),
        updatedAt: Date.now()
      }));

    const newTensions: Tension[] = (data.tensions || [])
      .filter((_: any, i: number) => acceptedTensions.has(i))
      .map((t: any) => ({
        id: `ten_${Date.now()}_${Math.random()}`,
        title: t.title,
        currentState: t.currentState,
        desiredState: t.desiredState,
        relatedValueIds: [], // 一旦空
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
    <div className="min-h-screen flex flex-col p-6 max-w-md mx-auto pt-10 pb-24">
      <header className="mb-8">
        <h1 className="text-2xl font-black text-stone-800 tracking-tight mb-2">
          Does this feel like you?
        </h1>
        <p className="text-sm font-medium text-stone-500">
          AIが抽出したパターンや価値観の候補です。自分にしっくりくるものだけを残してください。
        </p>
      </header>

      {/* Patterns */}
      {data.patterns && data.patterns.length > 0 && (
        <section className="mb-8">
          <h2 className="text-sm font-black text-stone-500 uppercase tracking-widest mb-4 flex items-center gap-2">
            <ShieldQuestion className="w-4 h-4" /> 抽出されたパターン
          </h2>
          <div className="space-y-3">
            {data.patterns.map((p: any, i: number) => {
              const isSelected = acceptedPatterns.has(i);
              return (
                <Card 
                  key={`pat_${i}`} 
                  className={`cursor-pointer transition-all ${isSelected ? 'bg-white border-emerald-500 shadow-md ring-1 ring-emerald-500' : 'bg-stone-50 border-stone-200 opacity-60'}`}
                  onClick={() => toggleSet(setAcceptedPatterns, i)}
                >
                  <CardContent className="p-4 flex items-start gap-3">
                    <div className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center mt-0.5 transition-colors ${isSelected ? 'bg-emerald-500 text-white' : 'bg-stone-200 text-stone-400'}`}>
                      {isSelected ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                    </div>
                    <div>
                      <h3 className={`font-bold mb-1 ${isSelected ? 'text-stone-800' : 'text-stone-500'}`}>{p.title}</h3>
                      <p className={`text-xs ${isSelected ? 'text-stone-600' : 'text-stone-400'}`}>{p.description}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      )}

      {/* Values */}
      {data.values && data.values.length > 0 && (
        <section className="mb-8">
          <h2 className="text-sm font-black text-stone-500 uppercase tracking-widest mb-4 flex items-center gap-2">
            <ShieldQuestion className="w-4 h-4" /> 価値観（Values）の候補
          </h2>
          <div className="space-y-3">
            {data.values.map((v: any, i: number) => {
              const isSelected = acceptedValues.has(i);
              return (
                <Card 
                  key={`val_${i}`} 
                  className={`cursor-pointer transition-all ${isSelected ? 'bg-white border-blue-500 shadow-md ring-1 ring-blue-500' : 'bg-stone-50 border-stone-200 opacity-60'}`}
                  onClick={() => toggleSet(setAcceptedValues, i)}
                >
                  <CardContent className="p-4 flex items-start gap-3">
                    <div className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center mt-0.5 transition-colors ${isSelected ? 'bg-blue-500 text-white' : 'bg-stone-200 text-stone-400'}`}>
                      {isSelected ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                    </div>
                    <div>
                      <h3 className={`font-bold mb-1 ${isSelected ? 'text-stone-800' : 'text-stone-500'}`}>{v.name}</h3>
                      {v.description && <p className={`text-xs ${isSelected ? 'text-stone-600' : 'text-stone-400'}`}>{v.description}</p>}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      )}

      {/* Tensions */}
      {data.tensions && data.tensions.length > 0 && (
        <section className="mb-8">
          <h2 className="text-sm font-black text-stone-500 uppercase tracking-widest mb-4 flex items-center gap-2">
            <ShieldQuestion className="w-4 h-4" /> 抱えているギャップ（Tension）
          </h2>
          <div className="space-y-3">
            {data.tensions.map((t: any, i: number) => {
              const isSelected = acceptedTensions.has(i);
              return (
                <Card 
                  key={`ten_${i}`} 
                  className={`cursor-pointer transition-all ${isSelected ? 'bg-white border-rose-400 shadow-md ring-1 ring-rose-400' : 'bg-stone-50 border-stone-200 opacity-60'}`}
                  onClick={() => toggleSet(setAcceptedTensions, i)}
                >
                  <CardContent className="p-4 flex items-start gap-3">
                    <div className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center mt-0.5 transition-colors ${isSelected ? 'bg-rose-500 text-white' : 'bg-stone-200 text-stone-400'}`}>
                      {isSelected ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-bold mb-3 ${isSelected ? 'text-stone-800' : 'text-stone-500'}`}>{t.title}</h3>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className={`p-2 rounded-lg ${isSelected ? 'bg-stone-100' : 'bg-stone-100/50'}`}>
                          <span className="block text-[10px] font-black text-stone-400 mb-1 uppercase">現在 (Current)</span>
                          <span className={isSelected ? 'text-stone-700' : 'text-stone-400'}>{t.currentState}</span>
                        </div>
                        <div className={`p-2 rounded-lg ${isSelected ? 'bg-emerald-50 text-emerald-900' : 'bg-stone-100/50'}`}>
                          <span className="block text-[10px] font-black text-emerald-600/70 mb-1 uppercase">理想 (Desired)</span>
                          <span className={isSelected ? 'text-emerald-800' : 'text-stone-400'}>{t.desiredState}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      )}

      <div className="mt-8 flex justify-end">
        <Button 
          onClick={handleConfirm}
          className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full px-8 py-6 text-base font-bold shadow-md shadow-emerald-600/20"
        >
          Confirm & Next <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
