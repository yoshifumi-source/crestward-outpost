"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { storage } from "@/services/storage";
import { MainStory, GoalProject, Quest, Milestone, FutureVision, QuestDifficulty, QuestMetric } from "@/types";
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
  Edit3, 
  Trash2, 
  BookOpen, 
  Layers, 
  ChevronRight, 
  ChevronDown, 
  TrendingUp,
  FolderPlus,
  FolderKanban,
  Zap,
  HelpCircle
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { MetricProgressModal } from "@/components/MetricProgressModal";
import { WhyExplanationModal } from "@/components/WhyExplanationModal";

const GOAL_IDEAS = [
  { title: "お金に不自由しない生活（副業で年収100万円アップ）", desc: "自作アプリや講演、物販など複数の収益トラックを確立する" },
  { title: "開発・設計の専門書（全213ページ）を読破する", desc: "日々の読書ページ数を記録し、知識とスキルを自分の武器にする" },
  { title: "月間走行距離300kmのランニング習慣をつける", desc: "実年齢マイナス20歳の体力とエネルギーを維持する" },
  { title: "毎朝30分の集中プログラミング時間を確立する", desc: "朝の時間を活用して新しいプロダクトやスキルに没頭する" }
];

const PROJECT_IDEAS = [
  { title: "📱 自作アプリの販売・リリースで稼ぐ", desc: "Web/スマホアプリを開発・公開し、ストック収益を作る" },
  { title: "🎤 職場外グループでの講演・出張で稼ぐ", desc: "専門知識や知見を活かして研修・セミナーを行う" },
  { title: "📦 物品販売で月1万円を安定して稼ぐ", desc: "不用品や厳選アイテムの販売でキャッシュを生み出す" },
  { title: "📝 技術ブログや教材コンテンツの有料配信", desc: "知見を記事やnoteにまとめて定期的に発信する" }
];

