"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { storage } from "@/services/storage";
import { MainStory, GoalProject, Quest, Milestone, FutureVision, Value, QuestDifficulty, QuestMetric } from "@/types";
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
  HelpCircle,
  Crown,
  HeartHandshake
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
  { title: "📚 専門書の集中読破・要約トラック", desc: "毎日20〜30ページを読み進め、ノートに要点をまとめる" },
  { title: "🏃 毎朝のジョギング＆体力強化トラック", desc: "毎朝5〜10kmを走り、月間300kmの走破を目指す" }
];

export default function StoryPage() {
  const router = useRouter();
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Level 1 State (Always visible)
  const [futureVision, setFutureVision] = useState<FutureVision | null>(null);
  const [values, setValues] = useState<Value[]>([]);
  const [isEditVisionOpen, setIsEditVisionOpen] = useState(false);
  const [visionText, setVisionText] = useState("");

  // Level 2 State (Multiple active goals)
  const [stories, setStories] = useState<MainStory[]>([]);
  const [selectedStoryId, setSelectedStoryId] = useState<string>("");
  
  // Level 3, 4, 5 Hierarchy State
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
    // Load Level 1
    const fv = storage.getFutureVision();
    const vals = storage.getValues();
    setFutureVision(fv);
    setValues(vals);
    if (fv) setVisionText(fv.content);

    // Load Level 2 (All active stories)
    const allStories = storage.getStories().filter(s => s.status === "active");
    setStories(allStories);

    // If no story is selected or the selected one was removed, default to first
    let currentStoryId = selectedStoryId;
    if (!allStories.some(s => s.id === currentStoryId)) {
      currentStoryId = allStories.length > 0 ? allStories[0].id : "";
      setSelectedStoryId(currentStoryId);
    }

    // Load Level 3, 4, 5
    if (currentStoryId) {
      setProjects(storage.getProjects().filter(p => p.storyId === currentStoryId));
      setMilestones(storage.getMilestones());
      setQuests(storage.getQuests().filter(q => q.storyId === currentStoryId));
    } else {
      setProjects([]);
      setMilestones([]);
      setQuests([]);
    }
  };

  useEffect(() => {
    loadData();
    setIsLoaded(true);
  }, [selectedStoryId]);

  const handleSaveVision = () => {
    if (!visionText.trim()) return;
    const now = Date.now();
    const updatedVision: FutureVision = {
      id: futureVision?.id || `fv_${now}`,
      content: visionText.trim(),
      createdAt: futureVision?.createdAt || now,
      updatedAt: now
    };
    storage.saveFutureVision(updatedVision);
    setFutureVision(updatedVision);
    setIsEditVisionOpen(false);
  };

  const handleCreateNewStory = () => {
    if (!newStoryTitle.trim()) return;

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

    // Add to active stories list (without disabling others!)
    storage.addStory(createdStory);

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

    setSelectedStoryId(createdStory.id);
    setIsCreateStoryOpen(false);
    setNewStoryTitle("");
    setNewStoryDesc("");
    loadData();
  };

  const handleDeleteStory = (storyId: string) => {
    if (confirm("この大目標を削除しますか？紐付くすべての手段・工程・クエストも削除されます。")) {
      storage.deleteStory(storyId);
      loadData();
    }
  };

  const handleAddProject = () => {
    if (!selectedStoryId || !newProjectTitle.trim()) return;

    const newProj: GoalProject = {
      id: `proj_${Date.now()}`,
      storyId: selectedStoryId,
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
    if (confirm("この達成手段（プロジェクト）を削除しますか？紐付く工程やクエストも削除されます。")) {
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
    if (confirm("この工程（マイルストーン）を削除しますか？紐付くクエストも削除されます。")) {
      const allMs = storage.getMilestones().filter(m => m.id !== msId);
      const allQs = storage.getQuests().filter(q => q.milestoneId !== msId);
      storage.saveMilestones(allMs);
      storage.saveQuests(allQs);
      if (selectedStoryId) {
        storage.recalculateStoryProgress(selectedStoryId);
      }
      loadData();
    }
  };

  const handleAddQuestToMilestone = () => {
    if (!selectedStoryId || !targetMilestoneId || !newQuestTitle.trim()) return;

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
      storyId: selectedStoryId,
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
    const currentStory = stories.find(s => s.id === selectedStoryId);
    if (!currentStory || !pivotReason.trim()) return;

    const allStories = storage.getStories();
    const updatedStories = allStories.map(s => 
      s.id === currentStory.id 
        ? { ...s, status: "pivoted" as const, pivotReason: pivotReason, endedAt: Date.now(), updatedAt: Date.now() } 
        : s
    );
    storage.saveStories(updatedStories);

    storage.addStoryLog({
      id: `log_${Date.now()}`,
      date: Date.now(),
      type: "story_pivoted",
      title: `方針転換（ピボット）: ${currentStory.title}`,
      description: `理由: ${pivotReason}`,
      storyId: currentStory.id,
      metadata: { reason: pivotReason }
    });

    setIsPivotDialogOpen(false);
    setPivotReason("");
    loadData();
  };

  if (!isLoaded) {
    return <div className="p-6 text-stone-500 font-bold">目標航海図を読み込んでいます...</div>;
  }

  const activeStory = stories.find(s => s.id === selectedStoryId) || stories[0] || null;
  const displayedProjects = selectedProjectId === "all" 
    ? projects 
    : projects.filter(p => p.id === selectedProjectId);

  return (
    <main className="w-full max-w-6xl mx-auto p-4 md:p-8 pb-28 md:pb-12">
      {/* Navigation Header */}
      <div className="flex items-center justify-between mb-4 px-1 pt-1">
        <div className="flex items-center gap-1.5">
          <MapIcon className="w-5 h-5 text-emerald-600" />
          <h1 className="text-xs md:text-sm font-black text-emerald-800 uppercase tracking-widest font-mono">
            CRESTWARD ROADMAP
          </h1>
        </div>
        <div className="flex items-center gap-1.5">
          <button 
            onClick={() => router.push("/guide")}
            className="flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 rounded-full hover:bg-emerald-100 transition-colors shadow-2xs"
          >
            📖 ガイド
          </button>
          <button 
            onClick={() => setIsCreateStoryOpen(true)}
            className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 rounded-full hover:bg-emerald-100 transition-colors shadow-2xs"
          >
            <Plus className="w-3 h-3" /> 大目標追加
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 🌟 LEVEL 1: ALWAYS-VISIBLE ROOT VISION & CORE VALUES (究極の理想・価値観) */}
      {/* ========================================================================= */}
      <section className="mb-5">
        <div className="p-4 rounded-3xl bg-gradient-to-br from-purple-950 via-stone-900 to-indigo-950 text-white border border-purple-800/40 shadow-md relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-10">
            <Sparkles className="w-20 h-20 text-purple-300" />
          </div>

          <div className="flex justify-between items-center mb-2 relative z-10">
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-purple-500/30 text-purple-200 border border-purple-400/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-300" /> Level 1: 究極の理想・価値観 (ROOT)
              </span>
            </div>
            <button
              onClick={() => setIsEditVisionOpen(true)}
              className="text-[10px] font-bold text-purple-200 hover:text-white bg-purple-900/60 hover:bg-purple-800/80 border border-purple-500/40 px-2 py-0.5 rounded-lg flex items-center gap-1 transition-colors"
            >
              <Edit3 className="w-2.5 h-2.5" /> 編集
            </button>
          </div>

          <h2 className="text-xs font-bold text-stone-100 leading-relaxed mb-3 relative z-10 font-sans">
            {futureVision?.content || "お金と時間に縛られず、自分が誇れるプロダクトを世界に届けながら豊かに暮らす人生"}
          </h2>

          {/* Core Values Chips */}
          {values.length > 0 && (
            <div className="pt-2 border-t border-purple-800/50 flex items-center gap-1.5 flex-wrap relative z-10">
              <span className="text-[9px] font-bold text-purple-300">コア価値観:</span>
              {values.map(v => (
                <span 
                  key={v.id}
                  className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-purple-900/60 text-purple-200 border border-purple-500/30 font-mono"
                >
                  {v.name} ★{v.level}
                </span>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 👑 LEVEL 2: MULTIPLE CONCURRENT STRATEGIC GOALS (戦略的大目標セレクター) */}
      {/* ========================================================================= */}
      <section className="mb-5">
        <div className="flex justify-between items-center mb-2 px-1">
          <div className="flex items-center gap-1.5">
            <Crown className="w-3.5 h-3.5 text-amber-500" />
            <h2 className="text-[11px] font-black text-stone-500 uppercase tracking-widest">
              Level 2: 戦略的大目標（全 {stories.length} 件 進行中）
            </h2>
          </div>
          <button
            onClick={() => setIsCreateStoryOpen(true)}
            className="text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 px-2.5 py-1 rounded-full flex items-center gap-1 transition-colors shadow-2xs"
          >
            <Plus className="w-3 h-3" /> 大目標を追加
          </button>
        </div>

        {/* Level 2 Goal Switcher Tabs */}
        {stories.length === 0 ? (
          <div className="p-5 rounded-3xl bg-white border border-dashed border-stone-300 text-center">
            <Target className="w-8 h-8 text-stone-300 mx-auto mb-2" />
            <h3 className="font-bold text-sm text-stone-700">大目標がありません</h3>
            <p className="text-xs text-stone-500 my-2">「副業年収100万」や「専門書読破」など、達成したい目標を作成しましょう。</p>
            <Button
              onClick={() => setIsCreateStoryOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl py-2 px-4 text-xs font-bold"
            >
              <Plus className="w-3.5 h-3.5 mr-1" /> 目標を作成する
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Multiple Goals Selection Pills */}
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {stories.map(s => {
                const isSelected = s.id === (activeStory?.id || "");
                return (
                  <button
                    key={s.id}
                    onClick={() => setSelectedStoryId(s.id)}
                    className={`px-3 py-2 rounded-2xl text-xs font-bold shrink-0 transition-all flex items-center gap-2 border ${
                      isSelected
                        ? "bg-stone-900 text-white border-stone-900 shadow-sm"
                        : "bg-white text-stone-700 border-stone-200 hover:bg-stone-50"
                    }`}
                  >
                    <Crown className={`w-3 h-3 ${isSelected ? "text-amber-400" : "text-stone-400"}`} />
                    <span>{s.title}</span>
                    <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded ${
                      isSelected ? "bg-stone-800 text-emerald-400" : "bg-stone-100 text-emerald-700"
                    }`}>
                      {s.progress}%
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Active Selected Story Card */}
            {activeStory && (
              <div className="glass-panel p-4 rounded-3xl border border-stone-200/90 shadow-sm bg-gradient-to-br from-white to-stone-50/70 relative">
                <div className="flex justify-between items-start mb-1.5">
                  <span className="text-[9px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                    <Crown className="w-2.5 h-2.5 text-amber-500" /> 選択中の大目標
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setIsPivotDialogOpen(true)}
                      className="text-[10px] font-bold text-stone-500 hover:text-purple-700 bg-white border border-stone-200 px-2 py-0.5 rounded-md hover:bg-purple-50 transition-colors shadow-2xs"
                    >
                      <GitBranch className="w-2.5 h-2.5 inline mr-0.5" /> ピボット
                    </button>
                    <button
                      onClick={() => handleDeleteStory(activeStory.id)}
                      className="p-1 text-stone-400 hover:text-rose-600 rounded"
                      title="この大目標を削除"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <h3 className="font-black text-sm text-stone-900 leading-snug mb-1">
                  {activeStory.title}
                </h3>
                <p className="text-xs font-medium text-stone-500 mb-3 leading-relaxed">
                  {activeStory.description}
                </p>

                <div className="bg-white p-3 rounded-2xl border border-stone-200/80 shadow-inner">
                  <div className="flex justify-between text-xs font-bold text-stone-600 mb-1">
                    <span>この目標の統合達成度</span>
                    <span className="font-mono text-emerald-700 font-black">{activeStory.progress}%</span>
                  </div>
                  <Progress value={activeStory.progress} className="h-2 bg-stone-100 *:bg-emerald-600" />
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* ========================================================================= */}
      {/* 📱 LEVEL 3: MEANS / TRACKS (PROJECTS UNDER ACTIVE STORY) */}
      {/* ========================================================================= */}
      {activeStory && (
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
          {projects.length > 0 && (
            <div className="flex gap-1.5 overflow-x-auto pb-1 mb-3">
              <button
                onClick={() => setSelectedProjectId("all")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all ${
                  selectedProjectId === "all"
                    ? "bg-indigo-900 text-white shadow-xs"
                    : "bg-white text-stone-600 border border-stone-200 hover:bg-stone-50"
                }`}
              >
                すべて ({projects.length})
              </button>
              {projects.map((proj) => (
                <button
                  key={proj.id}
                  onClick={() => setSelectedProjectId(proj.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all flex items-center gap-1.5 ${
                    selectedProjectId === proj.id
                      ? "bg-indigo-600 text-white shadow-xs"
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
          )}

          {/* ========================================================================= */}
          {/* 🚩 LEVEL 4 & ⚔️ LEVEL 5: HIERARCHY TREE */}
          {/* ========================================================================= */}
          <div className="space-y-4">
            {displayedProjects.length === 0 ? (
              <div className="p-6 rounded-3xl bg-white border border-stone-200 text-center shadow-sm">
                <FolderPlus className="w-10 h-10 text-stone-300 mx-auto mb-2" />
                <h4 className="font-bold text-sm text-stone-700 mb-1">達成手段が登録されていません</h4>
                <p className="text-xs text-stone-500 mb-4 leading-relaxed">
                  「アプリ販売」や「社外講演」「読書習慣」など、この目標を達成するための手段（プロジェクト）を追加しましょう。
                </p>
                <Button
                  onClick={() => setIsAddProjectOpen(true)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl py-5 text-xs font-bold shadow-md"
                >
                  <Plus className="w-4 h-4 mr-1" /> 達成手段（プロジェクト）を追加
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
                          手段・トラック
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
                        <span>トラック到達度</span>
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
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* MODALS & DIALOGS */}
      {/* ========================================================================= */}

      {/* Edit Level 1 Future Vision Modal */}
      <Dialog open={isEditVisionOpen} onOpenChange={setIsEditVisionOpen}>
        <DialogContent className="max-w-xs mx-auto rounded-3xl p-6 bg-white/95 backdrop-blur-xl border border-stone-100 shadow-2xl">
          <DialogHeader className="text-center">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 border border-purple-200 mx-auto flex items-center justify-center mb-2 shadow-sm">
              <Sparkles className="w-6 h-6 text-amber-500" />
            </div>
            <DialogTitle className="text-lg font-black text-stone-800">
              Level 1: 究極の理想を編集
            </DialogTitle>
            <DialogDescription className="text-xs font-medium text-stone-500">
              あなたが人生で本当に目指したい理想の情景を言葉にします。
            </DialogDescription>
          </DialogHeader>

          <div className="py-2 text-left">
            <label className="block text-xs font-bold text-stone-700 mb-1">目指す情景・理想の人生像</label>
            <Textarea
              value={visionText}
              onChange={(e) => setVisionText(e.target.value)}
              placeholder="例: お金と時間に縛られず、自分が誇れるプロダクトを世界に届けながら家族と豊かに暮らす人生"
              className="text-xs min-h-[90px] resize-none rounded-2xl"
            />
          </div>

          <DialogFooter className="flex flex-col gap-2 mt-2">
            <Button
              onClick={handleSaveVision}
              disabled={!visionText.trim()}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-2xl py-5 font-bold text-xs shadow-md"
            >
              理想の情景を保存する
            </Button>
            <Button
              onClick={() => setIsEditVisionOpen(false)}
              variant="ghost"
              className="w-full text-stone-400 text-xs font-bold"
            >
              キャンセル
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal to Create New Level 2 Story */}
      <Dialog open={isCreateStoryOpen} onOpenChange={setIsCreateStoryOpen}>
        <DialogContent className="max-w-xs mx-auto rounded-3xl p-6 bg-white/95 backdrop-blur-xl border border-stone-100 shadow-2xl">
          <DialogHeader className="text-center">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 mx-auto flex items-center justify-center mb-2 shadow-sm">
              <Crown className="w-6 h-6 text-amber-500" />
            </div>
            <DialogTitle className="text-lg font-black text-stone-800">
              Level 2: 戦略的大目標を作成
            </DialogTitle>
            <DialogDescription className="text-xs font-medium text-stone-500">
              達成したい大目標（メインストーリー）を追加します。
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
              この目標を追加する
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
              大目標を達成するための手段・トラック（例: アプリ販売、講演、物販など）を設定します。
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
        mainStory={activeStory}
        futureVision={futureVision}
        isOpen={!!whyQuest}
        onClose={() => setWhyQuest(null)}
      />
    </main>
  );
}
