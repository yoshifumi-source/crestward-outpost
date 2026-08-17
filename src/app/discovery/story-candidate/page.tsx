"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { storage } from "@/services/storage";
import { MainStory, FutureVision, Experiment } from "@/types";
import { Button } from "@/components/ui/button";
import { Check, Target, Pencil, Compass, FlaskConical } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { translateAnalysisJson, translateText } from "@/lib/translator";

export default function StoryCandidatePage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  
  const [selectedIndex, setSelectedIndex] = useState<number | null>(0);
  const [manualTitle, setManualTitle] = useState("");
  const [manualDescription, setManualDescription] = useState("");

  useEffect(() => {
    const raw = localStorage.getItem("crestward_imported_analysis");
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        const localized = translateAnalysisJson(parsed);
        setData(localized);
        if (localized.storyCandidates && localized.storyCandidates.length > 0) {
          setSelectedIndex(0);
        } else {
          setSelectedIndex(null);
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const handleConfirm = () => {
    let title = "";
    let description = "";

    if (selectedIndex !== null && data?.storyCandidates && data.storyCandidates[selectedIndex]) {
      title = translateText(data.storyCandidates[selectedIndex].title);
      description = translateText(data.storyCandidates[selectedIndex].description);
    } else {
      title = manualTitle;
      description = manualDescription;
    }

    if (!title.trim()) {
      alert("物語のタイトルを入力してください。");
      return;
    }

    // Create a new active story
    const stories = storage.getStories();
    
    // Set old active stories to dormant
    const updatedStories = stories.map(s => s.status === "active" ? { ...s, status: "dormant" as const } : s);

    const newStory: MainStory = {
      id: `story_${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      status: "active",
      progress: 0,
      startedAt: Date.now(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    storage.saveStories([...updatedStories, newStory]);

    // Save Future Vision if available
    if (selectedIndex !== null && data?.futureScenes && data.futureScenes.length > 0) {
      const scene = data.futureScenes[0];
      const vision: FutureVision = {
        id: `vis_${Date.now()}`,
        content: translateText(scene.description || scene.title),
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      storage.saveFutureVision(vision);
    }

    // Update settings
    const settings = storage.getSettings();
    settings.onboardingCompleted = true;
    storage.saveSettings(settings);

    storage.addStoryLog({
      id: `log_${Date.now()}`,
      date: Date.now(),
      type: "story_started",
      title: `新たな物語を開始: ${title}`,
      description: description
    });

    router.push("/");
  };

  const handleExperiment = () => {
    let title = "";
    let description = "";

    if (selectedIndex !== null && data?.storyCandidates && data.storyCandidates[selectedIndex]) {
      title = translateText(data.storyCandidates[selectedIndex].title);
      description = translateText(data.storyCandidates[selectedIndex].description);
    } else {
      title = manualTitle;
      description = manualDescription;
    }

    if (!title.trim()) {
      alert("実験のタイトルを入力してください。");
      return;
    }

    const newExperiment: Experiment = {
      id: `exp_${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      durationDays: 30,
      status: "active",
      startedAt: Date.now(),
      relatedValueIds: []
    };

    const experiments = storage.getExperiments();
    storage.saveExperiments([...experiments, newExperiment]);

    const settings = storage.getSettings();
    settings.onboardingCompleted = true;
    storage.saveSettings(settings);

    storage.addStoryLog({
      id: `log_${Date.now()}`,
      date: Date.now(),
      type: "experiment_started",
      title: `30日間の実験を開始: ${title}`,
      description: description
    });

    router.push("/");
  };

  const hasCandidates = data?.storyCandidates && data.storyCandidates.length > 0;

  return (
    <div className="min-h-screen flex flex-col p-6 max-w-md mx-auto pt-6 pb-28">
      <header className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Compass className="w-5 h-5 text-emerald-600" />
          <h1 className="text-xl font-black text-stone-800 tracking-tight">
            冒険の方向（メインストーリー）の決定
          </h1>
        </div>
        <p className="text-xs font-medium text-stone-500 leading-relaxed">
          ここまでの自己探索をもとに、次に進む方向（メインストーリー）を選択するか、まずは小さく30日間の実験として始めるかを選びます。
        </p>
      </header>

      {hasCandidates && (
        <section className="mb-6">
          <h2 className="text-[11px] font-black text-stone-500 uppercase tracking-widest mb-3 flex items-center gap-1.5 px-1">
            <Target className="w-3.5 h-3.5 text-emerald-600" /> 
            AIからのストーリー候補
          </h2>
          <div className="space-y-3">
            {data.storyCandidates.map((c: any, i: number) => {
              const isSelected = selectedIndex === i;
              const title = translateText(c.title);
              const desc = translateText(c.description);
              const unlocks = Array.isArray(c.realWorldUnlocks) ? c.realWorldUnlocks.map(translateText) : [];

              return (
                <div 
                  key={`cand_${i}`} 
                  className={`cursor-pointer p-4 rounded-2xl border transition-all ${
                    isSelected 
                      ? 'bg-emerald-50/80 border-emerald-500 shadow-md ring-2 ring-emerald-500/50' 
                      : 'bg-white border-stone-200 hover:border-emerald-300'
                  }`}
                  onClick={() => setSelectedIndex(i)}
                >
                  <div className="flex justify-between items-start mb-1.5">
                    <h3 className="text-sm font-black text-stone-800 leading-snug pr-2">
                      {title}
                    </h3>
                    {isSelected && (
                      <div className="text-emerald-600 bg-emerald-100 p-1 rounded-full shrink-0">
                        <Check className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                  <p className="text-xs font-medium text-stone-600 mb-3 leading-relaxed">
                    {desc}
                  </p>
                  
                  {unlocks.length > 0 && (
                    <div className="bg-white/80 p-3 rounded-xl border border-emerald-100">
                      <span className="block text-[10px] font-black text-emerald-700 mb-1 uppercase">
                        ✨ この冒険で実現すること
                      </span>
                      <ul className="text-[11px] text-stone-600 space-y-1 list-disc pl-4 font-medium">
                        {unlocks.map((u: string, j: number) => (
                          <li key={j}>{u}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Manual Input */}
      <section className="mb-6">
        <h2 className="text-[11px] font-black text-stone-500 uppercase tracking-widest mb-3 flex items-center gap-1.5 px-1">
          <Pencil className="w-3.5 h-3.5 text-stone-500" /> 
          自分で自由に書く場合
        </h2>
        <div 
          className={`cursor-pointer p-4 rounded-2xl border transition-all ${
            selectedIndex === null 
              ? 'bg-white border-stone-800 shadow-md ring-2 ring-stone-800' 
              : 'bg-stone-50/60 border-stone-200'
          }`}
          onClick={() => setSelectedIndex(null)}
        >
          <div className="space-y-3">
            <div>
              <label className="block text-[11px] font-bold text-stone-600 mb-1">
                ストーリーのタイトル
              </label>
              <Input 
                placeholder="例: 自律型プロダクトの開発と自由なライフスタイルの確立"
                className="text-xs rounded-xl"
                value={manualTitle}
                onChange={(e) => {
                  setManualTitle(e.target.value);
                  setSelectedIndex(null);
                }}
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-stone-600 mb-1">
                目的・目指したい姿
              </label>
              <Textarea 
                placeholder="例: 自身の強みを活かしたWebアプリケーションをリリースし、収益と自由な時間の両立を達成する。"
                className="text-xs rounded-xl min-h-[80px] resize-none"
                value={manualDescription}
                onChange={(e) => {
                  setManualDescription(e.target.value);
                  setSelectedIndex(null);
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Action Buttons */}
      <div className="mt-auto space-y-2.5">
        <Button 
          onClick={handleConfirm}
          disabled={selectedIndex === null && !manualTitle.trim()}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl py-6 text-sm font-bold shadow-lg shadow-emerald-600/25"
        >
          <Compass className="w-4 h-4 mr-2" />
          この物語で冒険を開始する
        </Button>
        <Button 
          onClick={handleExperiment}
          variant="outline"
          disabled={selectedIndex === null && !manualTitle.trim()}
          className="w-full border-teal-600 text-teal-700 hover:bg-teal-50 rounded-2xl py-6 text-xs font-bold shadow-2xs"
        >
          <FlaskConical className="w-4 h-4 mr-2 text-teal-600" />
          まずは小さく30日間の実験として試す
        </Button>
      </div>
    </div>
  );
}
