"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { storage } from "@/services/storage";
import { MainStory, Quest, QuestChapter, Milestone, FutureVision } from "@/types";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  Map as MapIcon, 
  GitBranch, 
  Plus, 
  Sparkles, 
  CheckCircle2, 
  Circle, 
  Compass, 
  Flag
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

export default function StoryPage() {
  const router = useRouter();
  const [isLoaded, setIsLoaded] = useState(false);
  const [mainStory, setMainStory] = useState<MainStory | null>(null);
  const [pastStories, setPastStories] = useState<MainStory[]>([]);
  const [futureVision, setFutureVision] = useState<FutureVision | null>(null);
  const [chapters, setChapters] = useState<QuestChapter[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [quests, setQuests] = useState<Quest[]>([]);
  
  const [isPivotDialogOpen, setIsPivotDialogOpen] = useState(false);
  const [pivotReason, setPivotReason] = useState("");

  const loadData = () => {
    const stories = storage.getStories();
    const active = stories.find(s => s.status === "active") || null;
    setMainStory(active);
    setPastStories(stories.filter(s => s.status !== "active"));
    setFutureVision(storage.getFutureVision());

    if (active) {
      const allChapters = storage.getChapters().filter(c => c.storyId === active.id);
      setChapters(allChapters);
      setMilestones(storage.getMilestones());
      setQuests(storage.getQuests().filter(q => q.storyId === active.id));
    }
  };

  useEffect(() => {
    loadData();
    setIsLoaded(true);
  }, []);

  const handlePivot = () => {
    if (!mainStory || !pivotReason.trim()) return;

    const stories = storage.getStories();
    const updatedStories = stories.map(s => 
      s.id === mainStory.id 
        ? { ...s, status: "pivoted" as const, pivotReason: pivotReason, endedAt: Date.now(), updatedAt: Date.now() } 
        : s
    );
    storage.saveStories(updatedStories);

    storage.addStoryLog({
      id: `log_${Date.now()}`,
      date: Date.now(),
      type: "story_pivoted",
      title: `方針転換（ピボット）: ${mainStory.title}`,
      description: `理由: ${pivotReason}`,
      storyId: mainStory.id,
      metadata: { reason: pivotReason }
    });

    setIsPivotDialogOpen(false);
    setPivotReason("");
    loadData();
  };

  if (!isLoaded) {
    return <div className="p-6 text-stone-500 font-bold">物語の地図を読み込んでいます...</div>;
  }

  if (!mainStory) {
    return (
      <main className="flex flex-col min-h-screen p-6 mx-auto max-w-md pt-16 text-center">
        <div className="w-16 h-16 rounded-3xl bg-amber-50 text-amber-600 border border-amber-200 mx-auto flex items-center justify-center mb-4 shadow-sm">
          <Compass className="w-8 h-8" />
        </div>
        <h1 className="text-xl font-black text-stone-800 mb-2">アクティブな物語がありません</h1>
        <p className="text-xs font-medium text-stone-500 leading-relaxed max-w-xs mx-auto mb-6">
          コンパス（自己探索）で価値観を見つけるか、サンプルストーリーを開始して冒険を始めましょう。
        </p>
        <div className="flex flex-col gap-3 max-w-xs mx-auto w-full">
          <Button 
            onClick={() => {
              storage.loadSamplePreset();
              loadData();
            }}
            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl py-6 font-bold text-sm shadow-md"
          >
            サンプルストーリーで始める
          </Button>
          <Button 
            onClick={() => router.push("/profile")}
            variant="outline"
            className="border-stone-300 text-stone-700 rounded-2xl py-6 font-bold text-sm"
          >
            自己探索ガイドへ進む
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-col min-h-screen p-4 pb-28 mx-auto max-w-md">
      {/* Header & Story Info */}
      <header className="mb-6 pt-2">
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-1.5">
            <MapIcon className="w-4 h-4 text-emerald-600" />
            <h1 className="text-[11px] font-black text-emerald-800 uppercase tracking-widest">
              物語の航海図（ストーリーマップ）
            </h1>
          </div>
          <button 
            onClick={() => setIsPivotDialogOpen(true)}
            className="flex items-center gap-1 text-[11px] font-bold text-stone-500 bg-white border border-stone-200 px-2.5 py-1 rounded-full hover:bg-stone-50 transition-colors shadow-sm"
          >
            <GitBranch className="w-3.5 h-3.5 text-purple-600" />
            方針転換（ピボット）
          </button>
        </div>

        {/* Story Card */}
        <div className="glass-panel p-5 rounded-3xl border border-stone-200 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start mb-2">
            <h2 className="text-lg font-black text-stone-800 leading-snug">
              {mainStory.title}
            </h2>
          </div>
          <p className="text-xs font-medium text-stone-600 leading-relaxed mb-4">
            {mainStory.description}
          </p>

          {/* Progress */}
          <div className="bg-stone-50/80 p-3 rounded-2xl border border-stone-100">
            <div className="flex justify-between text-xs font-bold text-stone-600 mb-1.5">
              <span>チャプター達成度</span>
              <span className="font-mono text-emerald-700 font-black">{mainStory.progress}%</span>
            </div>
            <Progress value={mainStory.progress} className="h-2 bg-stone-200/60 *:bg-emerald-600" />
          </div>
        </div>
      </header>

      {/* Future Vision Quote */}
      {futureVision && (
        <section className="mb-6">
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/70 shadow-sm">
            <div className="flex items-center gap-1.5 text-[10px] font-black text-amber-800 uppercase tracking-widest mb-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              目指している未来の情景
            </div>
            <p className="text-xs font-bold text-amber-950 leading-relaxed italic">
              “{futureVision.content}”
            </p>
          </div>
        </section>
      )}

      {/* Chapter & Milestone Interactive Roadmap */}
      <section className="mb-8">
        <div className="flex justify-between items-center mb-4 px-1">
          <h3 className="text-[11px] font-black text-stone-500 uppercase tracking-widest flex items-center gap-1.5">
            <Flag className="w-3.5 h-3.5 text-indigo-600" />
            チャプター & マイルストーン
          </h3>
          <button 
            onClick={() => router.push("/quest-builder")}
            className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/60"
          >
            <Plus className="w-3 h-3" /> クエスト追加
          </button>
        </div>

        {chapters.length === 0 ? (
          <div className="p-6 rounded-3xl bg-white border border-stone-200 text-center">
            <p className="text-xs font-bold text-stone-600 mb-3">
              まだチャプター構造がありません。クエスト作成工房でクエストラインを生成しましょう。
            </p>
            <Button 
              onClick={() => router.push("/quest-builder")}
              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold py-2.5"
            >
              クエスト作成工房を開く
            </Button>
          </div>
        ) : (
          <div className="space-y-4 relative before:absolute before:inset-0 before:left-4 before:w-0.5 before:bg-gradient-to-b before:from-emerald-400 before:via-teal-300 before:to-stone-200">
            {chapters.map((chapter, chIdx) => {
              const chapterMilestones = milestones.filter(m => m.chapterId === chapter.id);

              return (
                <div key={chapter.id} className="relative pl-9">
                  {/* Chapter Node Pin */}
                  <div className="absolute left-1 top-1 w-6 h-6 rounded-full bg-emerald-600 text-white border-2 border-white shadow-md flex items-center justify-center text-[10px] font-black">
                    {chIdx + 1}
                  </div>

                  {/* Chapter Card */}
                  <div className="glass-panel p-4 rounded-2xl border border-stone-200/90 shadow-sm mb-3">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-black text-xs text-emerald-900">
                        {chapter.title}
                      </h4>
                      <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        第 {chIdx + 1} 章
                      </span>
                    </div>

                    {/* Milestones inside Chapter */}
                    {chapterMilestones.length > 0 && (
                      <div className="space-y-2 mt-3 pt-2 border-t border-stone-100">
                        {chapterMilestones.map((ms) => {
                          const msQuests = quests.filter(q => q.milestoneId === ms.id);
                          const completedCount = msQuests.filter(q => q.status === "completed").length;

                          return (
                            <div key={ms.id} className="bg-stone-50 p-2.5 rounded-xl border border-stone-200/60">
                              <div className="flex justify-between items-center text-[11px] font-bold text-stone-800 mb-1">
                                <span>{ms.title}</span>
                                <span className="font-mono text-[10px] text-stone-500">
                                  {completedCount} / {msQuests.length} 完了
                                </span>
                              </div>

                              {/* Quest pills */}
                              <div className="flex flex-wrap gap-1.5 mt-2">
                                {msQuests.map((q) => (
                                  <span 
                                    key={q.id}
                                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 ${
                                      q.status === "completed" 
                                        ? "bg-emerald-100 text-emerald-800 line-through opacity-70" 
                                        : "bg-white text-stone-700 border border-stone-200 shadow-2xs"
                                    }`}
                                  >
                                    {q.status === "completed" ? (
                                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                    ) : (
                                      <Circle className="w-3 h-3 text-stone-400" />
                                    )}
                                    {q.title}
                                  </span>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Pivot / Direction Change Dialog */}
      <Dialog open={isPivotDialogOpen} onOpenChange={setIsPivotDialogOpen}>
        <DialogContent className="max-w-xs mx-auto rounded-3xl p-6 bg-white/95 backdrop-blur-xl border border-stone-100 shadow-2xl">
          <DialogHeader className="text-center">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 border border-purple-200 mx-auto flex items-center justify-center mb-2 shadow-sm">
              <GitBranch className="w-6 h-6" />
            </div>
            <DialogTitle className="text-lg font-black text-stone-800">
              方針転換（ピボット）しますか？
            </DialogTitle>
            <DialogDescription className="text-xs font-medium text-stone-500">
              目標が変わることは失敗ではありません。新しい冒険への進化です。理由を記録して次の物語へ進みましょう。
            </DialogDescription>
          </DialogHeader>

          <div className="py-2">
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              方針転換の理由
            </label>
            <Textarea 
              value={pivotReason}
              onChange={(e) => setPivotReason(e.target.value)}
              placeholder="例: 新たな価値観が見つかったため。別のプロダクトに注力するため。"
              className="text-xs min-h-[100px] resize-none rounded-2xl bg-stone-50"
            />
          </div>

          <DialogFooter className="flex flex-col gap-2 mt-2">
            <Button 
              onClick={handlePivot}
              disabled={!pivotReason.trim()}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-2xl py-5 font-bold text-xs shadow-md"
            >
              方針転換を記録して完了
            </Button>
            <Button 
              onClick={() => setIsPivotDialogOpen(false)}
              variant="ghost"
              className="w-full text-stone-500 text-xs font-bold"
            >
              キャンセル
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
