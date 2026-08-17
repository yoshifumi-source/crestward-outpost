"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { storage } from "@/services/storage";
import { UserSettings, Value, Skill, Tension, FutureScene, FutureVision } from "@/types";
import { 
  Compass, 
  Heart, 
  Sparkles, 
  Target, 
  Star, 
  ArrowRight, 
  User, 
  Award, 
  Coins, 
  Shield, 
  RefreshCw
} from "lucide-react";

export default function CompassPage() {
  const router = useRouter();
  const [isLoaded, setIsLoaded] = useState(false);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [values, setValues] = useState<Value[]>([]);
  const [tensions, setTensions] = useState<Tension[]>([]);
  const [futureScenes, setFutureScenes] = useState<FutureScene[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);

  const loadData = () => {
    setSettings(storage.getSettings());
    setValues(storage.getValues());
    setTensions(storage.getTensions());
    setFutureScenes(storage.getFutureScenes());
    setSkills(storage.getSkills());
    setIsLoaded(true);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleResetSample = () => {
    if (confirm("サンプル冒険者データを再読み込みしますか？現在のデータは更新されます。")) {
      storage.loadSamplePreset();
      loadData();
      alert("サンプル冒険者データを読み込みました！");
    }
  };

  if (!isLoaded || !settings) {
    return <div className="p-6 text-stone-500 font-bold">コンパスを調整中...</div>;
  }

  return (
    <main className="flex flex-col min-h-screen p-4 pb-28 mx-auto max-w-md">
      {/* Header */}
      <header className="mb-6 pt-2">
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-emerald-600 animate-spin-slow" />
            <h1 className="text-[11px] font-black text-emerald-800 uppercase tracking-widest">
              自己の羅針盤（コンパス）
            </h1>
          </div>
          <button
            onClick={handleResetSample}
            className="flex items-center gap-1 text-[10px] font-bold text-stone-500 hover:text-stone-800 bg-white border border-stone-200 px-2.5 py-1 rounded-full shadow-2xs"
          >
            <RefreshCw className="w-3 h-3" /> サンプル読込
          </button>
        </div>

        {/* Adventurer Identity Card */}
        <div className="glass-panel p-5 rounded-3xl border border-stone-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 p-0.5 shadow-md flex items-center justify-center">
              <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
                <User className="w-7 h-7 text-emerald-600" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-stone-800 tracking-tight">{settings.name}</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-300/80 font-mono">
                  Lv. {settings.level}
                </span>
              </div>
              <p className="text-xs font-bold text-emerald-700 mt-0.5 flex items-center gap-1">
                <Award className="w-3.5 h-3.5" /> {settings.title}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-3 border-t border-stone-100 text-center">
            <div className="p-2 rounded-xl bg-stone-50 border border-stone-100">
              <span className="text-[10px] font-bold text-stone-400 block">所持ゴールド</span>
              <span className="text-sm font-black text-amber-600 font-mono flex items-center justify-center gap-1 mt-0.5">
                <Coins className="w-3.5 h-3.5 text-amber-500" /> {settings.gold} G
              </span>
            </div>
            <div className="p-2 rounded-xl bg-stone-50 border border-stone-100">
              <span className="text-[10px] font-bold text-stone-400 block">習得スキル数</span>
              <span className="text-sm font-black text-indigo-600 font-mono flex items-center justify-center gap-1 mt-0.5">
                <Shield className="w-3.5 h-3.5 text-indigo-500" /> {skills.length} スキル
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Guided Discovery Entry Banner */}
      <section className="mb-6">
        <div 
          onClick={() => router.push("/onboarding")}
          className="cursor-pointer p-4 rounded-3xl bg-gradient-to-r from-stone-900 to-stone-800 text-white shadow-lg hover:shadow-xl transition-all border border-stone-700 relative overflow-hidden group"
        >
          <div className="absolute right-0 top-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-xl group-hover:scale-110 transition-transform" />
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center">
                <Compass className="w-5 h-5 text-emerald-400 group-hover:rotate-45 transition-transform duration-500" />
              </div>
              <div>
                <h3 className="text-sm font-black text-stone-100">自己探索ガイド（AI分析）</h3>
                <p className="text-[11px] text-stone-400">AIと一緒に新しい価値観と物語を深掘りする</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-stone-400 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="mb-6">
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="text-[11px] font-black text-stone-500 uppercase tracking-widest flex items-center gap-1.5">
            <Heart className="w-3.5 h-3.5 text-rose-500" />
            大切にしたい価値観
          </h3>
        </div>

        {values.length === 0 ? (
          <div className="p-5 rounded-2xl bg-stone-100/60 text-center text-xs font-bold text-stone-500">
            まだ価値観が登録されていません。自己探索ガイドで抽出しましょう。
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2.5">
            {values.map((v) => (
              <div key={v.id} className="glass-panel p-3.5 rounded-2xl border border-stone-200 shadow-2xs flex items-center justify-between">
                <span className="text-xs font-black text-stone-800">{v.name}</span>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star 
                      key={i}
                      className={`w-3.5 h-3.5 ${i < v.level ? 'text-amber-400 fill-amber-400' : 'text-stone-200'}`}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Tensions (Gaps: Current vs Desired State) */}
      {tensions.length > 0 && (
        <section className="mb-6">
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="text-[11px] font-black text-stone-500 uppercase tracking-widest flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-indigo-600" />
              現状と理想のギャップ
            </h3>
          </div>
          <div className="space-y-3">
            {tensions.map((t) => (
              <div key={t.id} className="glass-panel p-4 rounded-2xl border border-stone-200 shadow-2xs">
                <h4 className="text-xs font-black text-stone-800 mb-2">{t.title}</h4>
                <div className="space-y-2 text-[11px]">
                  <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200/80 text-xs text-stone-700">
                    <span className="text-[9px] font-black text-stone-400 block uppercase mb-0.5">現在（現状の課題）</span>
                    {t.currentState}
                  </div>
                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200/80 text-xs text-emerald-900 font-medium">
                    <span className="text-[9px] font-black text-emerald-600 block uppercase mb-0.5">理想（目指す状態）</span>
                    {t.desiredState}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Future Scenes */}
      {futureScenes.length > 0 && (
        <section className="mb-6">
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="text-[11px] font-black text-stone-500 uppercase tracking-widest flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              目指す未来の情景
            </h3>
          </div>
          <div className="space-y-3">
            {futureScenes.map((f) => (
              <div key={f.id} className="glass-panel p-4 rounded-2xl border border-amber-200/80 bg-gradient-to-br from-white to-amber-50/30 shadow-2xs">
                <h4 className="text-xs font-black text-stone-800 mb-1">{f.title}</h4>
                <p className="text-[11px] font-medium text-stone-600 leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
