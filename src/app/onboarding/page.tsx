"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Frown, Sparkles, Target, Compass, ArrowRight, Play, RefreshCw } from "lucide-react";
import Link from "next/link";
import { storage } from "@/services/storage";
import { useRouter } from "next/navigation";

export default function OnboardingPage() {
  const router = useRouter();

  const handleStartWithDemo = () => {
    storage.loadSamplePreset();
    router.push("/");
  };

  const handleQuickStart = () => {
    router.push("/discovery/story-candidate");
  };

  return (
    <div className="min-h-screen flex flex-col p-6 max-w-md mx-auto pt-10 pb-20">
      {/* Brand Header */}
      <header className="mb-8 text-center">
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-emerald-600 to-teal-400 p-0.5 shadow-xl mx-auto mb-4 animate-float">
          <div className="w-full h-full bg-stone-900 rounded-[22px] flex items-center justify-center">
            <Compass className="w-8 h-8 text-emerald-400" />
          </div>
        </div>
        <h1 className="text-3xl font-black text-stone-800 tracking-tight mb-2">
          Crestward
        </h1>
        <p className="text-xs font-bold text-stone-500 max-w-xs mx-auto leading-relaxed">
          人生をオープンワールドRPGにする、自己探索と航海（ナビゲーション）の道具。
        </p>
      </header>

      {/* Primary Hero Choice: Instant Demo */}
      <div className="mb-6">
        <button
          onClick={handleStartWithDemo}
          className="w-full p-4 rounded-3xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg shadow-emerald-600/25 border border-emerald-400/40 text-left transition-all active:scale-[0.98] group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
                <Play className="w-5 h-5 text-white fill-white" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-200 block mb-0.5">
                  おすすめ / 最短1秒で開始
                </span>
                <h3 className="text-sm font-black text-white">サンプル冒険者データで始める</h3>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-emerald-200 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>
      </div>

      {/* Secondary: Guided Discovery */}
      <div className="mb-4">
        <h2 className="text-[11px] font-black text-stone-400 uppercase tracking-widest px-1 mb-3 text-center">
          または、AIと一緒に価値観を見つける
        </h2>

        <div className="space-y-3">
          {/* A. Journal */}
          <Link href="/discovery/journal" className="block">
            <Card className="glass-panel border border-stone-200/90 shadow-2xs hover:shadow-md transition-all hover:border-emerald-300 cursor-pointer active:scale-98 group rounded-2xl">
              <CardContent className="p-4 flex items-start gap-3">
                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl group-hover:scale-105 transition-transform shrink-0">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-xs text-stone-800 mb-0.5">普段書いている日記・メモから探す</h3>
                  <p className="text-[11px] text-stone-500 leading-relaxed">
                    日記の文章から、無意識に現れる価値観や情熱をAIが抽出します。
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* B. Frustration */}
          <Link href="/discovery/frustration" className="block">
            <Card className="glass-panel border border-stone-200/90 shadow-2xs hover:shadow-md transition-all hover:border-rose-300 cursor-pointer active:scale-98 group rounded-2xl">
              <CardContent className="p-4 flex items-start gap-3">
                <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl group-hover:scale-105 transition-transform shrink-0">
                  <Frown className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-xs text-stone-800 mb-0.5">変えたい不満や違和感から探す</h3>
                  <p className="text-[11px] text-stone-500 leading-relaxed">
                    「こうだったらいいのに」というギャップから、本当の理想を発見します。
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* C. Aspiration */}
          <Link href="/discovery/aspiration" className="block">
            <Card className="glass-panel border border-stone-200/90 shadow-2xs hover:shadow-md transition-all hover:border-amber-300 cursor-pointer active:scale-98 group rounded-2xl">
              <CardContent className="p-4 flex items-start gap-3">
                <div className="p-2.5 bg-amber-50 text-amber-500 rounded-xl group-hover:scale-105 transition-transform shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-xs text-stone-800 mb-0.5">なりたい未来・憧れから探す</h3>
                  <p className="text-[11px] text-stone-500 leading-relaxed">
                    羨ましい人や理想の生活から、目指したい未来の情景を言語化します。
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>

      {/* Footer: Skip AI */}
      <div className="mt-auto pt-6 text-center">
        <button 
          onClick={handleQuickStart}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-400 hover:text-stone-700 transition-colors py-2 px-4 rounded-full"
        >
          <Target className="w-3.5 h-3.5" />
          すでにやりたい目標が決まっている場合 (手動作成)
        </button>
      </div>
    </div>
  );
}
