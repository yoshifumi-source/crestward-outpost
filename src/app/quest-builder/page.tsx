"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { storage } from "@/services/storage";
import { MainStory, GoalProject, Milestone, Quest } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Wand2, 
  Copy, 
  Check, 
  ArrowRight, 
  ArrowLeft, 
  Sparkles, 
  Layers, 
  Compass, 
  Target, 
  Plus, 
  BookOpen, 
  CheckCircle2, 
  FolderKanban,
  Zap 
} from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

const SITUATION_PRESETS = [
  { id: "zero", label: "何から手をつければいいか全く分からない", hint: "現状把握や必要な情報・道具集めからスタート" },
  { id: "vague", label: "やりたい気持ちはあるが、忙しくて時間が取れない", hint: "1日5〜10分の極小タスクに分解して習慣化" },
  { id: "tried", label: "過去に挫折したことがある / リベンジしたい", hint: "ハードルを徹底的に下げて最初の成功体験を作る" },
  { id: "motivated", label: "やる気はあるので最短ルートを知りたい", hint: "コアとなる重要タスクに集中して最速で成果を出す" }
];

const PACE_PRESETS = [
  { id: "micro", label: "超スモールステップ（1日5〜15分 / MP1）", desc: "無理なく確実に継続できる最優先ペース" },
  { id: "balanced", label: "バランス型（1日15〜30分 / MP2）", desc: "日々の習慣と前進を実感できる標準ペース" },
  { id: "challenge", label: "集中攻略型（1日30分〜1時間 / MP3）", desc: "短期間で一気に進めたいときのブースト" }
];

const GOAL_PRESETS = [
  { title: "お金に不自由しない生活（副業で年収100万円アップ）", desc: "自作アプリや講演、物販など複数の収益トラックを確立する" },
  { title: "開発・設計の専門書（全213ページ）を読破する", desc: "日々の読書ページ数を記録し、知識とスキルを自分の武器にする" },
  { title: "月間走行距離300kmのランニング習慣をつける", desc: "実年齢マイナス20歳の体力とエネルギーを維持する" },
  { title: "毎朝30分の集中プログラミング時間を確立する", desc: "朝の時間を活用して新しいプロダクトやスキルに没頭する" }
];

