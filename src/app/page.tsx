"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { storage } from "@/services/storage";
import { UserSettings, MainStory, Quest, Experiment, Skill, QuestChapter, Milestone, FutureVision, Value, GoalProject } from "@/types";
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
  FolderKanban,
  Crown,
  Edit3,
  Hammer,
  Shield,
  Coins
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function HomePage() {
  const router = useRouter();
  const [isLoaded, setIsLoaded] = useState(false);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  
  // Level 1
  const [futureVision, setFutureVision] = useState<FutureVision | null>(null);
  const [values, setValues] = useState<Value[]>([]);
  
  // Level 2 (Multiple active stories)
  const [stories, setStories] = useState<MainStory[]>([]);

  // Level 3, 4, 5
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
    // If completely empty storage (first launch on brand new device), seed sample preset
    const existingStories = storage.getStories();
    const existingQuests = storage.getQuests();
    const existingValues = storage.getValues();

    if (existingStories.length === 0 && existingQuests.length === 0 && existingValues.length === 0) {
      storage.loadSamplePreset();
    }

    const st = storage.getSettings();
    setSettings(st);

    // Level 1
    setFutureVision(storage.getFutureVision());
    setValues(storage.getValues());

    // Level 2: All active stories
    const activeStories = storage.getStories().filter(s => s.status === "active");
    setStories(activeStories);

    // Level 3, 4, 5
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
    <main className="w-full max-w-6xl mx-auto p-4 md:p-8 pb-28 md:pb-12">
      {/* Top Mobile Header (Hidden on Desktop) */}
      <div className="flex md:hidden items-center justify-between mb-3 px-1">
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

      {/* ========================================================================= */}
      {/* 🌟 LEVEL 1: ALWAYS-VISIBLE ROOT VISION BANNER (常時表示の究極の理想) */}
      {/* ========================================================================= */}
      <section className="mb-6">
        <div className="p-5 md:p-6 rounded-3xl bg-gradient-to-br from-purple-950 via-stone-900 to-indigo-950 text-white border border-purple-800/40 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-purple-500/30 text-purple-200 border border-purple-400/30 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Level 1: 究極の理想・価値観 (ROOT)
            </span>
            <button
              onClick={() => router.push("/story")}
              className="text-xs font-bold text-purple-300 hover:text-white flex items-center gap-1 bg-white/10 px-3 py-1 rounded-full transition-colors"
            >
              航海図で編集 <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <p className="text-sm md:text-base font-bold text-stone-100 leading-relaxed mb-3 font-sans">
            {futureVision?.content || "お金と時間に縛られず、自分が誇れるプロダクトを世界に届けながら豊かに暮らす人生"}
          </p>

          {values.length > 0 && (
            <div className="pt-3 border-t border-purple-800/50 flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-bold text-purple-300 font-mono">コア価値観:</span>
              {values.map(v => (
                <span 
                  key={v.id}
                  className="text-[10px] font-bold px-2.5 py-0.5 rounded-lg bg-purple-900/60 text-purple-200 border border-purple-500/30 font-mono"
                >
                  {v.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 💻 RESPONSIVE 2-COLUMN DASHBOARD (PC: Left 2 cols, Right 1 col) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ========================================================================= */}
        {/* 👑 LEFT MAIN COLUMN (Level 2 Goals & Today's Quests) */}
        {/* ========================================================================= */}
        <div className="lg:col-span-2 space-y-6">
          {/* Level 2: Multiple Concurrent Goals */}
          <section>
            <div className="flex items-center justify-between mb-3 px-1">
              <h2 className="text-xs font-black text-stone-500 uppercase tracking-widest flex items-center gap-1.5">
                <Crown className="w-4 h-4 text-amber-500" />
                Level 2: 進行中の大目標（全 {stories.length} 件）
              </h2>
              <button 
                onClick={() => router.push("/story")}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/60"
              >
                多階層ツリーへ <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {stories.length === 0 ? (
              <div className="p-6 rounded-3xl bg-amber-50/80 border border-amber-200/80 text-center">
                <Compass className="w-10 h-10 text-amber-600 mx-auto mb-2" />
                <h3 className="font-black text-sm text-stone-800">大目標が未設定です</h3>
                <p className="text-xs font-medium text-stone-600 my-2">
                  サンプルデータを読み込むか、目標を新設しましょう。
                </p>
                <div className="flex gap-2 mt-3 max-w-xs mx-auto">
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
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {stories.map(story => {
                  const storyProjects = projects.filter(p => p.storyId === story.id);

                  return (
                    <div 
                      key={story.id}
                      onClick={() => router.push("/story")}
                      className="cursor-pointer glass-panel p-4 rounded-3xl border border-stone-200/80 shadow-sm hover:shadow-md transition-all group bg-gradient-to-br from-white to-stone-50/70 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex justify-between items-start mb-1.5">
                          <h3 className="font-black text-sm text-stone-800 group-hover:text-emerald-700 transition-colors leading-snug">
                            {story.title}
                          </h3>
                          <span className="shrink-0 text-[10px] font-mono font-black px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 ml-2">
                            {story.progress}%
                          </span>
                        </div>

                        <p className="text-xs font-medium text-stone-500 line-clamp-2 leading-relaxed mb-3">
                          {story.description}
                        </p>
                      </div>

                      <div>
                        <Progress value={story.progress} className="h-1.5 bg-stone-100 *:bg-emerald-600" />

                        {/* Sub-projects pills */}
                        {storyProjects.length > 0 && (
                          <div className="mt-3 pt-2.5 border-t border-stone-200/60 flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] font-bold text-stone-400">手段:</span>
                            {storyProjects.map(p => (
                              <span key={p.id} className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200/50 px-2 py-0.5 rounded-md">
                                {p.title} ({p.progress}%)
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Today's Active Quests */}
          <section>
            <div className="flex justify-between items-center mb-3 px-1">
              <h2 className="text-xs font-black text-stone-500 uppercase tracking-widest flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-amber-500" />
                本日のクエスト（{todaysQuests.length} 件）
              </h2>
              <button
                onClick={() => router.push("/quests")}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/60"
              >
                <Plus className="w-3.5 h-3.5" /> クエスト一覧・追加
              </button>
            </div>

            {todaysQuests.length === 0 ? (
              <div className="glass-panel p-8 rounded-3xl border border-dashed border-stone-300 text-center shadow-sm">
                <div className="w-12 h-12 rounded-2xl bg-stone-100 text-stone-400 mx-auto flex items-center justify-center mb-3">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-sm text-stone-800">現在アクティブなクエストはありません</h3>
                <p className="text-xs font-medium text-stone-500 mt-1 mb-4">
                  航海図からクエストを追加するか、サンプルデータを読み込みましょう。
                </p>
                <div className="flex flex-col sm:flex-row gap-2 max-w-sm mx-auto">
                  <Button 
                    onClick={() => router.push("/story")}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl py-5 font-bold text-xs shadow-md shadow-emerald-600/20"
                  >
                    多階層ツリーを開く
                  </Button>
                  <Button 
                    onClick={handleLoadSample}
                    variant="outline"
                    className="flex-1 text-stone-600 border-stone-300 text-xs font-bold rounded-2xl"
                  >
                    <RefreshCw className="w-3.5 h-3.5 mr-1" /> サンプル読込
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

                  const story = stories.find(s => s.id === quest.storyId);
                  const proj = projects.find(p => p.id === quest.projectId);
                  const ms = milestones.find(m => m.id === quest.milestoneId);
                  const metric = quest.metric;
                  const percent = metric ? Math.min(100, Math.round((metric.currentValue / metric.targetValue) * 1000) / 10) : 0;

                  return (
                    <div 
                      key={quest.id} 
                      className="glass-panel p-4 md:p-5 rounded-2xl border border-stone-200/80 shadow-sm hover:shadow-md transition-all relative group overflow-hidden"
                    >
                      {/* Goal & Project Hierarchy Tag */}
                      {(story || proj || ms) && (
                        <div className="flex items-center gap-1.5 flex-wrap mb-2">
                          {story && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 font-mono text-[10px] font-black border border-emerald-200/60">
                              <Crown className="w-3 h-3 text-amber-500" /> {story.title}
                            </span>
                          )}
                          {proj && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-mono text-[10px] font-black border border-indigo-200/60">
                              <FolderKanban className="w-3 h-3" /> {proj.title}
                            </span>
                          )}
                          {ms && (
                            <span className="inline-block px-2 py-0.5 rounded-md bg-stone-100 text-stone-500 font-mono text-[10px] font-black">
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
                          <h4 className="font-black text-sm md:text-base text-stone-800 leading-snug">
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
                            <HelpCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteQuest(quest)}
                            className="p-1.5 rounded-full bg-stone-100 hover:bg-rose-100 text-stone-400 hover:text-rose-600 transition-colors shadow-inner"
                            title="クエストを削除"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {quest.description && (
                        <p className="text-xs md:text-sm font-medium text-stone-500 mb-3 leading-relaxed">
                          {quest.description}
                        </p>
                      )}

                      {/* Numeric Metric Progress Bar */}
                      {metric && (
                        <div className="p-3 rounded-xl bg-stone-50/90 border border-stone-200/70 mb-3">
                          <div className="flex justify-between items-baseline mb-1.5 text-xs font-bold">
                            <span className="text-stone-400 text-[10px] font-black uppercase">到達度</span>
                            <div className="font-mono">
                              <span className="text-emerald-700 font-black text-sm">{metric.currentValue.toLocaleString()}</span>
                              <span className="text-stone-400 mx-1">/</span>
                              <span className="text-stone-600">{metric.targetValue.toLocaleString()} {metric.unit}</span>
                              <span className="ml-1.5 text-xs text-emerald-600 font-black">({percent}%)</span>
                            </div>
                          </div>
                          <Progress value={percent} className="h-2 bg-stone-200/60 *:bg-emerald-600 mb-2" />
                          
                          <button
                            onClick={() => setProgressQuest(quest)}
                            className="w-full py-1.5 px-3 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/80 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors active:scale-98"
                          >
                            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                            ＋ 進捗を記録する
                          </button>
                        </div>
                      )}

                      {/* Rewards & Complete Action */}
                      <div className="flex items-center justify-between pt-2.5 border-t border-stone-100">
                        <div className="flex items-center gap-3 text-xs font-mono font-bold">
                          <span className="text-emerald-700 flex items-center gap-1">
                            <Sparkles className="w-4 h-4 text-emerald-500" /> +{quest.xpReward} XP
                          </span>
                          <span className="text-amber-700 flex items-center gap-1">
                            +{quest.goldReward} G
                          </span>
                        </div>

                        <Button
                          onClick={() => handleQuestComplete(quest)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl py-2 px-5 text-xs font-bold shadow-sm active:scale-95 transition-transform"
                        >
                          <CheckCircle2 className="w-4 h-4 mr-1.5" />
                          達成！
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        {/* ========================================================================= */}
        {/* 🛡️ RIGHT SIDEBAR COLUMN (Adventurer Status, Experiments, Quick Tools) */}
        {/* ========================================================================= */}
        <div className="lg:col-span-1 space-y-6">
          {/* Adventurer Status Card */}
          <AdventurerStatusCard 
            settings={settings} 
            skills={skills} 
            onOpenCheckIn={() => setIsCheckInOpen(true)} 
          />

          {/* Active Experiments */}
          {activeExperiments.length > 0 && (
            <section className="glass-panel p-4 md:p-5 rounded-3xl border border-stone-200/80 shadow-sm">
              <div className="flex items-center justify-between mb-3 px-1">
                <h3 className="text-xs font-black text-stone-500 uppercase tracking-widest flex items-center gap-1.5">
                  <FlaskConical className="w-4 h-4 text-teal-600" />
                  小さく試す30日間の実験
                </h3>
              </div>
              <div className="space-y-3">
                {activeExperiments.map((exp) => {
                  const daysPassed = Math.floor((Date.now() - (exp.startedAt || Date.now())) / (1000 * 60 * 60 * 24));
                  const remaining = Math.max(0, (exp.durationDays || 30) - daysPassed);
                  return (
                    <div key={exp.id} className="p-3.5 rounded-2xl bg-teal-50/70 border border-teal-200/70 shadow-2xs">
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

          {/* Quick Hub Panel */}
          <section className="glass-panel p-4 md:p-5 rounded-3xl border border-stone-200/80 shadow-sm">
            <h3 className="text-xs font-black text-stone-500 uppercase tracking-widest mb-3 px-1">
              クイックメニュー
            </h3>
            <div className="space-y-2">
              <button
                onClick={() => router.push("/quest-builder")}
                className="w-full p-3 rounded-2xl bg-stone-50 hover:bg-stone-100 border border-stone-200/80 text-left flex items-center justify-between text-xs font-bold text-stone-800 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 bg-amber-100 text-amber-800 rounded-xl">
                    <Hammer className="w-4 h-4" />
                  </div>
                  <div>
                    <div>クエスト作成工房</div>
                    <div className="text-[10px] font-normal text-stone-400">AIに目標からクエストを逆算させる</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-stone-400" />
              </button>

              <button
                onClick={() => router.push("/guide")}
                className="w-full p-3 rounded-2xl bg-stone-50 hover:bg-stone-100 border border-stone-200/80 text-left flex items-center justify-between text-xs font-bold text-stone-800 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 bg-emerald-100 text-emerald-800 rounded-xl">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <div>公式使い方ガイド</div>
                    <div className="text-[10px] font-normal text-stone-400">アプリの使い方と逆算の極意</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-stone-400" />
              </button>

              <button
                onClick={() => router.push("/profile")}
                className="w-full p-3 rounded-2xl bg-stone-50 hover:bg-stone-100 border border-stone-200/80 text-left flex items-center justify-between text-xs font-bold text-stone-800 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 bg-indigo-100 text-indigo-800 rounded-xl">
                    <Compass className="w-4 h-4" />
                  </div>
                  <div>
                    <div>自己の羅針盤 ＆ バックアップ</div>
                    <div className="text-[10px] font-normal text-stone-400">価値観の確認とデータの保存/復元</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-stone-400" />
              </button>
            </div>
          </section>
        </div>
      </div>

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
        mainStory={stories.find(s => s.id === whyQuest?.storyId) || null}
        futureVision={futureVision}
        isOpen={!!whyQuest}
        onClose={() => setWhyQuest(null)}
      />
    </main>
  );
}
