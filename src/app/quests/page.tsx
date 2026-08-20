"use client";

import { useEffect, useState } from "react";
import { storage } from "@/services/storage";
import { Quest, QuestChapter, Milestone, UserSettings, MainStory, QuestDifficulty, QuestMetric, GoalProject } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Target, 
  CheckCircle2, 
  Sparkles, 
  Plus, 
  HelpCircle, 
  Zap, 
  TrendingUp,
  BarChart2,
  Trash2,
  Edit3,
  FolderKanban,
  ArrowLeft,
  BookOpen,
  Crown
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { QuestCompletionModal } from "@/components/QuestCompletionModal";
import { WhyExplanationModal } from "@/components/WhyExplanationModal";
import { MetricProgressModal } from "@/components/MetricProgressModal";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function QuestsPage() {
  const router = useRouter();
  const [quests, setQuests] = useState<Quest[]>([]);
  const [stories, setStories] = useState<MainStory[]>([]);
  const [projects, setProjects] = useState<GoalProject[]>([]);
  const [chapters, setChapters] = useState<QuestChapter[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);

  // Filters
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "completed">("active");
  const [diffFilter, setDiffFilter] = useState<"all" | QuestDifficulty>("all");
  const [storyFilter, setStoryFilter] = useState<string>("all");
  const [projectFilter, setProjectFilter] = useState<string>("all");

  // Quick Add State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newDiff, setNewDiff] = useState<QuestDifficulty>("normal");
  const [newStoryId, setNewStoryId] = useState<string>("");
  const [newProjectId, setNewProjectId] = useState<string>("");
  const [newMilestoneId, setNewMilestoneId] = useState<string>("");
  
  // Metric Target Option in Quick Add
  const [hasMetric, setHasMetric] = useState(false);
  const [newMetricTarget, setNewMetricTarget] = useState("");
  const [newMetricUnit, setNewMetricUnit] = useState("ページ");

  // Edit Quest State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editQuest, setEditQuest] = useState<Quest | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editDiff, setEditDiff] = useState<QuestDifficulty>("normal");
  const [editStoryId, setEditStoryId] = useState<string>("");
  const [editProjectId, setEditProjectId] = useState<string>("");
  const [editMilestoneId, setEditMilestoneId] = useState<string>("");
  const [editHasMetric, setEditHasMetric] = useState(false);
  const [editMetricTarget, setEditMetricTarget] = useState("");
  const [editMetricCurrent, setEditMetricCurrent] = useState("");
  const [editMetricUnit, setEditMetricUnit] = useState("ページ");

  const [completedQuest, setCompletedQuest] = useState<Quest | null>(null);
  const [levelUpData, setLevelUpData] = useState<{ leveledUp: boolean; newLevel: number }>({ leveledUp: false, newLevel: 1 });
  const [whyQuest, setWhyQuest] = useState<Quest | null>(null);
  const [progressQuest, setProgressQuest] = useState<Quest | null>(null);

  const loadData = () => {
    const activeStories = storage.getStories().filter(s => s.status === "active");
    setStories(activeStories);
    setQuests(storage.getQuests());
    setProjects(storage.getProjects());
    setChapters(storage.getChapters());
    setMilestones(storage.getMilestones());

    if (activeStories.length > 0 && !newStoryId) {
      setNewStoryId(activeStories[0].id);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenEdit = (quest: Quest) => {
    setEditQuest(quest);
    setEditTitle(quest.title);
    setEditDesc(quest.description || "");
    setEditDiff(quest.difficulty || "normal");
    setEditStoryId(quest.storyId || "");
    setEditProjectId(quest.projectId || "");
    setEditMilestoneId(quest.milestoneId || "");
    if (quest.metric) {
      setEditHasMetric(true);
      setEditMetricTarget(String(quest.metric.targetValue));
      setEditMetricCurrent(String(quest.metric.currentValue || 0));
      setEditMetricUnit(quest.metric.unit || "回");
    } else {
      setEditHasMetric(false);
      setEditMetricTarget("");
      setEditMetricCurrent("0");
      setEditMetricUnit("回");
    }
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = () => {
    if (!editQuest || !editTitle.trim()) return;

    const mpCost = editDiff === "easy" ? 1 : editDiff === "hard" ? 3 : 2;
    const xpReward = editDiff === "easy" ? 40 : editDiff === "hard" ? 140 : 80;
    const goldReward = editDiff === "easy" ? 20 : editDiff === "hard" ? 70 : 40;

    let metricObj: QuestMetric | undefined = undefined;
    const targetNum = parseFloat(editMetricTarget);
    if (editHasMetric && !isNaN(targetNum) && targetNum > 0) {
      metricObj = {
        targetValue: targetNum,
        currentValue: parseFloat(editMetricCurrent) || 0,
        unit: editMetricUnit.trim() || "回",
        history: editQuest.metric?.history || []
      };
    }

    const updated: Quest = {
      ...editQuest,
      title: editTitle.trim(),
      description: editDesc.trim(),
      difficulty: editDiff,
      mpCost,
      xpReward,
      goldReward,
      storyId: editStoryId || editQuest.storyId || "story_default",
      projectId: editProjectId || undefined,
      milestoneId: editMilestoneId || undefined,
      metric: metricObj
    };

    storage.updateQuest(updated);
    setIsEditModalOpen(false);
    setEditQuest(null);
    loadData();
  };

  const handleQuestComplete = (quest: Quest) => {
    const st = storage.getSettings();
    if (st.currentMp < quest.mpCost) {
      alert(`MPが足りません（必要MP: ${quest.mpCost} / 現在MP: ${st.currentMp}）。朝のチェックインで回復しましょう！`);
      return;
    }
    
    st.currentMp = Math.max(0, st.currentMp - quest.mpCost);
    storage.saveSettings(st);

    const allQuests = storage.getQuests();
    const updated = allQuests.map(q => q.id === quest.id ? { ...q, status: "completed" as const, completedAt: Date.now() } : q);
    storage.saveQuests(updated);

    const xpResult = storage.addExperience(quest.xpReward);
    storage.addGold(quest.goldReward);

    if (quest.skillTags && quest.skillTags.length > 0) {
      quest.skillTags.forEach(tag => {
        storage.addSkillExperience(tag, Math.round(quest.xpReward / 2));
      });
    }

    storage.addStoryLog({
      id: `log_${Date.now()}`,
      date: Date.now(),
      type: "quest_completed",
      title: `クエスト達成: ${quest.title}`,
      description: `${quest.xpReward} XP と ${quest.goldReward} Gold を獲得しました。`
    });

    setLevelUpData({ leveledUp: xpResult.leveledUp, newLevel: xpResult.newLevel });
    setCompletedQuest(quest);
    loadData();
  };

  const handleDeleteQuest = (quest: Quest) => {
    if (confirm(`クエスト「${quest.title}」を削除しますか？`)) {
      storage.deleteQuest(quest.id);
      loadData();
    }
  };

  const handleAddQuickQuest = () => {
    if (!newTitle.trim()) return;

    const mpCost = newDiff === "easy" ? 1 : newDiff === "hard" ? 3 : 2;
    const xpReward = newDiff === "easy" ? 40 : newDiff === "hard" ? 140 : 80;
    const goldReward = newDiff === "easy" ? 20 : newDiff === "hard" ? 70 : 40;

    let metricObj: QuestMetric | undefined = undefined;
    const targetNum = parseFloat(newMetricTarget);
    if (hasMetric && !isNaN(targetNum) && targetNum > 0) {
      metricObj = {
        targetValue: targetNum,
        currentValue: 0,
        unit: newMetricUnit.trim() || "回",
        history: []
      };
    }

    const quest: Quest = {
      id: `q_${Date.now()}`,
      title: newTitle.trim(),
      description: newDesc.trim(),
      storyId: newStoryId || (stories.length > 0 ? stories[0].id : "story_general"),
      projectId: newProjectId ? newProjectId : undefined,
      milestoneId: newMilestoneId ? newMilestoneId : undefined,
      status: "active",
      difficulty: newDiff,
      mpCost,
      xpReward,
      goldReward,
      skillTags: [],
      metric: metricObj,
      createdAt: Date.now()
    };

    const currentQuests = storage.getQuests();
    storage.saveQuests([quest, ...currentQuests]);

    setIsAddModalOpen(false);
    setNewTitle("");
    setNewDesc("");
    setNewProjectId("");
    setNewMilestoneId("");
    setHasMetric(false);
    setNewMetricTarget("");
    loadData();
  };

  const handleProgressUpdated = (updatedQuest: Quest, isCompleted: boolean) => {
    loadData();
    if (isCompleted) {
      setTimeout(() => {
        if (confirm(`🎉 目標数値を達成しました！「${updatedQuest.title}」を完了にして報酬（XP・Gold）を受け取りますか？`)) {
          handleQuestComplete(updatedQuest);
        }
      }, 300);
    }
  };

  const filteredQuests = quests.filter(q => {
    if (statusFilter !== "all" && q.status !== statusFilter) return false;
    if (diffFilter !== "all" && q.difficulty !== diffFilter) return false;
    if (storyFilter !== "all" && q.storyId !== storyFilter) return false;
    if (projectFilter !== "all" && q.projectId !== projectFilter) return false;
    return true;
  });

  return (
    <main className="w-full max-w-6xl mx-auto p-4 md:p-8 pb-28 md:pb-12">
      {/* Header */}
      <header className="mb-6 pt-1">
        <div className="flex md:hidden items-center justify-between mb-3 px-1">
          <Link href="/" className="inline-flex items-center text-stone-400 hover:text-stone-700 text-xs font-bold transition-colors">
            <ArrowLeft className="w-4 h-4 mr-1" /> ホームに戻る
          </Link>
          <button
            onClick={() => router.push("/guide")}
            className="text-[11px] font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 px-2.5 py-1 rounded-full flex items-center gap-1 shadow-2xs transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
            使い方ガイド
          </button>
        </div>

        <div className="flex items-center justify-between mb-2 px-1">
          <div className="flex items-center gap-2">
            <Target className="w-6 h-6 text-emerald-600" />
            <h1 className="text-xl md:text-2xl font-black text-stone-800 tracking-tight">
              クエスト掲示板
            </h1>
          </div>
          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full py-2 px-4 text-xs font-bold shadow-sm flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> クエスト追加
          </Button>
        </div>
        <p className="text-xs md:text-sm font-medium text-stone-500 px-1 leading-relaxed">
          今日できる小さな1歩を実行し、経験値（XP）とGoldを獲得しましょう。
        </p>
      </header>

      {/* Filters */}
      <div className="space-y-3 mb-6 bg-white/70 backdrop-blur-sm p-3 rounded-2xl border border-stone-200/80 shadow-2xs">
        {/* Status filter tabs */}
        <div className="flex bg-stone-100/80 p-1 rounded-2xl border border-stone-200/60 max-w-md">
          <button
            onClick={() => setStatusFilter("active")}
            className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
              statusFilter === "active" ? "bg-white text-stone-800 shadow-sm" : "text-stone-500 hover:text-stone-800"
            }`}
          >
            進行中 ({quests.filter(q => q.status === "active").length})
          </button>
          <button
            onClick={() => setStatusFilter("completed")}
            className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
              statusFilter === "completed" ? "bg-white text-stone-800 shadow-sm" : "text-stone-500 hover:text-stone-800"
            }`}
          >
            達成済み ({quests.filter(q => q.status === "completed").length})
          </button>
          <button
            onClick={() => setStatusFilter("all")}
            className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
              statusFilter === "all" ? "bg-white text-stone-800 shadow-sm" : "text-stone-500 hover:text-stone-800"
            }`}
          >
            すべて
          </button>
        </div>

        {/* Story (Level 2) & Project (Level 3) Filter Chips */}
        {stories.length > 1 && (
          <div className="flex gap-1.5 overflow-x-auto py-0.5">
            <button
              onClick={() => setStoryFilter("all")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all ${
                storyFilter === "all"
                  ? "bg-emerald-700 text-white shadow-xs"
                  : "bg-white text-stone-600 border border-stone-200/80 hover:bg-stone-50"
              }`}
            >
              全大目標
            </button>
            {stories.map((s) => (
              <button
                key={s.id}
                onClick={() => setStoryFilter(s.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all flex items-center gap-1.5 ${
                  storyFilter === s.id
                    ? "bg-emerald-700 text-white shadow-xs"
                    : "bg-white text-stone-600 border border-stone-200/80 hover:bg-stone-50"
                }`}
              >
                <Crown className="w-3 h-3 text-amber-400" />
                <span>{s.title}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Quests List */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {filteredQuests.length === 0 ? (
          <div className="glass-panel p-8 rounded-3xl border border-stone-200 text-center">
            <Target className="w-10 h-10 text-stone-300 mx-auto mb-2" />
            <h3 className="font-bold text-sm text-stone-700">該当するクエストがありません</h3>
            <p className="text-xs text-stone-500 mt-1 mb-4">新しいクエストを追加するか、フィルターを変更してください。</p>
            <Button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl py-5 font-bold text-xs shadow-md"
            >
              <Plus className="w-4 h-4 mr-1.5" /> クエストを追加する
            </Button>
          </div>
        ) : (
          filteredQuests.map((quest) => {
            const isCompleted = quest.status === "completed";
            const story = stories.find(s => s.id === quest.storyId);
            const proj = projects.find(p => p.id === quest.projectId);
            const ms = milestones.find(m => m.id === quest.milestoneId);

            const diffBadge = quest.difficulty === "easy" 
              ? { label: "初級", color: "bg-emerald-50 text-emerald-700 border-emerald-200" }
              : quest.difficulty === "hard"
              ? { label: "上級", color: "bg-rose-50 text-rose-700 border-rose-200" }
              : { label: "中級", color: "bg-amber-50 text-amber-700 border-amber-200" };

            // Numeric Metric calculation
            const metric = quest.metric;
            const percent = metric ? Math.min(100, Math.round((metric.currentValue / metric.targetValue) * 1000) / 10) : 0;

            return (
              <div 
                key={quest.id}
                className={`glass-panel p-4 rounded-2xl border transition-all ${
                  isCompleted 
                    ? "bg-stone-50/60 border-stone-200/50 opacity-70" 
                    : "border-stone-200/90 shadow-sm hover:shadow-md"
                }`}
              >
                <div className="flex justify-between items-start gap-2 mb-2">
                  <div>
                    {/* Story & Project Hierarchy Tag */}
                    <div className="flex items-center gap-1.5 flex-wrap mb-1">
                      {story && (
                        <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-mono text-[9px] font-black border border-emerald-200/60">
                          <Crown className="w-2.5 h-2.5 text-amber-500" /> {story.title}
                        </span>
                      )}
                      {proj && (
                        <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-mono text-[9px] font-black border border-indigo-200/60">
                          <FolderKanban className="w-2.5 h-2.5" /> {proj.title}
                        </span>
                      )}
                      {ms && (
                        <span className="inline-block px-2 py-0.5 rounded bg-stone-100 text-stone-500 font-mono text-[9px] font-black">
                          {ms.title}
                        </span>
                      )}
                    </div>

                    <h3 className={`font-black text-sm leading-snug ${isCompleted ? 'text-stone-500 line-through' : 'text-stone-800'}`}>
                      {quest.title}
                    </h3>
                  </div>

                  {/* Card Actions (Edit, WHY & Delete) */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleOpenEdit(quest)}
                      className="p-1.5 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-400 hover:text-stone-700 transition-colors"
                      title="クエストを編集"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setWhyQuest(quest)}
                      className="p-1.5 rounded-full bg-stone-100 hover:bg-amber-100 text-stone-400 hover:text-amber-700 transition-colors"
                      title="なぜこのクエストをやるのか？"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteQuest(quest)}
                      className="p-1.5 rounded-full bg-stone-100 hover:bg-rose-100 text-stone-400 hover:text-rose-600 transition-colors"
                      title="クエストを削除"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {quest.description && (
                  <p className="text-xs font-medium text-stone-500 mb-2 leading-relaxed">
                    {quest.description}
                  </p>
                )}

                {/* Numeric Metric Progress Bar (If applicable) */}
                {metric && (
                  <div className="p-2.5 rounded-xl bg-stone-50/80 border border-stone-200/70 mb-3">
                    <div className="flex justify-between items-baseline mb-1 text-[11px] font-bold">
                      <span className="text-stone-400 text-[10px] font-black">到達度</span>
                      <div className="font-mono">
                        <span className="text-emerald-700 font-black">{metric.currentValue.toLocaleString()}</span>
                        <span className="text-stone-400 mx-0.5">/</span>
                        <span className="text-stone-600">{metric.targetValue.toLocaleString()} {metric.unit}</span>
                        <span className="ml-1 text-[10px] text-emerald-600 font-black">({percent}%)</span>
                      </div>
                    </div>
                    <Progress value={percent} className="h-1.5 bg-stone-200/60 *:bg-emerald-600 mb-2" />
                    
                    {!isCompleted && (
                      <button
                        onClick={() => setProgressQuest(quest)}
                        className="w-full py-1.5 px-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/80 text-[11px] font-bold flex items-center justify-center gap-1 transition-colors active:scale-98"
                      >
                        <TrendingUp className="w-3 h-3 text-emerald-600" />
                        ＋ 進捗を記録する
                      </button>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-stone-100 flex-wrap gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded border ${diffBadge.color}`}>
                      {diffBadge.label}
                    </span>
                    <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200/60 px-2 py-0.5 rounded flex items-center gap-0.5 font-mono">
                      <Zap className="w-3 h-3 fill-indigo-500 text-indigo-500" />
                      {quest.mpCost} MP
                    </span>
                    <span className="text-[10px] font-mono font-bold text-emerald-700">
                      +{quest.xpReward} XP
                    </span>
                    <span className="text-[10px] font-mono font-bold text-amber-700">
                      +{quest.goldReward} G
                    </span>
                  </div>

                  {!isCompleted ? (
                    <Button
                      onClick={() => handleQuestComplete(quest)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl py-1 px-3 text-xs font-bold shadow-sm active:scale-95"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                      達成
                    </Button>
                  ) : (
                    <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> 達成完了
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </section>

      {/* Quick Add Quest Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-xs mx-auto rounded-3xl p-6 bg-white/95 backdrop-blur-xl border border-stone-100 shadow-2xl">
          <DialogHeader className="text-center">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 mx-auto flex items-center justify-center mb-2 shadow-sm">
              <Plus className="w-5 h-5" />
            </div>
            <DialogTitle className="text-lg font-black text-stone-800">
              クエストを追加
            </DialogTitle>
            <DialogDescription className="text-xs font-medium text-stone-500">
              今日できる具体的なアクションを設定します。
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 max-h-[60vh] overflow-y-auto pr-1">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">クエストタイトル</label>
              <Input 
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="例: 専門書のテキストを25ページ読む"
                className="text-xs rounded-xl font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">詳細・メモ (任意)</label>
              <Textarea 
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="例: 第2章を集中して読む"
                className="text-xs min-h-[50px] resize-none rounded-xl"
              />
            </div>

            {/* Story (Level 1) & Project (Level 2) & Milestone (Level 3) Parent Selector */}
            <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200/80 space-y-2">
              {stories.length > 0 && (
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">
                    所属する大目標（Level 1）
                  </label>
                  <select
                    value={newStoryId}
                    onChange={(e) => {
                      setNewStoryId(e.target.value);
                      setNewProjectId("");
                      setNewMilestoneId("");
                    }}
                    className="w-full text-xs font-bold rounded-xl border border-stone-200 p-2 bg-white text-stone-800"
                  >
                    {stories.map((s) => (
                      <option key={s.id} value={s.id}>
                        👑 {s.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-[10px] font-bold text-stone-500 mb-1">
                  所属プロジェクト（Level 2 手段）
                </label>
                <select
                  value={newProjectId}
                  onChange={(e) => {
                    setNewProjectId(e.target.value);
                    setNewMilestoneId("");
                  }}
                  className="w-full text-xs font-bold rounded-xl border border-stone-200 p-2 bg-white text-stone-800"
                >
                  <option value="">単発クエスト（指定なし）</option>
                  {projects.filter(p => !newStoryId || p.storyId === newStoryId).map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title}
                    </option>
                  ))}
                </select>
              </div>

              {newProjectId && (
                <div>
                  <label className="block text-[10px] font-bold text-stone-500 mb-1">
                    所属マイルストーン（Level 3 工程）
                  </label>
                  <select
                    value={newMilestoneId}
                    onChange={(e) => setNewMilestoneId(e.target.value)}
                    className="w-full text-xs font-bold rounded-xl border border-stone-200 p-2 bg-white text-stone-800"
                  >
                    <option value="">マイルストーンなし</option>
                    {milestones.filter(m => m.projectId === newProjectId).map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Numeric Metric Target Option Toggle */}
            <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200/80">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-700 flex items-center gap-1">
                  <BarChart2 className="w-3.5 h-3.5 text-emerald-600" />
                  数値目標を設定する
                </span>
                <button
                  type="button"
                  onClick={() => setHasMetric(!hasMetric)}
                  className={`w-10 h-6 rounded-full transition-colors relative ${hasMetric ? 'bg-emerald-600' : 'bg-stone-300'}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${hasMetric ? 'left-5' : 'left-1'}`} />
                </button>
              </div>

              {hasMetric && (
                <div className="space-y-2 mt-3 pt-2 border-t border-stone-200/60">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-stone-500 mb-1">目標数値</label>
                      <Input
                        type="number"
                        value={newMetricTarget}
                        onChange={(e) => setNewMetricTarget(e.target.value)}
                        placeholder="例: 213"
                        className="text-xs rounded-xl font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-stone-500 mb-1">単位</label>
                      <Input
                        value={newMetricUnit}
                        onChange={(e) => setNewMetricUnit(e.target.value)}
                        placeholder="例: ページ, 円, km"
                        className="text-xs rounded-xl"
                      />
                    </div>
                  </div>

                  {/* Quick Unit Chips */}
                  <div className="flex flex-wrap gap-1">
                    {["ページ", "円", "km", "回", "分", "本"].map((u) => (
                      <button
                        key={u}
                        type="button"
                        onClick={() => setNewMetricUnit(u)}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${newMetricUnit === u ? 'bg-emerald-600 text-white' : 'bg-white text-stone-600 border border-stone-200'}`}
                      >
                        {u}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">難易度</label>
              <div className="grid grid-cols-3 gap-2">
                {(["easy", "normal", "hard"] as const).map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setNewDiff(d)}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      newDiff === d 
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-xs" 
                        : "bg-stone-50 text-stone-600 border-stone-200"
                    }`}
                  >
                    {d === "easy" ? "初級 (1MP)" : d === "hard" ? "上級 (3MP)" : "中級 (2MP)"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="flex flex-col gap-2 mt-2">
            <Button
              onClick={handleAddQuickQuest}
              disabled={!newTitle.trim()}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl py-5 font-bold text-xs shadow-md"
            >
              クエストを作成
            </Button>
            <Button
              onClick={() => setIsAddModalOpen(false)}
              variant="ghost"
              className="w-full text-stone-400 text-xs font-bold"
            >
              キャンセル
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Quest Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-xs mx-auto rounded-3xl p-6 bg-white/95 backdrop-blur-xl border border-stone-100 shadow-2xl">
          <DialogHeader className="text-center">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 mx-auto flex items-center justify-center mb-2 shadow-sm">
              <Edit3 className="w-5 h-5" />
            </div>
            <DialogTitle className="text-lg font-black text-stone-800">
              クエストを編集
            </DialogTitle>
            <DialogDescription className="text-xs font-medium text-stone-500">
              クエストの内容や所属目標・数値を変更します。
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-left max-h-[60vh] overflow-y-auto pr-1">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">クエスト名</label>
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="例: 参考書を1章読む"
                className="text-xs rounded-xl font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">説明 (任意)</label>
              <Textarea
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                placeholder="例: 集中して25分取り組む"
                className="text-xs min-h-[50px] resize-none rounded-xl"
              />
            </div>

            {/* Hierarchy Selectors in Edit */}
            <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-2">
              <div>
                <label className="block text-[10px] font-bold text-stone-500 mb-1">
                  所属する大目標（Level 1）
                </label>
                <select
                  value={editStoryId}
                  onChange={(e) => {
                    setEditStoryId(e.target.value);
                    setEditProjectId("");
                    setEditMilestoneId("");
                  }}
                  className="w-full text-xs font-bold rounded-xl border border-stone-200 p-2 bg-white text-stone-800"
                >
                  <option value="">大目標なし（フリー）</option>
                  {stories.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-stone-500 mb-1">
                  所属プロジェクト（Level 2 手段）
                </label>
                <select
                  value={editProjectId}
                  onChange={(e) => {
                    setEditProjectId(e.target.value);
                    setEditMilestoneId("");
                  }}
                  className="w-full text-xs font-bold rounded-xl border border-stone-200 p-2 bg-white text-stone-800"
                >
                  <option value="">プロジェクトなし</option>
                  {(editStoryId ? projects.filter(p => p.storyId === editStoryId) : projects).map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title}
                    </option>
                  ))}
                </select>
              </div>

              {editProjectId && (
                <div>
                  <label className="block text-[10px] font-bold text-stone-500 mb-1">
                    所属マイルストーン（Level 3 工程）
                  </label>
                  <select
                    value={editMilestoneId}
                    onChange={(e) => setEditMilestoneId(e.target.value)}
                    className="w-full text-xs font-bold rounded-xl border border-stone-200 p-2 bg-white text-stone-800"
                  >
                    <option value="">マイルストーンなし</option>
                    {milestones.filter(m => m.projectId === editProjectId).map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Numeric Metric Target Option Toggle in Edit */}
            <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200/80">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-700 flex items-center gap-1">
                  <BarChart2 className="w-3.5 h-3.5 text-emerald-600" />
                  数値目標を設定する
                </span>
                <button
                  type="button"
                  onClick={() => setEditHasMetric(!editHasMetric)}
                  className={`w-10 h-6 rounded-full transition-colors relative ${editHasMetric ? 'bg-emerald-600' : 'bg-stone-300'}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${editHasMetric ? 'left-5' : 'left-1'}`} />
                </button>
              </div>

              {editHasMetric && (
                <div className="space-y-2 mt-3 pt-2 border-t border-stone-200/60">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-stone-500 mb-1">目標数値</label>
                      <Input
                        type="number"
                        value={editMetricTarget}
                        onChange={(e) => setEditMetricTarget(e.target.value)}
                        placeholder="例: 213"
                        className="text-xs rounded-xl font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-stone-500 mb-1">単位</label>
                      <Input
                        value={editMetricUnit}
                        onChange={(e) => setEditMetricUnit(e.target.value)}
                        placeholder="例: ページ, 円, km"
                        className="text-xs rounded-xl"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-stone-500 mb-1">現在の累計数値</label>
                    <Input
                      type="number"
                      value={editMetricCurrent}
                      onChange={(e) => setEditMetricCurrent(e.target.value)}
                      placeholder="例: 0"
                      className="text-xs rounded-xl font-mono font-bold"
                    />
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">難易度</label>
              <div className="grid grid-cols-3 gap-2">
                {(["easy", "normal", "hard"] as const).map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setEditDiff(d)}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      editDiff === d 
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-xs" 
                        : "bg-stone-50 text-stone-600 border-stone-200"
                    }`}
                  >
                    {d === "easy" ? "初級 (1MP)" : d === "hard" ? "上級 (3MP)" : "中級 (2MP)"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="flex flex-col gap-2 mt-2">
            <Button
              onClick={handleSaveEdit}
              disabled={!editTitle.trim()}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl py-5 font-bold text-xs shadow-md"
            >
              保存する
            </Button>
            <Button
              onClick={() => setIsEditModalOpen(false)}
              variant="ghost"
              className="w-full text-stone-400 text-xs font-bold"
            >
              キャンセル
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Metric Progress & WHY Modals */}
      <MetricProgressModal
        quest={progressQuest}
        isOpen={!!progressQuest}
        onClose={() => setProgressQuest(null)}
        onProgressUpdated={handleProgressUpdated}
      />

      <WhyExplanationModal
        quest={whyQuest}
        milestone={milestones.find(m => m.id === whyQuest?.milestoneId)}
        mainStory={stories.find(s => s.id === whyQuest?.storyId) || null}
        isOpen={!!whyQuest}
        onClose={() => setWhyQuest(null)}
      />

      <QuestCompletionModal
        quest={completedQuest}
        leveledUp={levelUpData.leveledUp}
        newLevel={levelUpData.newLevel}
        isOpen={!!completedQuest}
        onClose={() => setCompletedQuest(null)}
      />
    </main>
  );
}
