"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { storage } from "@/services/storage";
import { Quest, QuestChapter, Milestone, QuestDifficulty, MainStory } from "@/types";
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
  Coins 
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { QuestCompletionModal } from "@/components/QuestCompletionModal";
import { WhyExplanationModal } from "@/components/WhyExplanationModal";

export default function QuestsPage() {
  const router = useRouter();
  const [quests, setQuests] = useState<Quest[]>([]);
  const [chapters, setChapters] = useState<QuestChapter[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [mainStory, setMainStory] = useState<MainStory | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "completed">("active");
  const [diffFilter, setDiffFilter] = useState<"all" | "easy" | "normal" | "hard">("all");

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newDiff, setNewDiff] = useState<QuestDifficulty>("normal");
  const [newSkillTag, setNewSkillTag] = useState("");

  const [completedQuest, setCompletedQuest] = useState<Quest | null>(null);
  const [levelUpData, setLevelUpData] = useState<{ leveledUp: boolean; newLevel: number }>({ leveledUp: false, newLevel: 1 });
  const [whyQuest, setWhyQuest] = useState<Quest | null>(null);

  const loadData = () => {
    setQuests(storage.getQuests());
    setChapters(storage.getChapters());
    setMilestones(storage.getMilestones());
    setMainStory(storage.getActiveStory() || null);
  };

  useEffect(() => {
    loadData();
  }, []);

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

  const handleAddQuickQuest = () => {
    if (!newTitle.trim()) return;

    const mpCost = newDiff === "easy" ? 1 : newDiff === "hard" ? 3 : 2;
    const xpReward = newDiff === "easy" ? 40 : newDiff === "hard" ? 140 : 80;
    const goldReward = newDiff === "easy" ? 20 : newDiff === "hard" ? 70 : 40;

    const newQuest: Quest = {
      id: `q_${Date.now()}`,
      title: newTitle.trim(),
      description: newDesc.trim(),
      storyId: mainStory?.id || "custom",
      status: "active",
      difficulty: newDiff,
      mpCost,
      xpReward,
      goldReward,
      skillTags: newSkillTag.trim() ? [newSkillTag.trim()] : ["自己研鑽"],
      createdAt: Date.now()
    };

    const allQuests = storage.getQuests();
    storage.saveQuests([newQuest, ...allQuests]);

    setIsAddModalOpen(false);
    setNewTitle("");
    setNewDesc("");
    setNewSkillTag("");
    loadData();
  };

  // Filtered Quests
  const filteredQuests = quests.filter(q => {
    if (statusFilter !== "all" && q.status !== statusFilter) return false;
    if (diffFilter !== "all" && q.difficulty !== diffFilter) return false;
    return true;
  });

  return (
    <main className="flex flex-col min-h-screen p-4 pb-28 mx-auto max-w-md">
      {/* Header */}
      <header className="mb-4 pt-2">
        <div className="flex items-center justify-between mb-2 px-1">
          <div className="flex items-center gap-1.5">
            <Target className="w-4 h-4 text-emerald-600" />
            <h1 className="text-[11px] font-black text-emerald-800 uppercase tracking-widest">
              クエスト掲示板
            </h1>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1 rounded-full border border-emerald-200/80 flex items-center gap-1 transition-colors"
            >
              <Plus className="w-3 h-3" /> クイック追加
            </button>
            <button
              onClick={() => router.push("/quest-builder")}
              className="text-[11px] font-bold text-stone-700 bg-stone-100 hover:bg-stone-200 px-3 py-1 rounded-full border border-stone-200 flex items-center gap-1 transition-colors"
            >
              <Sparkles className="w-3 h-3 text-amber-500" /> AI作成
            </button>
          </div>
        </div>
        <h2 className="text-xl font-black text-stone-800 leading-snug px-1">
          実行可能なクエスト一覧
        </h2>
      </header>

      {/* Filter Tabs */}
      <div className="mb-4 flex flex-col gap-2">
        <div className="flex bg-stone-200/60 p-1 rounded-2xl">
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

        {/* Difficulty filter chips */}
        <div className="flex gap-1.5 overflow-x-auto py-1">
          {(["all", "easy", "normal", "hard"] as const).map((d) => (
            <button
              key={d}
              onClick={() => setDiffFilter(d)}
              className={`px-3 py-1 rounded-xl text-[11px] font-bold shrink-0 transition-all ${
                diffFilter === d 
                  ? "bg-stone-800 text-white shadow-xs" 
                  : "bg-white text-stone-600 border border-stone-200/80 hover:bg-stone-50"
              }`}
            >
              {d === "all" ? "難易度: すべて" : d === "easy" ? "初級" : d === "hard" ? "上級" : "中級"}
            </button>
          ))}
        </div>
      </div>

      {/* Quests List */}
      <section className="space-y-3 mb-8">
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
            const ms = milestones.find(m => m.id === quest.milestoneId);

            const diffBadge = quest.difficulty === "easy" 
              ? { label: "初級", color: "bg-emerald-50 text-emerald-700 border-emerald-200" }
              : quest.difficulty === "hard"
              ? { label: "上級", color: "bg-rose-50 text-rose-700 border-rose-200" }
              : { label: "中級", color: "bg-amber-50 text-amber-700 border-amber-200" };

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
                    {ms && (
                      <span className="inline-block px-2 py-0.5 rounded bg-stone-100 text-stone-500 font-mono text-[9px] font-black uppercase mb-1">
                        {ms.title}
                      </span>
                    )}
                    <h3 className={`font-black text-sm leading-snug ${isCompleted ? 'text-stone-500 line-through' : 'text-stone-800'}`}>
                      {quest.title}
                    </h3>
                  </div>

                  {/* WHY button */}
                  <button
                    onClick={() => setWhyQuest(quest)}
                    className="p-1.5 rounded-full bg-stone-100 hover:bg-amber-100 text-stone-400 hover:text-amber-700 transition-colors shrink-0"
                    title="なぜこのクエストをやるのか？"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                  </button>
                </div>

                {quest.description && (
                  <p className="text-xs font-medium text-stone-500 mb-3 leading-relaxed">
                    {quest.description}
                  </p>
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
                      <CheckCircle2 className="w-4 h-4" /> 完了済み
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
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 mx-auto flex items-center justify-center mb-2 shadow-sm">
              <Plus className="w-6 h-6" />
            </div>
            <DialogTitle className="text-lg font-black text-stone-800">
              クイッククエスト追加
            </DialogTitle>
            <DialogDescription className="text-xs font-medium text-stone-500">
              今日やるべき具体的なアクションを登録します。
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">タイトル</label>
              <Input 
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="例: 参考書籍の第1章を読む"
                className="text-xs rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">詳細・メモ (任意)</label>
              <Textarea 
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="例: 気になった箇所に付箋を貼る"
                className="text-xs min-h-[70px] resize-none rounded-xl"
              />
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

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">強化スキルタグ (任意)</label>
              <Input 
                value={newSkillTag}
                onChange={(e) => setNewSkillTag(e.target.value)}
                placeholder="例: プログラミング, 読書, 体力作り"
                className="text-xs rounded-xl"
              />
            </div>
          </div>

          <DialogFooter className="flex flex-col gap-2 mt-2">
            <Button
              onClick={handleAddQuickQuest}
              disabled={!newTitle.trim()}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl py-5 font-bold text-xs shadow-md"
            >
              クエストを登録する
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Completion & Why Modals */}
      <QuestCompletionModal
        quest={completedQuest}
        leveledUp={levelUpData.leveledUp}
        newLevel={levelUpData.newLevel}
        isOpen={!!completedQuest}
        onClose={() => setCompletedQuest(null)}
      />

      <WhyExplanationModal
        quest={whyQuest}
        chapter={chapters.find(c => c.id === whyQuest?.chapterId)}
        milestone={milestones.find(m => m.id === whyQuest?.milestoneId)}
        mainStory={mainStory}
        futureVision={storage.getFutureVision()}
        isOpen={!!whyQuest}
        onClose={() => setWhyQuest(null)}
      />
    </main>
  );
}
