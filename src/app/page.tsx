"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { storage } from "@/services/storage";
import { UserSettings, MainStory, Quest, Experiment, Skill, QuestChapter, Milestone, FutureVision, GoalProject } from "@/types";
import { AdventurerStatusCard } from "@/components/AdventurerStatusCard";
import { DailyCheckInModal } from "@/components/DailyCheckInModal";
import { QuestCompletionModal } from "@/components/QuestCompletionModal";
import { WhyExplanationModal } from "@/components/WhyExplanationModal";
import { MetricProgressModal } from "@/components/MetricProgressModal";
import { Button } from "@/components/ui/button";
import { 
  Sparkles, 
  HelpCircle, 
  CheckCircle2, 
  Plus, 
  Compass, 
  Flame, 
  FlaskConical, 
  ArrowRight,
  RefreshCw,
  Zap,
  TrendingUp,
  Trash2,
  BookOpen,
  FolderKanban
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function HomePage() {
  const router = useRouter();
  const [isLoaded, setIsLoaded] = useState(false);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [mainStory, setMainStory] = useState<MainStory | null>(null);
  const [futureVision, setFutureVision] = useState<FutureVision | null>(null);
  const [projects, setProjects] = useState<GoalProject[]>([]);
  const [todaysQuests, setTodaysQuests] = useState<Quest[]>([]);
  const [activeExperiments, setActiveExperiments] = useState<Experiment[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [chapters, setChapters] = useState<QuestChapter[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);

  // Modals state
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const [completedQuest, setCompletedQuest] = useState<Quest | null>(null);
  const [levelUpData, setLevelUpData] = useState<{ leveledUp: boolean; newLevel: number }>({ leveledUp: false, newLevel: 1 });
  const [whyQuest, setWhyQuest] = useState<Quest | null>(null);
  const [progressQuest, setProgressQuest] = useState<Quest | null>(null);

  const loadData = () => {
    const st = storage.getSettings();
    setSettings(st);

    if (!st.onboardingCompleted) {
      router.push("/onboarding");
      return;
    }

    const stories = storage.getStories();
    const active = stories.find(s => s.status === "active") || null;
    setMainStory(active);
    setFutureVision(storage.getFutureVision());
    setProjects(storage.getProjects());

    const allQuests = storage.getQuests();
    setTodaysQuests(allQuests.filter(q => q.status === "active"));

    const exps = storage.getExperiments();
    setActiveExperiments(exps.filter(e => e.status === "active"));

    setSkills(storage.getSkills());
    setChapters(storage.getChapters());
    setMilestones(storage.getMilestones());
    setIsLoaded(true);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleQuestComplete = (quest: Quest) => {
    const st = storage.getSettings();
    if (st.currentMp < quest.mpCost) {
      alert(`MPが足りません（必要MP: ${quest.mpCost} / 現在MP: ${st.currentMp}）。朝のチェックインで回復するか、難易度の低いクエストを選びましょう！`);
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

  const handleLoadSample = () => {
    storage.loadSamplePreset();
    loadData();
  };

  if (!isLoaded || !settings) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-stone-500 font-bold">
        冒険の準備中...
      </div>
    );
  }

  return (
    <main className="flex flex-col min-h-screen p-4 pb-28 mx-auto max-w-md">
      {/* Top App Header & Guide Link */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[11px] font-black text-stone-600 uppercase tracking-wider font-mono">
            CRESTWARD OUTPOST
          </span>
        </div>
        <button
          onClick={() => router.push("/guide")}
          className="text-[11px] font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 px-2.5 py-1 rounded-full flex items-center gap-1 shadow-2xs transition-colors"
        >
          <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
          使い方ガイド
        </button>
      </div>

      {/* Adventurer Status Card */}
      <AdventurerStatusCard 
        settings={settings} 
        skills={skills} 
        onOpenCheckIn={() => setIsCheckInOpen(true)} 
      />

      {/* Main Story Focus Banner */}
      {mainStory ? (
        <section className="mb-6">
          <div className="flex items-center justify-between mb-2 px-1">
            <h2 className="text-[11px] font-black text-stone-500 uppercase tracking-widest flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-emerald-600" />
              戦略的大目標（メインストーリー）
            </h2>
            <button 
              onClick={() => router.push("/story")}
              className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-0.5"
            >
              多階層ツリーへ <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div 
            onClick={() => router.push("/story")}
            className="cursor-pointer glass-panel p-4 rounded-3xl border border-stone-200/80 shadow-sm hover:shadow-md transition-all group bg-gradient-to-br from-white to-stone-50/70"
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-black text-sm text-stone-800 group-hover:text-emerald-700 transition-colors leading-snug">
                {mainStory.title}
              </h3>
              <span className="shrink-0 text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                進行中
              </span>
            </div>
            <p className="text-xs font-medium text-stone-500 line-clamp-2 leading-relaxed mb-3">
              {mainStory.description}
            </p>

            <div className="flex items-center justify-between text-[11px] font-bold text-stone-600 mb-1">
              <span>全体の統合達成度</span>
              <span className="font-mono text-emerald-700 font-black">{mainStory.progress}%</span>
            </div>
            <Progress value={mainStory.progress} className="h-2 bg-stone-100 *:bg-emerald-600" />

            {/* Sub-projects preview pills */}
            {projects.length > 0 && (
              <div className="mt-3 pt-2.5 border-t border-stone-200/60 flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-bold text-stone-400">達成手段:</span>
                {projects.map(p => (
                  <span key={p.id} className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200/50 px-2 py-0.5 rounded-md">
                    {p.title} ({p.progress}%)
                  </span>
                ))}
              </div>
            )}
          </div>
        </section>
      ) : (
        <div className="mb-6 p-4 rounded-3xl bg-amber-50/80 border border-amber-200/80 text-center">
          <Compass className="w-8 h-8 text-amber-600 mx-auto mb-2" />
          <h3 className="font-black text-sm text-stone-800">メインストーリーが未設定です</h3>
          <p className="text-xs font-medium text-stone-600 my-2">
            まずはコンパスで価値観を見つけるか、サンプルデータを読み込んでみましょう。
          </p>
          <div className="flex gap-2 mt-3">
            <Button 
              onClick={handleLoadSample}
              className="flex-1 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold py-2 shadow-sm"
            >
              サンプルで体験
            </Button>
            <Button 
              onClick={() => router.push("/story")}
              variant="outline"
              className="flex-1 border-amber-400 text-amber-800 text-xs font-bold rounded-xl"
            >
              目標を直接作成
            </Button>
          </div>
        </div>
      )}

      {/* Active Experiments */}
      {activeExperiments.length > 0 && (
        <section className="mb-6">
          <div className="flex items-center justify-between mb-2 px-1">
            <h2 className="text-[11px] font-black text-stone-500 uppercase tracking-widest flex items-center gap-1.5">
              <FlaskConical className="w-3.5 h-3.5 text-teal-600" />
              小さく試す30日間の実験
            </h2>
          </div>
          <div className="space-y-2.5">
            {activeExperiments.map((exp) => {
              const daysPassed = Math.floor((Date.now() - (exp.startedAt || Date.now())) / (1000 * 60 * 60 * 24));
              const remaining = Math.max(0, (exp.durationDays || 30) - daysPassed);
              return (
                <div key={exp.id} className="p-4 rounded-2xl bg-teal-50/70 border border-teal-200/70 shadow-sm">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-bold text-xs text-teal-950">{exp.title}</h4>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-teal-200/60 text-teal-800">
                      残り {remaining} 日
                    </span>
                  </div>
                  {exp.description && (
                    <p className="text-[11px] font-medium text-teal-800/80 mb-2 leading-relaxed">
                      {exp.description}
                    </p>
                  )}
                  <Progress value={(daysPassed / (exp.durationDays || 30)) * 100} className="h-1.5 bg-teal-200/50 *:bg-teal-600" />
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Today's Active Quests */}
      <section className="mb-6">
        <div className="flex justify-between items-center mb-3 px-1">
          <h2 className="text-[11px] font-black text-stone-500 uppercase tracking-widest flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            本日のクエスト
          </h2>
          <button
            onClick={() => router.push("/quests")}
            className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/60"
          >
            <Plus className="w-3 h-3" /> クエスト一覧
          </button>
        </div>

        {todaysQuests.length === 0 ? (
          <div className="glass-panel p-6 rounded-3xl border border-dashed border-stone-300 text-center shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-stone-100 text-stone-400 mx-auto flex items-center justify-center mb-3">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-sm text-stone-800">現在アクティブなクエストはありません</h3>
            <p className="text-xs font-medium text-stone-500 mt-1 mb-4">
              航海図からクエストを追加するか、サンプルデータを読み込みましょう。
            </p>
            <div className="flex flex-col gap-2">
              <Button 
                onClick={() => router.push("/story")}
                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl py-5 font-bold text-xs shadow-md shadow-emerald-600/20"
              >
                多階層ツリーを開く
              </Button>
              <Button 
                onClick={handleLoadSample}
                variant="ghost"
                className="text-stone-500 hover:text-stone-800 text-xs font-bold"
              >
                <RefreshCw className="w-3.5 h-3.5 mr-1" /> サンプルクエストを読み込む
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {todaysQuests.map((quest) => {
              const diffBadge = quest.difficulty === "easy" 
                ? { label: "初級", color: "bg-emerald-50 text-emerald-700 border-emerald-200" }
                : quest.difficulty === "hard"
                ? { label: "上級", color: "bg-rose-50 text-rose-700 border-rose-200" }
                : { label: "中級", color: "bg-amber-50 text-amber-700 border-amber-200" };

              const proj = projects.find(p => p.id === quest.projectId);
              const ms = milestones.find(m => m.id === quest.milestoneId);
              const metric = quest.metric;
              const percent = metric ? Math.min(100, Math.round((metric.currentValue / metric.targetValue) * 1000) / 10) : 0;

              return (
                <div 
                  key={quest.id} 
                  className="glass-panel p-4 rounded-2xl border border-stone-200/80 shadow-sm hover:shadow-md transition-all relative group overflow-hidden"
                >
                  {/* Project & Milestone Hierarchy Tag */}
                  {(proj || ms) && (
                    <div className="flex items-center gap-1.5 flex-wrap mb-1.5">
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
                  )}

                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-md border ${diffBadge.color}`}>
                          {diffBadge.label}
                        </span>
                        <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200/60 px-2 py-0.5 rounded-md flex items-center gap-0.5 font-mono">
                          <Zap className="w-3 h-3 fill-indigo-500 text-indigo-500" />
                          消費 {quest.mpCost} MP
                        </span>
                      </div>
                      <h4 className="font-black text-sm text-stone-800 leading-snug">
                        {quest.title}
                      </h4>
                    </div>

                    {/* Actions (WHY & Delete) */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => setWhyQuest(quest)}
                        className="p-1.5 rounded-full bg-stone-100 hover:bg-amber-100 text-stone-400 hover:text-amber-700 transition-colors shadow-inner"
                        title="なぜこのクエストをやるのか？"
                      >
                        <HelpCircle className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteQuest(quest)}
                        className="p-1.5 rounded-full bg-stone-100 hover:bg-rose-100 text-stone-400 hover:text-rose-600 transition-colors shadow-inner"
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

                  {/* Numeric Metric Progress Bar */}
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
                      
                      <button
                        onClick={() => setProgressQuest(quest)}
                        className="w-full py-1.5 px-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/80 text-[11px] font-bold flex items-center justify-center gap-1 transition-colors active:scale-98"
                      >
                        <TrendingUp className="w-3 h-3 text-emerald-600" />
                        ＋ 進捗を記録する
                      </button>
                    </div>
                  )}

                  {/* Rewards & Complete Action */}
                  <div className="flex items-center justify-between pt-2 border-t border-stone-100">
                    <div className="flex items-center gap-2 text-[11px] font-mono font-bold">
                      <span className="text-emerald-700 flex items-center gap-0.5">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-500" /> +{quest.xpReward} XP
                      </span>
                      <span className="text-amber-700 flex items-center gap-0.5">
                        +{quest.goldReward} G
                      </span>
                    </div>

                    <Button
                      onClick={() => handleQuestComplete(quest)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl py-1.5 px-4 text-xs font-bold shadow-sm active:scale-95 transition-transform"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                      達成！
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Modals */}
      <DailyCheckInModal 
        isOpen={isCheckInOpen} 
        onClose={() => setIsCheckInOpen(false)} 
        onCheckInComplete={loadData} 
      />

      <MetricProgressModal
        quest={progressQuest}
        isOpen={!!progressQuest}
        onClose={() => setProgressQuest(null)}
        onProgressUpdated={handleProgressUpdated}
      />

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
        futureVision={futureVision}
        isOpen={!!whyQuest}
        onClose={() => setWhyQuest(null)}
      />
    </main>
  );
}
