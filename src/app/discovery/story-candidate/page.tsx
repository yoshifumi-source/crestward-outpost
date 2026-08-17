"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { storage } from "@/services/storage";
import { MainStory, FutureVision, Experiment } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, Target, Pencil } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

export default function StoryCandidatePage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [manualTitle, setManualTitle] = useState("");
  const [manualDescription, setManualDescription] = useState("");

  useEffect(() => {
    const raw = localStorage.getItem("crestward_imported_analysis");
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        setData(parsed);
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const handleConfirm = () => {
    let title = "";
    let description = "";

    if (selectedIndex !== null && data?.storyCandidates) {
      title = data.storyCandidates[selectedIndex].title;
      description = data.storyCandidates[selectedIndex].description;
    } else {
      title = manualTitle;
      description = manualDescription;
    }

    if (!title.trim()) return;

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

    // Update settings
    const settings = storage.getSettings();
    settings.onboardingCompleted = true;
    storage.saveSettings(settings);

    // Save Future Vision if there is one
    if (selectedIndex !== null && data?.futureScenes && data.futureScenes.length > 0) {
      const scene = data.futureScenes[0]; // just take the first one for simplicity for now
      const vision: FutureVision = {
        id: `vis_${Date.now()}`,
        content: scene.description,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      storage.saveFutureVision(vision);
    }

    router.push("/");
  };

  const handleExperiment = () => {
    let title = "";
    let description = "";

    if (selectedIndex !== null && data?.storyCandidates) {
      title = data.storyCandidates[selectedIndex].title;
      description = data.storyCandidates[selectedIndex].description;
    } else {
      title = manualTitle;
      description = manualDescription;
    }

    if (!title.trim()) return;

    const newExperiment: Experiment = {
      id: `exp_${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      durationDays: 30, // デフォルト30日
      status: "active",
      startedAt: Date.now(),
      relatedValueIds: []
    };

    const experiments = storage.getExperiments();
    storage.saveExperiments([...experiments, newExperiment]);

    // Update settings
    const settings = storage.getSettings();
    settings.onboardingCompleted = true;
    storage.saveSettings(settings);

    router.push("/");
  };

  const hasCandidates = data?.storyCandidates && data.storyCandidates.length > 0;

  return (
    <div className="min-h-screen flex flex-col p-6 max-w-md mx-auto pt-10 pb-24">
      <header className="mb-8">
        <h1 className="text-2xl font-black text-stone-800 tracking-tight mb-2">
          Choose Your Direction
        </h1>
        <p className="text-sm font-medium text-stone-500">
          ここまでの探索をもとに、次に進む方向（Main Story）を決定します。
        </p>
      </header>

      {hasCandidates && (
        <section className="mb-8">
          <h2 className="text-sm font-black text-stone-500 uppercase tracking-widest mb-4 flex items-center gap-2">
            <Target className="w-4 h-4" /> AIからの提案
          </h2>
          <div className="space-y-4">
            {data.storyCandidates.map((c: any, i: number) => {
              const isSelected = selectedIndex === i;
              return (
                <Card 
                  key={`cand_${i}`} 
                  className={`cursor-pointer transition-all ${isSelected ? 'bg-emerald-50 border-emerald-500 shadow-md ring-2 ring-emerald-500' : 'bg-white border-stone-200 hover:border-emerald-300'}`}
                  onClick={() => setSelectedIndex(i)}
                >
                  <CardContent className="p-5 relative">
                    {isSelected && (
                      <div className="absolute top-4 right-4 text-emerald-500 bg-emerald-100 p-1 rounded-full">
                        <Check className="w-4 h-4" />
                      </div>
                    )}
                    <h3 className="text-lg font-bold text-stone-800 mb-2 pr-8">{c.title}</h3>
                    <p className="text-sm text-stone-600 mb-4">{c.description}</p>
                    
                    {c.realWorldUnlocks && (
                      <div className="bg-white/60 p-3 rounded-xl">
                        <span className="block text-[10px] font-black text-emerald-600 mb-1 uppercase">実現すること</span>
                        <ul className="text-xs text-stone-600 space-y-1 list-disc pl-4">
                          {c.realWorldUnlocks.map((u: string, j: number) => (
                            <li key={j}>{u}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      )}

      <section className="mb-8">
        <h2 className="text-sm font-black text-stone-500 uppercase tracking-widest mb-4 flex items-center gap-2">
          <Pencil className="w-4 h-4" /> 自分で書く
        </h2>
        <Card 
          className={`cursor-pointer transition-all ${selectedIndex === null ? 'bg-white border-stone-800 shadow-md ring-2 ring-stone-800' : 'bg-stone-50 border-stone-200'}`}
          onClick={() => setSelectedIndex(null)}
        >
          <CardContent className="p-5">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-500 mb-1">タイトル</label>
                <input 
                  type="text" 
                  placeholder="例：自分を回復・成長させる一人時間を作る"
                  className="w-full text-sm p-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-800"
                  value={manualTitle}
                  onChange={(e) => {
                    setManualTitle(e.target.value);
                    setSelectedIndex(null);
                  }}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-500 mb-1">説明・目的</label>
                <Textarea 
                  placeholder="家族との関係を大切にしながら、自分自身のための時間も無理なく維持する。"
                  className="w-full text-sm p-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-800 min-h-[100px] resize-none"
                  value={manualDescription}
                  onChange={(e) => {
                    setManualDescription(e.target.value);
                    setSelectedIndex(null);
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <div className="mt-8 flex flex-col gap-3">
        <Button 
          onClick={handleConfirm}
          disabled={(selectedIndex === null && !manualTitle.trim())}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-full py-6 text-lg font-bold shadow-md shadow-emerald-600/20"
        >
          物語を始める (Create Story)
        </Button>
        <Button 
          onClick={handleExperiment}
          variant="outline"
          disabled={(selectedIndex === null && !manualTitle.trim())}
          className="w-full border-emerald-600 text-emerald-600 hover:bg-emerald-50 rounded-full py-6 text-lg font-bold shadow-sm"
        >
          まずは小さく実験してみる (Start Experiment)
        </Button>
      </div>
    </div>
  );
}