export default function QuestBuilderPage() {
  const router = useRouter();
  const [isLoaded, setIsLoaded] = useState(false);
  const [allStories, setAllStories] = useState<MainStory[]>([]);
  const [activeStory, setActiveStory] = useState<MainStory | null>(null);
  
  // Custom goal creation dialog
  const [isCreateStoryOpen, setIsCreateStoryOpen] = useState(false);
  const [newStoryTitle, setNewStoryTitle] = useState("");
  const [newStoryDesc, setNewStoryDesc] = useState("");

  const [selectedSituation, setSelectedSituation] = useState("zero");
  const [selectedPace, setSelectedPace] = useState("micro");
  const [copied, setCopied] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [promptText, setPromptText] = useState("");

  const loadData = () => {
    const stories = storage.getStories();
    setAllStories(stories);
    const active = stories.find(s => s.status === "active") || stories[0] || null;
    setActiveStory(active);
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

  const handleGeneratePrompt = (overrideSituation?: string, overridePace?: string) => {
    if (!activeStory) return;

    const sitObj = SITUATION_PRESETS.find(s => s.id === (overrideSituation || selectedSituation));
    const paceObj = PACE_PRESETS.find(p => p.id === (overridePace || selectedPace));

    const situationText = sitObj ? `${sitObj.label} ${sitObj.hint}` : "何から始めればいいか分からないため、AIから最適なステップを提案してください。";
    const paceText = paceObj ? paceObj.label : "無理のない超スモールステップ（1日5〜15分）";

    const template = `あなたは、人生設計・目標達成・行動変容を支援する世界最高峰の「多階層クエストアーキテクト（RPG設計者）」です。

ユーザーは「${activeStory.title}」という大目標（メインストーリー）を設定しました。
この目標を達成するために、【複数の達成手段（プロジェクト / トラック）】と、それぞれの【工程（マイルストーン）】、そして今日からすぐ始められる【極小クエスト（1回5〜15分のアクション）】へと多階層に分解してください。

【ユーザーの現在の状況・希望ペース】
- 現在地・心境: ${situationText}
- 希望ペース: ${paceText}

【戦略的大目標（メインストーリー）】
- タイトル: ${activeStory.title}
- 目的・目指す姿: ${activeStory.description || "自己成長と理想のライフスタイルの実現"}

---
【多階層分解の黄金ルール】
1. タイトル、説明文、プロジェクト名など、すべてのテキストを必ず【自然で分かりやすい日本語】で出力してください。（英語のタイトルは一切含めないでください）
2. 大目標に対して、2〜3個の独立した「達成手段（プロジェクト）」を設計してください。
   （例: 「副業で100万」であれば、「📱 自作アプリの販売で稼ぐ」「🎤 社外講演・出張で稼ぐ」「📦 物品販売で月1万稼ぐ」など）
3. 各プロジェクトの中に、2〜3段階の「工程（マイルストーン）」を設けてください。
   （例: 「① 開発のための学習・インプット」「② v1.0 プロトタイプ開発」「③ リリース & 改善」など）
4. 各マイルストーンの下に、今日できる1〜2個の「クエスト」を配置してください。
5. 難易度は "easy"（初級・消費MP1）、"normal"（中級・消費MP2）、"hard"（上級・消費MP3）のいずれかで設定してください。
6. 読書ページ数や売上金額、ランニング距離などの数値目標がある場合は、"metric": { "targetValue": 213, "unit": "ページ" } のように数値目標も含めてください。

まず、ユーザーを応援する温かいアドバイスを出力してください。
その後、アプリが自動取り込みできるよう、必ず末尾に以下の形式でJSONを出力してください。
JSONの前後に必ず ---CRESTWARD_JSON_START--- と ---CRESTWARD_JSON_END--- を記載してください。

\`\`\`json
---CRESTWARD_JSON_START---
{
  "projects": [
    {
      "title": "📱 自作アプリの販売・リリースで稼ぐ",
      "description": "Web/スマホアプリを開発・公開し、月5〜10万円のストック収益を作る",
      "milestones": [
        {
          "title": "① アプリ開発のための学習・インプット",
          "quests": [
            {
              "title": "アプリ開発の専門書テキストを探して選定する",
              "description": "最適な技術書・チュートリアルを1冊選んで用意する（所要時間10分）",
              "difficulty": "easy"
            },
            {
              "title": "専門書（全213ページ）を読み進める",
              "description": "日々の読書ページ数を記録し、知識をインプットする",
              "difficulty": "normal",
              "metric": {
                "targetValue": 213,
                "currentValue": 0,
                "unit": "ページ"
              }
            }
          ]
        },
        {
          "title": "② v1.0 プロトタイプ開発",
          "quests": [
            {
              "title": "開発ツールの選定と初期環境セットアップ",
              "description": "エディタやフレームワークの準備を整える（所要時間15分）",
              "difficulty": "easy"
            },
            {
              "title": "v1.0 コア機能の実装",
              "description": "一番大事なコア機能のみを最小構成で実装する",
              "difficulty": "hard"
            }
          ]
        }
      ]
    },
    {
      "title": "🎤 職場外グループでの講演・出張で稼ぐ",
      "description": "専門知識や知見を活かして研修・セミナーを行い、副収入を得る",
      "milestones": [
        {
          "title": "① 講演テーマ選定と企画書・スライド作成",
          "quests": [
            {
              "title": "得意分野の講演テーマ案を3つ書き出す",
              "description": "自分が話せて相手の役に立つトピックを箇条書きで整理する",
              "difficulty": "easy"
            }
          ]
        }
      ]
    }
  ]
}
---CRESTWARD_JSON_END---
\`\`\`
`;

    setPromptText(template);
    setShowPrompt(true);
  };

  const handleApplyQuickPreset = () => {
    if (!activeStory) return;

    const now = Date.now();
    const proj1Id = `proj_${now}_1`;
    const proj2Id = `proj_${now}_2`;

    const ms1Id = `ms_${now}_1`;
    const ms2Id = `ms_${now}_2`;
    const ms3Id = `ms_${now}_3`;

    const newProjects: GoalProject[] = [
      {
        id: proj1Id,
        storyId: activeStory.id,
        title: "📱 自作アプリの販売・リリースで稼ぐ",
        description: "Web/スマホアプリを開発・公開し、ストック収益を作る",
        order: 0,
        status: "active",
        progress: 0,
        createdAt: now
      },
      {
        id: proj2Id,
        storyId: activeStory.id,
        title: "🎤 職場外グループでの講演・出張で稼ぐ",
        description: "専門知識や知見を活かして研修・セミナーを行い副収入を得る",
        order: 1,
        status: "active",
        progress: 0,
        createdAt: now
      }
    ];

    const newMilestones: Milestone[] = [
      { id: ms1Id, chapterId: "ch_default", projectId: proj1Id, title: "① アプリ開発のための学習・インプット", order: 0, status: "active" },
      { id: ms2Id, chapterId: "ch_default", projectId: proj1Id, title: "② v1.0 プロトタイプ開発", order: 1, status: "active" },
      { id: ms3Id, chapterId: "ch_default", projectId: proj2Id, title: "① 講演テーマ選定と企画書作成", order: 0, status: "active" }
    ];

    const newQuests: Quest[] = [
      {
        id: `q_${now}_1`,
        title: "アプリ開発の専門書テキストを探して選定する",
        description: "最適な技術書・チュートリアルを1冊選んで用意する（所要時間10分）",
        storyId: activeStory.id,
        projectId: proj1Id,
        milestoneId: ms1Id,
        status: "active",
        difficulty: "easy",
        mpCost: 1,
        xpReward: 40,
        goldReward: 20,
        skillTags: ["情報収集", "学習"],
        createdAt: now
      },
      {
        id: `q_${now}_2`,
        title: "専門書（全213ページ）を読み進める",
        description: "日々の読書ページ数を記録し、知識をインプットする",
        storyId: activeStory.id,
        projectId: proj1Id,
        milestoneId: ms1Id,
        status: "active",
        difficulty: "normal",
        mpCost: 2,
        xpReward: 80,
        goldReward: 40,
        skillTags: ["学習", "プログラミング"],
        metric: {
          targetValue: 213,
          currentValue: 0,
          unit: "ページ",
          history: []
        },
        createdAt: now
      },
      {
        id: `q_${now}_3`,
        title: "開発ツールの選定と初期環境セットアップ",
        description: "エディタやフレームワークの準備を整える（所要時間15分）",
        storyId: activeStory.id,
        projectId: proj1Id,
        milestoneId: ms2Id,
        status: "active",
        difficulty: "easy",
        mpCost: 1,
        xpReward: 50,
        goldReward: 25,
        skillTags: ["エンジニアリング"],
        createdAt: now
      },
      {
        id: `q_${now}_4`,
        title: "得意分野の講演テーマ案を3つ書き出す",
        description: "自分が話せて相手の役に立つトピックを箇条書きで整理する",
        storyId: activeStory.id,
        projectId: proj2Id,
        milestoneId: ms3Id,
        status: "active",
        difficulty: "easy",
        mpCost: 1,
        xpReward: 40,
        goldReward: 20,
        skillTags: ["発信", "企画"],
        createdAt: now
      }
    ];

    const currentProjects = storage.getProjects();
    const currentMilestones = storage.getMilestones();
    const currentQuests = storage.getQuests();

    storage.saveProjects([...currentProjects, ...newProjects]);
    storage.saveMilestones([...currentMilestones, ...newMilestones]);
    storage.saveQuests([...currentQuests, ...newQuests]);

    storage.recalculateStoryProgress(activeStory.id);
    router.push("/story");
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(promptText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isLoaded) {
    return <div className="p-6 text-stone-500 font-bold">工房を準備しています...</div>;
  }

  return (
    <main className="flex flex-col min-h-screen p-4 pb-28 mx-auto max-w-md">
      {/* Header */}
      <header className="mb-4 pt-1">
        <div className="flex items-center justify-between mb-3 px-1">
          <Link href="/quests" className="inline-flex items-center text-stone-400 hover:text-stone-700 text-xs font-bold transition-colors">
            <ArrowLeft className="w-4 h-4 mr-1" /> クエスト一覧に戻る
          </Link>
          <button
            onClick={() => router.push("/guide")}
            className="text-[11px] font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 px-2.5 py-1 rounded-full flex items-center gap-1 shadow-2xs transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
            使い方ガイド
          </button>
        </div>

        <div className="flex items-center gap-2 mb-1 px-1">
          <Wand2 className="w-5 h-5 text-indigo-600" />
          <h1 className="text-xl font-black text-stone-800 tracking-tight">
            多階層クエスト作成工房
          </h1>
        </div>
        <p className="text-xs font-medium text-stone-500 px-1 leading-relaxed">
          大目標を「複数の手段（プロジェクト）」「工程（マイルストーン）」「今日できるアクション」へとAIが多階層に分解します。
        </p>
      </header>

      {/* Target Goal (Story) Selector */}
      <section className="mb-5">
        <div className="flex justify-between items-center mb-2 px-1">
          <label className="text-[11px] font-black text-stone-500 uppercase tracking-widest flex items-center gap-1">
            <Compass className="w-3.5 h-3.5 text-emerald-600" />
            分解対象の大目標（メインストーリー）
          </label>
          <button
            onClick={() => setIsCreateStoryOpen(true)}
            className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-full border border-emerald-200/80 transition-colors shadow-2xs"
          >
            <Plus className="w-3 h-3" /> ＋目標を新規作成
          </button>
        </div>

        {allStories.length === 0 ? (
          <Card className="rounded-3xl border-dashed border-stone-300 p-5 text-center bg-stone-50/50">
            <Target className="w-8 h-8 text-stone-400 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-stone-700">目標が登録されていません</h3>
            <p className="text-xs text-stone-500 my-2">まずは達成したい大目標を1つ作成しましょう。</p>
            <Button
              onClick={() => setIsCreateStoryOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl py-2 px-4 text-xs font-bold shadow-sm"
            >
              <Plus className="w-3.5 h-3.5 mr-1" /> 目標を作成する
            </Button>
          </Card>
        ) : (
          <div className="glass-panel p-4 rounded-2xl border border-stone-200 shadow-sm bg-gradient-to-br from-white to-stone-50/70">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                選択中の大目標
              </span>
              {allStories.length > 1 && (
                <span className="text-[10px] font-bold text-stone-400">
                  全 {allStories.length} 件
                </span>
              )}
            </div>
            <h3 className="font-black text-sm text-stone-900 leading-snug mb-1">
              {activeStory?.title}
            </h3>
            {activeStory?.description && (
              <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
                {activeStory.description}
              </p>
            )}

            {/* Story Switcher Pills */}
            {allStories.length > 1 && (
              <div className="mt-3 pt-2.5 border-t border-stone-200/60 flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-bold text-stone-400">切り替え:</span>
                {allStories.map(s => (
                  <button
                    key={s.id}
                    onClick={() => handleSelectStory(s.id)}
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md transition-all ${
                      s.id === activeStory?.id 
                        ? "bg-emerald-600 text-white font-black shadow-xs" 
                        : "bg-stone-100 hover:bg-stone-200 text-stone-600"
                    }`}
                  >
                    {s.title}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      {/* Step 1: Current Situation Presets */}
      <section className="mb-5">
        <label className="text-[11px] font-black text-stone-500 uppercase tracking-widest block mb-2 px-1">
          Step 1: あなたの現在の心境・現在地
        </label>
        <div className="grid grid-cols-1 gap-2">
          {SITUATION_PRESETS.map((sit) => (
            <div
              key={sit.id}
              onClick={() => setSelectedSituation(sit.id)}
              className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                selectedSituation === sit.id
                  ? "bg-indigo-50/80 border-indigo-500 shadow-sm ring-1 ring-indigo-500"
                  : "bg-white border-stone-200/80 hover:bg-stone-50"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold ${selectedSituation === sit.id ? 'text-indigo-950' : 'text-stone-800'}`}>
                  {sit.label}
                </span>
                {selectedSituation === sit.id && <Sparkles className="w-3.5 h-3.5 text-indigo-600 shrink-0" />}
              </div>
              <p className="text-[10px] text-stone-500 mt-0.5 leading-relaxed">
                {sit.hint}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Step 2: Pace Selector */}
      <section className="mb-6">
        <label className="text-[11px] font-black text-stone-500 uppercase tracking-widest block mb-2 px-1">
          Step 2: 進めたい希望ペース
        </label>
        <div className="grid grid-cols-1 gap-2">
          {PACE_PRESETS.map((pace) => (
            <div
              key={pace.id}
              onClick={() => setSelectedPace(pace.id)}
              className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                selectedPace === pace.id
                  ? "bg-emerald-50/80 border-emerald-500 shadow-sm ring-1 ring-emerald-500"
                  : "bg-white border-stone-200/80 hover:bg-stone-50"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold ${selectedPace === pace.id ? 'text-emerald-950' : 'text-stone-800'}`}>
                  {pace.label}
                </span>
                {selectedPace === pace.id && <Zap className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
              </div>
              <p className="text-[10px] text-stone-500 mt-0.5 leading-relaxed">
                {pace.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Action Buttons */}
      <div className="space-y-2.5">
        <Button
          onClick={() => handleGeneratePrompt()}
          disabled={!activeStory}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl py-6 text-sm font-bold shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          AIにおまかせで多階層ツリーを分解する
        </Button>

        {/* 1-Click Multi-Tier Preset Button */}
        <Button
          onClick={handleApplyQuickPreset}
          disabled={!activeStory}
          variant="outline"
          className="w-full border-stone-300 hover:bg-stone-50 text-stone-700 rounded-2xl py-5 text-xs font-bold flex items-center justify-center gap-1.5"
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          AIを使わず「黄金の多階層ツリー」を今すぐ自動生成
        </Button>
      </div>

      {/* Prompt Result Modal */}
      <Dialog open={showPrompt} onOpenChange={setShowPrompt}>
        <DialogContent className="max-w-md mx-auto rounded-3xl p-6 bg-white/95 backdrop-blur-xl border border-stone-100 shadow-2xl">
          <DialogHeader className="text-center">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-200 mx-auto flex items-center justify-center mb-2 shadow-sm">
              <Sparkles className="w-6 h-6" />
            </div>
            <DialogTitle className="text-lg font-black text-stone-800">
              AIへのプロンプトが完成しました
            </DialogTitle>
            <DialogDescription className="text-xs font-medium text-stone-500">
              このプロンプトをコピーして、ChatGPTやGeminiに貼り付けてください。
            </DialogDescription>
          </DialogHeader>

          <div className="my-2">
            <Textarea
              readOnly
              value={promptText}
              className="text-xs font-mono min-h-[200px] resize-none rounded-2xl bg-stone-50 border-stone-200 p-3 leading-relaxed"
            />
          </div>

          <DialogFooter className="flex flex-col gap-2 mt-2">
            <Button
              onClick={copyToClipboard}
              className="w-full bg-stone-900 hover:bg-black text-white rounded-2xl py-5 font-bold text-xs shadow-md flex items-center justify-center gap-1.5"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  プロンプトをコピーしました！
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  プロンプトをコピー
                </>
              )}
            </Button>
            <Button
              onClick={() => router.push("/quest-builder/import")}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl py-5 font-bold text-xs shadow-md flex items-center justify-center gap-1.5"
            >
              AIの回答を取り込む画面へ進む <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Custom Story Dialog */}
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
              あなたが目指したい大きなゴールを設定します。
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-left max-h-[60vh] overflow-y-auto pr-1">
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

            {/* Quick Goal Presets */}
            <div>
              <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1.5">
                💡 目標のアイデア例（タップで入力）
              </label>
              <div className="space-y-1.5">
                {GOAL_PRESETS.map((preset, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      setNewStoryTitle(preset.title);
                      setNewStoryDesc(preset.desc);
                    }}
                    className="p-2.5 rounded-xl bg-stone-50 hover:bg-emerald-50/80 border border-stone-200/70 hover:border-emerald-300 cursor-pointer text-left transition-all"
                  >
                    <span className="text-xs font-bold text-stone-800 block">{preset.title}</span>
                    <span className="text-[10px] text-stone-500 line-clamp-1">{preset.desc}</span>
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
    </main>
  );
}
