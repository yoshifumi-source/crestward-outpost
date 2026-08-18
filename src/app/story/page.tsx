"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { storage } from "@/services/storage";
import { MainStory, Quest, QuestChapter, Milestone, FutureVision } from "@/types";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Map as MapIcon, 
  GitBranch, 
  Plus, 
  Sparkles, 
  CheckCircle2, 
  Circle, 
  Compass, 
  Flag,
  Target,
  Edit3
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

const GOAL_IDEAS = [
  { title: "副業アプリを開発・リリースして年収100万円アップ", desc: "自作Webプロダクトをリリースし、収益と自由な時間の両立を目指す" },
  { title: "開発・設計の専門書（全213ページ）を読破する", desc: "日々の読書ページ数を記録し、知識とスキルを自分の武器にする" },
  { title: "月間走行距離300kmのランニング習慣をつける", desc: "実年齢マイナス20歳の体力とエネルギーを維持する" },
  { title: "毎朝30分の集中プログラミング時間を確立する", desc: "朝の時間を活用して新しいプロダクトやスキルに没頭する" }
];

export default function StoryPage() {
  const router = useRouter();
  const [isLoaded, setIsLoaded] = useState(false);
  const [allStories, setAllStories] = useState<MainStory[]>([]);
  const [mainStory, setMainStory] = useState<MainStory | null>(null);
  const [pastStories, setPastStories] = useState<MainStory[]>([]);
  const [futureVision, setFutureVision] = useState<FutureVision | null>(null);
  const [chapters, setChapters] = useState<QuestChapter[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [quests, setQuests] = useState<Quest[]>([]);
  
  const [isPivotDialogOpen, setIsPivotDialogOpen] = useState(false);
  const [pivotReason, setPivotReason] = useState("");

  const [isCreateStoryOpen, setIsCreateStoryOpen] = useState(false);
  const [newStoryTitle, setNewStoryTitle] = useState("");
  const [newStoryDesc, setNewStoryDesc] = useState("");

  const loadData = () => {
    const stories = storage.getStories();
    setAllStories(stories);
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

  const handleCreateNewStory = () => {
    if (!newStoryTitle.trim()) return;

    const stories = storage.getStories();
    const updatedStories = stories.map(s => s.status === "active" ? { ...s, status: "dormant" as const } : s);

    const createdStory: MainStory = {
      id: `story_${Date.now()}`,
      title: newStoryTitle.trim(),
      description: newStoryDesc.trim() || "自己成長と目標の実現を目指す",
      status: "active",
      progress: 0,
      startedAt: Date.now(),
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    storage.saveStories([createdStory, ...updatedStories]);

    const settings = storage.getSettings();
    settings.onboardingCompleted = true;
    storage.saveSettings(settings);

    storage.addStoryLog({
      id: `log_${Date.now()}`,
      date: Date.now(),
      type: "story_started",
      title: `新しい目標（メインクエスト）を設定: ${createdStory.title}`,
      description: createdStory.description,
      storyId: createdStory.id
    });

    setIsCreateStoryOpen(false);
    setNewStoryTitle("");
    setNewStoryDesc("");
    loadData();
  };

  const handleSelectStory = (storyId: string) => {
    const stories = storage.getStories();
    const updated = stories.map(s => ({
      ...s,
      status: s.id === storyId ? ("active" as const) : s.status === "active" ? ("dormant" as const) : s.status
    }));
    storage.saveStories(updated);
    loadData();
  };

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
        <h1 className="text-xl font-black text-stone-800 mb-2">アクティブな物語（目標）がありません</h1>
        <p className="text-xs font-medium text-stone-500 leading-relaxed max-w-xs mx-auto mb-6">
          自分で新しい目標（メインクエスト）を設定するか、サンプルストーリーを開始して冒険を始めましょう。
        </p>
        <div className="flex flex-col gap-3 max-w-xs mx-auto w-full">
          <Button 
            onClick={() => setIsCreateStoryOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl py-6 font-bold text-sm shadow-md"
          >
            <Plus className="w-4 h-4 mr-1.5" /> 自分で目標（メインクエスト）を作成
          </Button>
          <Button 
            onClick={() => {
              storage.loadSamplePreset();
              loadData();
            }}
            variant="outline"
            className="border-stone-300 text-stone-700 rounded-2xl py-6 font-bold text-sm"
          >
            サンプルストーリーで始める
          </Button>
        </div>

        {/* Dialog to create story */}
        <Dialog open={isCreateStoryOpen} onOpenChange={setIsCreateStoryOpen}>
          <DialogContent className="max-w-xs mx-auto rounded-3xl p-6 bg-white/95 backdrop-blur-xl border border-stone-100 shadow-2xl">
            <DialogHeader className="text-center">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 mx-auto flex items-center justify-center mb-2 shadow-sm">
                <Target className="w-6 h-6" />
              </div>
              <DialogTitle className="text-lg font-black text-stone-800">
                目標（メインクエスト）を作成
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-3 py-2 text-left">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">目標タイトル</label>
                <Input
                  value={newStoryTitle}
                  onChange={(e) => setNewStoryTitle(e.target.value)}
                  placeholder="例: 副業で年収100万円アップ"
                  className="text-xs rounded-xl font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">理由・目指す情景</label>
                <Textarea
                  value={newStoryDesc}
                  onChange={(e) => setNewStoryDesc(e.target.value)}
                  placeholder="例: 経済的自立と自由な時間の獲得"
                  className="text-xs min-h-[60px] resize-none rounded-xl"
                />
              </div>
            </div>

            <DialogFooter className="flex flex-col gap-2 mt-2">
              <Button
                onClick={handleCreateNewStory}
                disabled={!newStoryTitle.trim()}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl py-5 font-bold text-xs shadow-md"
              >
                この目標を設定する
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
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
          <div className="flex items-center gap-1.5">
            <button 
              onClick={() => setIsCreateStoryOpen(true)}
              className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 rounded-full hover:bg-emerald-100 transition-colors shadow-2xs"
            >
              <Plus className="w-3 h-3" /> 目標追加
            </button>
            <button 
              onClick={() => setIsPivotDialogOpen(true)}
              className="flex items-center gap-1 text-[11px] font-bold text-stone-500 bg-white border border-stone-200 px-2.5 py-1 rounded-full hover:bg-stone-50 transition-colors shadow-sm"
            >
              <GitBranch className="w-3.5 h-3.5 text-purple-600" />
              方針転換
            </button>
          </div>
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

          {/* Other stories switcher */}
          {allStories.length > 1 && (
            <div className="mt-3 pt-2.5 border-t border-stone-100 flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] font-bold text-stone-400">他の目標に切替:</span>
              {allStories.filter(s => s.id !== mainStory.id).map(s => (
                <button
                  key={s.id}
                  onClick={() => handleSelectStory(s.id)}
                  className="text-[10px] font-bold text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 px-2 py-0.5 rounded-md"
                >
                  {s.title}
                </button>
              ))}
            </div>
          )}
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
                                {msQuests.map((q) => {
                                  const metric = q.metric;
                                  return (
                                    <span 
                                      key={q.id}
                                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 ${
                                        q.status === "completed" 
                                          ? "bg-emerald-100 text-emerald-800 line-through opacity-70" 
                                          : "bg-white text-stone-700 border border-stone-200 shadow-2xs"
                                      }`}
                                    >
                                      {q.status === "completed" ? (
                                        <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                                      ) : (
                                        <Circle className="w-3 h-3 text-stone-400 shrink-0" />
                                      )}
                                      <span>{q.title}</span>
                                      {metric && (
                                        <span className="font-mono text-[9px] text-emerald-700 font-bold bg-emerald-50 px-1 rounded border border-emerald-200/60 ml-0.5">
                                          {metric.currentValue}/{metric.targetValue} {metric.unit}
                                        </span>
                                      )}
                                    </span>
                                  );
                                })}
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

      {/* Modal to Create New Story / Goal */}
      <Dialog open={isCreateStoryOpen} onOpenChange={setIsCreateStoryOpen}>
        <DialogContent className="max-w-xs mx-auto rounded-3xl p-6 bg-white/95 backdrop-blur-xl border border-stone-100 shadow-2xl">
          <DialogHeader className="text-center">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 mx-auto flex items-center justify-center mb-2 shadow-sm">
              <Target className="w-6 h-6" />
            </div>
            <DialogTitle className="text-lg font-black text-stone-800">
              目標（メインクエスト）を作成
            </DialogTitle>
            <DialogDescription className="text-xs font-medium text-stone-500">
              あなたが達成したい目標や大きな物語を設定します。
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 max-h-[60vh] overflow-y-auto pr-1 text-left">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                目標タイトル
              </label>
              <Input
                value={newStoryTitle}
                onChange={(e) => setNewStoryTitle(e.target.value)}
                placeholder="例: 副業で年収100万円アップ、専門書を読破"
                className="text-xs rounded-xl font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                理由・目指す情景 (任意)
              </label>
              <Textarea
                value={newStoryDesc}
                onChange={(e) => setNewStoryDesc(e.target.value)}
                placeholder="例: 経済的な自由と自信を手に入れ、自分の時間で生きる。"
                className="text-xs min-h-[60px] resize-none rounded-xl"
              />
            </div>

            {/* Quick Goal Idea Chips */}
            <div>
              <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1.5">
                💡 目標のアイデア例（タップで入力）
              </label>
              <div className="space-y-1.5">
                {GOAL_IDEAS.map((idea, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      setNewStoryTitle(idea.title);
                      setNewStoryDesc(idea.desc);
                    }}
                    className="p-2.5 rounded-xl bg-stone-50 hover:bg-emerald-50/80 border border-stone-200/70 hover:border-emerald-300 cursor-pointer text-left transition-all"
                  >
                    <span className="text-xs font-bold text-stone-800 block">{idea.title}</span>
                    <span className="text-[10px] text-stone-500 line-clamp-1">{idea.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="flex flex-col gap-2 mt-2">
            <Button
              onClick={handleCreateNewStory}
              disabled={!newStoryTitle.trim()}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl py-5 font-bold text-xs shadow-md"
            >
              この目標を設定する
            </Button>
            <Button
              onClick={() => setIsCreateStoryOpen(false)}
              variant="ghost"
              className="w-full text-stone-400 hover:text-stone-700 text-xs font-bold"
            >
              キャンセル
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