export default function StoryPage() {
  const router = useRouter();
  const [isLoaded, setIsLoaded] = useState(false);
  const [allStories, setAllStories] = useState<MainStory[]>([]);
  const [mainStory, setMainStory] = useState<MainStory | null>(null);
  const [futureVision, setFutureVision] = useState<FutureVision | null>(null);
  
  // Multi-tier hierarchy state
  const [projects, setProjects] = useState<GoalProject[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("all");
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [quests, setQuests] = useState<Quest[]>([]);
  
  // Pivot Dialog
  const [isPivotDialogOpen, setIsPivotDialogOpen] = useState(false);
  const [pivotReason, setPivotReason] = useState("");

  // Create Story Dialog
  const [isCreateStoryOpen, setIsCreateStoryOpen] = useState(false);
  const [newStoryTitle, setNewStoryTitle] = useState("");
  const [newStoryDesc, setNewStoryDesc] = useState("");

  // Add Project Dialog
  const [isAddProjectOpen, setIsAddProjectOpen] = useState(false);
  const [newProjectTitle, setNewProjectTitle] = useState("");
  const [newProjectDesc, setNewProjectDesc] = useState("");

  // Add Milestone Dialog
  const [isAddMilestoneOpen, setIsAddMilestoneOpen] = useState(false);
  const [targetProjectId, setTargetProjectId] = useState<string>("");
  const [newMilestoneTitle, setNewMilestoneTitle] = useState("");

  // Add Quest to Milestone Dialog
  const [isAddQuestOpen, setIsAddQuestOpen] = useState(false);
  const [targetMilestoneId, setTargetMilestoneId] = useState<string>("");
  const [targetProjectIdForQuest, setTargetProjectIdForQuest] = useState<string>("");
  const [newQuestTitle, setNewQuestTitle] = useState("");
  const [newQuestDesc, setNewQuestDesc] = useState("");
  const [newQuestDiff, setNewQuestDiff] = useState<QuestDifficulty>("easy");
  const [hasMetric, setHasMetric] = useState(false);
  const [metricTarget, setMetricTarget] = useState("");
  const [metricUnit, setMetricUnit] = useState("回");

  // Metric Progress & WHY Modals
  const [progressQuest, setProgressQuest] = useState<Quest | null>(null);
  const [whyQuest, setWhyQuest] = useState<Quest | null>(null);

  const loadData = () => {
    const stories = storage.getStories();
    setAllStories(stories);
    const active = stories.find(s => s.status === "active") || null;
    setMainStory(active);
    setFutureVision(storage.getFutureVision());

    if (active) {
      const allProjects = storage.getProjects().filter(p => p.storyId === active.id);
      setProjects(allProjects);
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
      title: `新しい大目標を設定: ${createdStory.title}`,
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

  const handleAddProject = () => {
    if (!mainStory || !newProjectTitle.trim()) return;

    const newProj: GoalProject = {
      id: `proj_${Date.now()}`,
      storyId: mainStory.id,
      title: newProjectTitle.trim(),
      description: newProjectDesc.trim() || undefined,
      order: projects.length,
      status: "active",
      progress: 0,
      createdAt: Date.now()
    };

    storage.addProject(newProj);
    setIsAddProjectOpen(false);
    setNewProjectTitle("");
    setNewProjectDesc("");
    loadData();
  };

  const handleDeleteProject = (projId: string) => {
    if (confirm("このプロジェクトを削除しますか？紐付くマイルストーンやクエストも削除されます。")) {
      storage.deleteProject(projId);
      loadData();
    }
  };

  const handleAddMilestone = () => {
    if (!targetProjectId || !newMilestoneTitle.trim()) return;

    const currentMs = storage.getMilestones();
    const projMs = currentMs.filter(m => m.projectId === targetProjectId);
    const newMs: Milestone = {
      id: `ms_${Date.now()}`,
      chapterId: "ch_default",
      projectId: targetProjectId,
      title: newMilestoneTitle.trim(),
      order: projMs.length,
      status: "active"
    };

    storage.saveMilestones([...currentMs, newMs]);
    setIsAddMilestoneOpen(false);
    setNewMilestoneTitle("");
    loadData();
  };

  const handleDeleteMilestone = (msId: string) => {
    if (confirm("このマイルストーンを削除しますか？紐付くクエストも削除されます。")) {
      const allMs = storage.getMilestones().filter(m => m.id !== msId);
      const allQs = storage.getQuests().filter(q => q.milestoneId !== msId);
      storage.saveMilestones(allMs);
      storage.saveQuests(allQs);
      if (mainStory) {
        storage.recalculateStoryProgress(mainStory.id);
      }
      loadData();
    }
  };

  const handleAddQuestToMilestone = () => {
    if (!mainStory || !targetMilestoneId || !newQuestTitle.trim()) return;

    const mpCost = newQuestDiff === "easy" ? 1 : newQuestDiff === "hard" ? 3 : 2;
    const xpReward = newQuestDiff === "easy" ? 50 : newQuestDiff === "hard" ? 150 : 100;
    const goldReward = newQuestDiff === "easy" ? 20 : newQuestDiff === "hard" ? 80 : 50;

    let metricObj: QuestMetric | undefined = undefined;
    const targetNum = parseFloat(metricTarget);
    if (hasMetric && !isNaN(targetNum) && targetNum > 0) {
      metricObj = {
        targetValue: targetNum,
        currentValue: 0,
        unit: metricUnit.trim() || "回",
        history: []
      };
    }

    const newQuest: Quest = {
      id: `q_${Date.now()}`,
      title: newQuestTitle.trim(),
      description: newQuestDesc.trim(),
      storyId: mainStory.id,
      projectId: targetProjectIdForQuest,
      milestoneId: targetMilestoneId,
      status: "active",
      difficulty: newQuestDiff,
      mpCost,
      xpReward,
      goldReward,
      skillTags: [],
      metric: metricObj,
      createdAt: Date.now()
    };

    const currentQuests = storage.getQuests();
    storage.saveQuests([...currentQuests, newQuest]);

    setIsAddQuestOpen(false);
    setNewQuestTitle("");
    setNewQuestDesc("");
    setHasMetric(false);
    setMetricTarget("");
    loadData();
  };

  const handleDeleteQuest = (questId: string) => {
    if (confirm("このクエストを削除しますか？")) {
      storage.deleteQuest(questId);
      loadData();
    }
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
    return <div className="p-6 text-stone-500 font-bold">物語の航海図を読み込んでいます...</div>;
  }

  if (!mainStory) {
    return (
      <main className="flex flex-col min-h-screen p-6 mx-auto max-w-md pt-16 text-center">
        <div className="w-16 h-16 rounded-3xl bg-amber-50 text-amber-600 border border-amber-200 mx-auto flex items-center justify-center mb-4 shadow-sm">
          <Compass className="w-8 h-8" />
        </div>
        <h1 className="text-xl font-black text-stone-800 mb-2">アクティブな物語（大目標）がありません</h1>
        <p className="text-xs font-medium text-stone-500 leading-relaxed max-w-xs mx-auto mb-6">
          「副業で年収100万円アップ」や「専門書読破」など、あなたの目標を登録して多階層のクエストツリーを構築しましょう！
        </p>
        <div className="flex flex-col gap-3 max-w-xs mx-auto w-full">
          <Button 
            onClick={() => setIsCreateStoryOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl py-6 font-bold text-sm shadow-md"
          >
            <Plus className="w-4 h-4 mr-1.5" /> 自分で大目標を作成
          </Button>
          <Button 
            onClick={() => {
              storage.loadSamplePreset();
              loadData();
            }}
            variant="outline"
            className="border-stone-300 text-stone-700 rounded-2xl py-6 font-bold text-sm"
          >
            ユーザー様モデルのサンプルで始める
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
                大目標（メインストーリー）を作成
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-3 py-2 text-left">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">目標タイトル</label>
                <Input
                  value={newStoryTitle}
                  onChange={(e) => setNewStoryTitle(e.target.value)}
                  placeholder="例: お金に不自由しない生活（副業100万）"
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

  const displayedProjects = selectedProjectId === "all" 
    ? projects 
    : projects.filter(p => p.id === selectedProjectId);

  return (
    <main className="flex flex-col min-h-screen p-4 pb-28 mx-auto max-w-md">
      {/* Header & Story Info */}
      <header className="mb-5 pt-1">
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-1.5">
            <MapIcon className="w-4 h-4 text-emerald-600" />
            <h1 className="text-[11px] font-black text-emerald-800 uppercase tracking-widest">
              目標・クエスト多階層ツリー
            </h1>
          </div>
          <div className="flex items-center gap-1.5">
            <button 
              onClick={() => router.push("/guide")}
              className="flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2 py-1 rounded-full hover:bg-emerald-100 transition-colors shadow-2xs"
            >
              📖 ガイド
            </button>
            <button 
              onClick={() => setIsCreateStoryOpen(true)}
              className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 rounded-full hover:bg-emerald-100 transition-colors shadow-2xs"
            >
              <Plus className="w-3 h-3" /> 大目標追加
            </button>
            <button 
              onClick={() => setIsPivotDialogOpen(true)}
              className="flex items-center gap-1 text-[11px] font-bold text-stone-500 bg-white border border-stone-200 px-2 py-1 rounded-full hover:bg-stone-50 transition-colors shadow-sm"
            >
              <GitBranch className="w-3 h-3 text-purple-600" />
              方針転換
            </button>
          </div>
        </div>

        {/* Level 2: Main Story Card */}
        <div className="glass-panel p-5 rounded-3xl border border-stone-200 shadow-sm relative overflow-hidden bg-gradient-to-br from-white to-stone-50/70">
          <div className="flex items-center gap-1.5 mb-1.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
              <CrownIcon className="w-3 h-3" /> Level 2: 戦略的大目標
            </span>
          </div>

          <h2 className="text-base font-black text-stone-900 leading-snug mb-1">
            {mainStory.title}
          </h2>
          
          <p className="text-xs font-medium text-stone-600 leading-relaxed mb-3">
            {mainStory.description}
          </p>

          {/* Story Progress */}
          <div className="bg-white p-3 rounded-2xl border border-stone-200/80 shadow-inner">
            <div className="flex justify-between text-xs font-bold text-stone-600 mb-1.5">
              <span>全体の統合達成度</span>
              <span className="font-mono text-emerald-700 font-black">{mainStory.progress}%</span>
            </div>
            <Progress value={mainStory.progress} className="h-2 bg-stone-100 *:bg-emerald-600" />
          </div>

          {/* Other stories switcher */}
          {allStories.length > 1 && (
            <div className="mt-3 pt-2.5 border-t border-stone-200/60 flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] font-bold text-stone-400">他の大目標:</span>
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

      {/* Level 3: Projects (Means / Tracks) Selector */}
      <section className="mb-5">
        <div className="flex justify-between items-center mb-2 px-1">
          <h3 className="text-[11px] font-black text-stone-500 uppercase tracking-widest flex items-center gap-1.5">
            <FolderKanban className="w-3.5 h-3.5 text-indigo-600" />
            Level 3: 達成手段（プロジェクト / トラック）
          </h3>
          <button
            onClick={() => setIsAddProjectOpen(true)}
            className="text-[11px] font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/80 px-2.5 py-1 rounded-full flex items-center gap-1 transition-colors shadow-2xs"
          >
            <Plus className="w-3 h-3" /> 手段を追加
          </button>
        </div>

        {/* Project Filter Chips */}
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          <button
            onClick={() => setSelectedProjectId("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all ${
              selectedProjectId === "all"
                ? "bg-stone-900 text-white shadow-sm"
                : "bg-white text-stone-600 border border-stone-200 hover:bg-stone-50"
            }`}
          >
            すべて表示 ({projects.length})
          </button>
          {projects.map((proj) => (
            <button
              key={proj.id}
              onClick={() => setSelectedProjectId(proj.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all flex items-center gap-1.5 ${
                selectedProjectId === proj.id
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-white text-stone-700 border border-stone-200 hover:bg-stone-50"
              }`}
            >
              <span>{proj.title}</span>
              <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded ${
                selectedProjectId === proj.id ? "bg-indigo-700 text-indigo-100" : "bg-stone-100 text-stone-500"
              }`}>
                {proj.progress}%
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Multi-Tier Tree Display */}
      <section className="space-y-4 mb-8">
        {displayedProjects.length === 0 ? (
          <div className="p-6 rounded-3xl bg-white border border-stone-200 text-center shadow-sm">
            <FolderPlus className="w-10 h-10 text-stone-300 mx-auto mb-2" />
            <h4 className="font-bold text-sm text-stone-700 mb-1">プロジェクトが登録されていません</h4>
            <p className="text-xs text-stone-500 mb-4 leading-relaxed">
              「アプリ販売」や「社外講演」「物販」など、大目標を達成するための手段（プロジェクト）を追加しましょう。
            </p>
            <Button
              onClick={() => setIsAddProjectOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl py-5 text-xs font-bold shadow-md"
            >
              <Plus className="w-4 h-4 mr-1" /> プロジェクト（達成手段）を追加
            </Button>
          </div>
        ) : (
          displayedProjects.map((project) => {
            const projectMilestones = milestones.filter(m => m.projectId === project.id);
            const projectQuests = quests.filter(q => q.projectId === project.id);

            return (
              <div 
                key={project.id} 
                className="glass-panel p-4 rounded-3xl border border-stone-200/90 shadow-sm bg-white overflow-hidden"
              >
                {/* Project Header */}
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="text-[9px] font-black uppercase tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-200/60 px-2 py-0.5 rounded-full inline-block mb-1">
                      プロジェクト
                    </span>
                    <h4 className="font-black text-sm text-stone-900 leading-snug">
                      {project.title}
                    </h4>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setTargetProjectId(project.id);
                        setIsAddMilestoneOpen(true);
                      }}
                      className="text-[10px] font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/70 px-2 py-1 rounded-lg flex items-center gap-0.5 shadow-2xs"
                      title="このプロジェクトに工程（マイルストーン）を追加"
                    >
                      <Plus className="w-3 h-3" /> 工程追加
                    </button>
                    <button
                      onClick={() => handleDeleteProject(project.id)}
                      className="p-1 text-stone-400 hover:text-rose-600 rounded-md hover:bg-stone-100"
                      title="プロジェクトを削除"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {project.description && (
                  <p className="text-xs font-medium text-stone-500 mb-3 leading-relaxed">
                    {project.description}
                  </p>
                )}

                {/* Project Progress Gauge */}
                <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-200/60 mb-3">
                  <div className="flex justify-between text-[11px] font-bold text-stone-600 mb-1">
                    <span>プロジェクト到達度</span>
                    <span className="font-mono text-indigo-700 font-black">{project.progress}%</span>
                  </div>
                  <Progress value={project.progress} className="h-1.5 bg-stone-200/50 *:bg-indigo-600" />
                </div>

                {/* Level 4: Milestones Tree */}
                <div className="space-y-3 pt-1">
                  {projectMilestones.length === 0 ? (
                    <div className="p-3 rounded-xl bg-stone-50/70 border border-dashed border-stone-200 text-center">
                      <p className="text-[11px] text-stone-400 font-bold mb-2">
                        工程（マイルストーン）がありません。
                      </p>
                      <button
                        onClick={() => {
                          setTargetProjectId(project.id);
                          setIsAddMilestoneOpen(true);
                        }}
                        className="text-[11px] font-bold text-indigo-700 underline"
                      >
                        ＋ 最初のマイルストーンを追加する
                      </button>
                    </div>
                  ) : (
                    projectMilestones.map((ms, msIdx) => {
                      const msQuests = quests.filter(q => q.milestoneId === ms.id);
                      const completedCount = msQuests.filter(q => q.status === "completed").length;

                      return (
                        <div key={ms.id} className="p-3 rounded-2xl bg-stone-50/80 border border-stone-200/80">
                          {/* Milestone Header */}
                          <div className="flex justify-between items-center mb-2">
                            <div className="flex items-center gap-1.5">
                              <span className="w-4 h-4 rounded-md bg-stone-200 text-stone-700 text-[10px] font-black flex items-center justify-center">
                                {msIdx + 1}
                              </span>
                              <h5 className="font-black text-xs text-stone-800">
                                {ms.title}
                              </h5>
                              <span className="font-mono text-[10px] text-stone-400">
                                ({completedCount}/{msQuests.length})
                              </span>
                            </div>

                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => {
                                  setTargetProjectIdForQuest(project.id);
                                  setTargetMilestoneId(ms.id);
                                  setIsAddQuestOpen(true);
                                }}
                                className="text-[9px] font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-200/60 flex items-center gap-0.5 shadow-2xs"
                              >
                                <Plus className="w-2.5 h-2.5" /> クエスト
                              </button>
                              <button
                                onClick={() => handleDeleteMilestone(ms.id)}
                                className="p-0.5 text-stone-400 hover:text-rose-600 rounded"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>

                          {/* Level 5: Quests List inside Milestone */}
                          <div className="space-y-1.5 mt-2">
                            {msQuests.map((q) => {
                              const isComp = q.status === "completed";
                              const metric = q.metric;
                              const percent = metric ? Math.min(100, Math.round((metric.currentValue / metric.targetValue) * 100)) : null;

                              return (
                                <div 
                                  key={q.id}
                                  className={`p-2.5 rounded-xl border transition-all ${
                                    isComp 
                                      ? "bg-white/50 border-stone-200/50 opacity-60 line-through text-stone-400" 
                                      : "bg-white border-stone-200/90 shadow-2xs hover:border-emerald-300"
                                  }`}
                                >
                                  <div className="flex justify-between items-start gap-2">
                                    <div className="flex items-start gap-1.5 flex-1">
                                      {isComp ? (
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                                      ) : (
                                        <Circle className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
                                      )}
                                      <div>
                                        <span className="text-xs font-bold text-stone-800 leading-tight block">
                                          {q.title}
                                        </span>
                                        {q.description && (
                                          <span className="text-[10px] text-stone-500 line-clamp-1 mt-0.5 block">
                                            {q.description}
                                          </span>
                                        )}
                                      </div>
                                    </div>

                                    {/* Action buttons (Progress / WHY / Delete) */}
                                    <div className="flex items-center gap-1 shrink-0">
                                      <button
                                        onClick={() => setWhyQuest(q)}
                                        className="p-1 text-stone-400 hover:text-amber-700 rounded hover:bg-stone-50"
                                        title="WHY（なぜこのタスクをやるのか）"
                                      >
                                        <HelpCircle className="w-3 h-3" />
                                      </button>
                                      <button
                                        onClick={() => handleDeleteQuest(q.id)}
                                        className="p-1 text-stone-400 hover:text-rose-600 rounded hover:bg-stone-50"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </button>
                                    </div>
                                  </div>

                                  {/* Metric Progress Bar in Quest */}
                                  {metric && (
                                    <div className="mt-2 pt-2 border-t border-stone-100">
                                      <div className="flex justify-between text-[10px] font-bold text-stone-600 mb-1">
                                        <span className="text-emerald-700">
                                          {metric.currentValue.toLocaleString()} / {metric.targetValue.toLocaleString()} {metric.unit} ({percent}%)
                                        </span>
                                        {!isComp && (
                                          <button
                                            onClick={() => setProgressQuest(q)}
                                            className="text-[9px] font-black text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-1.5 py-0.5 rounded flex items-center gap-0.5"
                                          >
                                            <TrendingUp className="w-2.5 h-2.5" /> ＋進捗
                                          </button>
                                        )}
                                      </div>
                                      <Progress value={percent || 0} className="h-1 bg-stone-100 *:bg-emerald-600" />
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })
        )}
      </section>

      {/* Modals & Dialogs */}

      {/* Modal to Create New Story / Goal */}
      <Dialog open={isCreateStoryOpen} onOpenChange={setIsCreateStoryOpen}>
        <DialogContent className="max-w-xs mx-auto rounded-3xl p-6 bg-white/95 backdrop-blur-xl border border-stone-100 shadow-2xl">
          <DialogHeader className="text-center">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 mx-auto flex items-center justify-center mb-2 shadow-sm">
              <Target className="w-6 h-6" />
            </div>
            <DialogTitle className="text-lg font-black text-stone-800">
              大目標（メインストーリー）を作成
            </DialogTitle>
            <DialogDescription className="text-xs font-medium text-stone-500">
              達成したい大きなゴールを設定します。
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 max-h-[60vh] overflow-y-auto pr-1 text-left">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">目標タイトル</label>
              <Input
                value={newStoryTitle}
                onChange={(e) => setNewStoryTitle(e.target.value)}
                placeholder="例: お金に不自由しない生活（副業100万）"
                className="text-xs rounded-xl font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">理由・目指す情景 (任意)</label>
              <Textarea
                value={newStoryDesc}
                onChange={(e) => setNewStoryDesc(e.target.value)}
                placeholder="例: 経済的自立と自由な時間の獲得"
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

      {/* Modal to Add Project / Track */}
      <Dialog open={isAddProjectOpen} onOpenChange={setIsAddProjectOpen}>
        <DialogContent className="max-w-xs mx-auto rounded-3xl p-6 bg-white/95 backdrop-blur-xl border border-stone-100 shadow-2xl">
          <DialogHeader className="text-center">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-200 mx-auto flex items-center justify-center mb-2 shadow-sm">
              <FolderKanban className="w-6 h-6" />
            </div>
            <DialogTitle className="text-lg font-black text-stone-800">
              達成手段（プロジェクト）を追加
            </DialogTitle>
            <DialogDescription className="text-xs font-medium text-stone-500">
              目標を達成するための手段・トラック（例: アプリ販売、講演、物販など）を設定します。
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-left max-h-[60vh] overflow-y-auto pr-1">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">プロジェクト名</label>
              <Input
                value={newProjectTitle}
                onChange={(e) => setNewProjectTitle(e.target.value)}
                placeholder="例: 📱 自作アプリの販売で稼ぐ"
                className="text-xs rounded-xl font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">概要・アプローチ (任意)</label>
              <Textarea
                value={newProjectDesc}
                onChange={(e) => setNewProjectDesc(e.target.value)}
                placeholder="例: Web/スマホアプリを開発・公開し月5万円の収益を作る"
                className="text-xs min-h-[50px] resize-none rounded-xl"
              />
            </div>

            {/* Quick Project Idea Chips */}
            <div>
              <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1.5">
                💡 手段のアイデア例（タップで入力）
              </label>
              <div className="space-y-1.5">
                {PROJECT_IDEAS.map((pIdea, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      setNewProjectTitle(pIdea.title);
                      setNewProjectDesc(pIdea.desc);
                    }}
                    className="p-2 rounded-xl bg-stone-50 hover:bg-indigo-50 border border-stone-200/70 hover:border-indigo-300 cursor-pointer text-left transition-all"
                  >
                    <span className="text-xs font-bold text-stone-800 block">{pIdea.title}</span>
                    <span className="text-[10px] text-stone-500 line-clamp-1">{pIdea.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="flex flex-col gap-2 mt-2">
            <Button
              onClick={handleAddProject}
              disabled={!newProjectTitle.trim()}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl py-5 font-bold text-xs shadow-md"
            >
              プロジェクトを追加する
            </Button>
            <Button
              onClick={() => setIsAddProjectOpen(false)}
              variant="ghost"
              className="w-full text-stone-400 text-xs font-bold"
            >
              キャンセル
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal to Add Milestone */}
      <Dialog open={isAddMilestoneOpen} onOpenChange={setIsAddMilestoneOpen}>
        <DialogContent className="max-w-xs mx-auto rounded-3xl p-6 bg-white/95 backdrop-blur-xl border border-stone-100 shadow-2xl">
          <DialogHeader className="text-center">
            <DialogTitle className="text-base font-black text-stone-800">
              工程（マイルストーン）を追加
            </DialogTitle>
            <DialogDescription className="text-xs font-medium text-stone-500">
              プロジェクトの中での段階・中間目標を設定します。
            </DialogDescription>
          </DialogHeader>

          <div className="py-2 text-left space-y-2">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">マイルストーン名</label>
              <Input
                value={newMilestoneTitle}
                onChange={(e) => setNewMilestoneTitle(e.target.value)}
                placeholder="例: ① 開発のための学習・インプット"
                className="text-xs rounded-xl font-bold"
              />
            </div>
          </div>

          <DialogFooter className="flex flex-col gap-2 mt-2">
            <Button
              onClick={handleAddMilestone}
              disabled={!newMilestoneTitle.trim()}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl py-5 font-bold text-xs shadow-md"
            >
              マイルストーンを追加
            </Button>
            <Button
              onClick={() => setIsAddMilestoneOpen(false)}
              variant="ghost"
              className="w-full text-stone-400 text-xs font-bold"
            >
              キャンセル
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal to Add Quest to Milestone */}
      <Dialog open={isAddQuestOpen} onOpenChange={setIsAddQuestOpen}>
        <DialogContent className="max-w-xs mx-auto rounded-3xl p-6 bg-white/95 backdrop-blur-xl border border-stone-100 shadow-2xl">
          <DialogHeader className="text-center">
            <DialogTitle className="text-base font-black text-stone-800">
              マイルストーンにクエストを追加
            </DialogTitle>
            <DialogDescription className="text-xs font-medium text-stone-500">
              今日すぐできる1アクションを設定します。
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-left max-h-[60vh] overflow-y-auto pr-1">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">クエストタイトル</label>
              <Input
                value={newQuestTitle}
                onChange={(e) => setNewQuestTitle(e.target.value)}
                placeholder="例: 専門書テキストを探して購入する"
                className="text-xs rounded-xl font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">補足説明 (任意)</label>
              <Textarea
                value={newQuestDesc}
                onChange={(e) => setNewQuestDesc(e.target.value)}
                placeholder="例: 所要時間10分。評判の良い本を1冊選ぶ。"
                className="text-xs min-h-[50px] resize-none rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">難易度・MP</label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { key: "easy", label: "初級 (MP1)" },
                  { key: "normal", label: "中級 (MP2)" },
                  { key: "hard", label: "上級 (MP3)" }
                ].map((d) => (
                  <button
                    key={d.key}
                    type="button"
                    onClick={() => setNewQuestDiff(d.key as QuestDifficulty)}
                    className={`py-1.5 text-[11px] font-bold rounded-xl border transition-all ${
                      newQuestDiff === d.key 
                        ? "bg-stone-900 text-white border-stone-900" 
                        : "bg-stone-50 text-stone-600 border-stone-200"
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Numeric Metric Switch */}
            <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200/80">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-stone-800">
                  数値到達度を記録する
                </label>
                <input
                  type="checkbox"
                  checked={hasMetric}
                  onChange={(e) => setHasMetric(e.target.checked)}
                  className="w-4 h-4 accent-emerald-600"
                />
              </div>

              {hasMetric && (
                <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-stone-200/60">
                  <div>
                    <label className="block text-[10px] font-bold text-stone-600 mb-0.5">目標数値</label>
                    <Input
                      type="number"
                      value={metricTarget}
                      onChange={(e) => setMetricTarget(e.target.value)}
                      placeholder="例: 213"
                      className="text-xs rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-stone-600 mb-0.5">単位</label>
                    <Input
                      value={metricUnit}
                      onChange={(e) => setMetricUnit(e.target.value)}
                      placeholder="ページ / 円"
                      className="text-xs rounded-xl"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="flex flex-col gap-2 mt-2">
            <Button
              onClick={handleAddQuestToMilestone}
              disabled={!newQuestTitle.trim()}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl py-5 font-bold text-xs shadow-md"
            >
              クエストを追加
            </Button>
            <Button
              onClick={() => setIsAddQuestOpen(false)}
              variant="ghost"
              className="w-full text-stone-400 text-xs font-bold"
            >
              キャンセル
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Pivot Dialog */}
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

          <div className="py-2 text-left">
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

      {/* Progress & WHY Modals */}
      <MetricProgressModal
        quest={progressQuest}
        isOpen={!!progressQuest}
        onClose={() => setProgressQuest(null)}
        onProgressUpdated={() => loadData()}
      />

      <WhyExplanationModal
        quest={whyQuest}
        milestone={milestones.find(m => m.id === whyQuest?.milestoneId)}
        mainStory={mainStory}
        futureVision={futureVision}
        isOpen={!!whyQuest}
        onClose={() => setWhyQuest(null)}
      />
    </main>
  );
}

function CrownIcon(props: any) {
  return <Sparkles {...props} />;
}
