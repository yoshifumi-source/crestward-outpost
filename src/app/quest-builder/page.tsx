"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { storage } from "@/services/storage";
import { MainStory, QuestChapter, Milestone, Quest } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  Copy, 
  ExternalLink, 
  Sparkles, 
  Hammer, 
  Wand2, 
  Zap, 
  Clock, 
  HelpCircle,
  Plus,
  Compass,
  Target,
  Edit3,
  ChevronDown
} from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

// Preset option choices for situation
const SITUATION_PRESETS = [
  { id: "unknown", icon: HelpCircle, label: "何から手をつければいいか全く分からない", hint: "（道具調べ・情報収集から始めたい）" },
  { id: "hands_on", icon: Hammer, label: "小さく手を動かして実験から始めたい", hint: "（座学より実践重視）" },
  { id: "busy", icon: Clock, label: "忙しいので1日10〜15分の極小タスクにしたい", hint: "（時短・省エネ重視）" }
];

const PACE_PRESETS = [
  { id: "small", label: "🐢 無理のない超スモールステップ（1日5〜15分）" },
  { id: "weekend", label: "🏃 平日は軽め、休日にしっかり進めるスタイル" },
  { id: "quick_win", label: "⚡️ 最初の1週間で目に見える成果を作りたい" }
];

// Quick Goal Ideas
const GOAL_IDEAS = [
  { title: "副業アプリを開発・リリースして年収100万円アップ", desc: "自作Webプロダクトをリリースし、収益と自由な時間の両立を目指す" },
  { title: "開発・設計の専門書（全213ページ）を読破する", desc: "日々の読書ページ数を記録し、知識とスキルを自分の武器にする" },
  { title: "月間走行距離300kmのランニング習慣をつける", desc: "実年齢マイナス20歳の体力とエネルギーを維持する" },
  { title: "毎朝30分の集中プログラミング時間を確立する", desc: "朝の時間を活用して新しいプロダクトやスキルに没頭する" }
];

export default function QuestBuilderPage() {
  const router = useRouter();
  const [allStories, setAllStories] = useState<MainStory[]>([]);
  const [activeStory, setActiveStory] = useState<MainStory | null>(null);
  
  // Selected choice chips
  const [selectedSituation, setSelectedSituation] = useState<string>("unknown");
  const [selectedPace, setSelectedPace] = useState<string>("small");
  
  // Create / Switch Story Dialogs
  const [isCreateStoryOpen, setIsCreateStoryOpen] = useState(false);
  const [newStoryTitle, setNewStoryTitle] = useState("");
  const [newStoryDesc, setNewStoryDesc] = useState("");

  const [promptText, setPromptText] = useState("");
  const [copied, setCopied] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);

  const loadData = () => {
    const stories = storage.getStories();
    setAllStories(stories);
    const active = stories.find(s => s.status === "active") || stories[0] || null;
    setActiveStory(active);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateNewStory = () => {
    if (!newStoryTitle.trim()) return;

    const stories = storage.getStories();
    // Set old active stories to dormant
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

  const handleGeneratePrompt = (overrideSituation?: string, overridePace?: string) => {
    if (!activeStory) return;

    const sitObj = SITUATION_PRESETS.find(s => s.id === (overrideSituation || selectedSituation));
    const paceObj = PACE_PRESETS.find(p => p.id === (overridePace || selectedPace));

    const situationText = sitObj ? `${sitObj.label} ${sitObj.hint}` : "何から始めればいいか分からないため、AIから最適なステップを提案してください。";
    const paceText = paceObj ? paceObj.label : "無理のない超スモールステップ（1日5〜15分）";

    const template = `あなたは、人生設計・行動変容を支援するプロの「クエストビルダー（RPG設計者）」です。

ユーザーは「${activeStory.title}」という目標（メインクエスト）を設定しました。
この目標を達成するために、実行可能な「第1章〜第3章」のロードマップと、
今日からすぐ始められる具体的なサブクエスト（1回5〜15分程度のアクション）を【100%自然な日本語】で設計してください。

【ユーザーの現在の状況・希望ペース】
- 現在地・心境: ${situationText}
- 希望ペース: ${paceText}

【メインクエスト（目標）】
- タイトル: ${activeStory.title}
- 目的・目指す姿: ${activeStory.description || "自己成長と理想のライフスタイルの実現"}

---
【クエスト設計の黄金ルール】
1. タイトル、説明文、章名など、すべてのテキストを必ず【自然で分かりやすい日本語】で出力してください。（英語のタイトルは一切含めないでください）
2. 構成は以下の3章立てで設計してください：
   - 第1章: 「現状把握と準備フェーズ」（誰でも今日すぐできる情報収集やリストアップなどの初級クエスト）
   - 第2章: 「小さな実践と実験フェーズ」（最初の手応え・成果を得る中級クエスト）
   - 第3章: 「習慣化と発展フェーズ」（目標を形にし継続する上級クエスト）
3. 難易度は "easy"（初級・消費MP1）、"normal"（中級・消費MP2）、"hard"（上級・消費MP3）のいずれかで設定してください。
4. 読書や売上、ランニング距離などの数値目標がある場合は、"metric": { "targetValue": 213, "unit": "ページ" } のように数値目標も含めてください。

まず、ユーザーを応援する温かいアドバイスを出力してください。
その後、アプリが自動取り込みできるよう、必ず末尾に以下の形式でJSONを出力してください。
JSONの前後に必ず ---CRESTWARD_JSON_START--- と ---CRESTWARD_JSON_END--- を記載してください。

\`\`\`json
---CRESTWARD_JSON_START---
{
  "chapters": [
    {
      "title": "第1章: 現状把握と最初の一歩",
      "milestones": [
        {
          "title": "マイルストーン 1: 必要な情報やアイテムの整理",
          "quests": [
            {
              "title": "参考になる事例やWebサイトを3つ調べる",
              "description": "スマホで検索し、良さそうな事例をメモまたはブックマークする（所要時間10分）",
              "difficulty": "easy"
            },
            {
              "title": "必要な道具や材料の候補リストを作成する",
              "description": "スマホのメモ帳に箇条書きでリストアップする（所要時間15分）",
              "difficulty": "easy"
            }
          ]
        }
      ]
    },
    {
      "title": "第2章: 小さな実験と実践",
      "milestones": [
        {
          "title": "マイルストーン 2: 最初のプロトタイプ・試作品を作る",
          "quests": [
            {
              "title": "一番手軽な部分から実際に手を動かして試す",
              "description": "完成度を気にせず、まずは触って手応えを確かめる",
              "difficulty": "normal"
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

    const chapterId1 = `ch_${Date.now()}_1`;
    const chapterId2 = `ch_${Date.now()}_2`;

    const msId1 = `ms_${Date.now()}_1`;
    const msId2 = `ms_${Date.now()}_2`;

    const newChapters: QuestChapter[] = [
      { id: chapterId1, storyId: activeStory.id, title: "第1章: 現状把握と最初の一歩", order: 0, status: "active" },
      { id: chapterId2, storyId: activeStory.id, title: "第2章: 小さな実践と手応えの獲得", order: 1, status: "active" }
    ];

    const newMilestones: Milestone[] = [
      { id: msId1, chapterId: chapterId1, title: "マイルストーン 1: 必要な情報の収集と整理", order: 0, status: "active" },
      { id: msId2, chapterId: chapterId2, title: "マイルストーン 2: 最初の小さな実践・テスト", order: 1, status: "active" }
    ];

    const newQuests: Quest[] = [
      {
        id: `q_${Date.now()}_1`,
        title: "参考になる事例や情報を3つ調べてメモする",
        description: "スマホで検索し、良さそうなやり方やヒントを3つメモする（所要時間10分）",
        storyId: activeStory.id,
        chapterId: chapterId1,
        milestoneId: msId1,
        status: "active",
        difficulty: "easy",
        mpCost: 1,
        xpReward: 50,
        goldReward: 20,
        skillTags: ["情報収集"],
        createdAt: Date.now()
      },
      {
        id: `q_${Date.now()}_2`,
        title: "必要な道具・環境・アイテムのリストを作る",
        description: "手元にあるものと新しく揃えるべきものを整理する",
        storyId: activeStory.id,
        chapterId: chapterId1,
        milestoneId: msId1,
        status: "active",
        difficulty: "easy",
        mpCost: 1,
        xpReward: 50,
        goldReward: 20,
        skillTags: ["計画と準備"],
        createdAt: Date.now() + 1
      },
      {
        id: `q_${Date.now()}_3`,
        title: "一番簡単で楽しい部分を実際に小さく試す",
        description: "完璧を目指さず、まずは15分だけ手を動かして手応えを確かめる",
        storyId: activeStory.id,
        chapterId: chapterId2,
        milestoneId: msId2,
        status: "active",
        difficulty: "normal",
        mpCost: 2,
        xpReward: 100,
        goldReward: 50,
        skillTags: ["実践と実験"],
        createdAt: Date.now() + 2
      }
    ];

    storage.saveChapters([...storage.getChapters().filter(c => c.storyId !== activeStory.id), ...newChapters]);
    storage.saveMilestones([...storage.getMilestones().filter(m => !newChapters.some(c => c.id === m.chapterId)), ...newMilestones]);
    storage.saveQuests([...newQuests, ...storage.getQuests().filter(q => q.storyId !== activeStory.id)]);

    storage.addStoryLog({
      id: `log_${Date.now()}`,
      date: Date.now(),
      type: "story_started",
      title: "クエストラインを構築",
      description: `「${activeStory.title}」のクエストツリーを自動生成しました。`
    });

    alert("🎉 クエストラインを自動生成しました！ストーリー航海図に反映されました。");
    router.push("/story");
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(promptText);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="min-h-screen flex flex-col p-6 max-w-md mx-auto pt-6 pb-24">
      <header className="mb-4">
        <Link href="/" className="inline-flex items-center text-stone-400 hover:text-stone-700 text-xs font-bold mb-3 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1" /> ホームに戻る
        </Link>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Hammer className="w-5 h-5 text-emerald-600" />
            <h1 className="text-xl font-black text-stone-800 tracking-tight">
              クエスト作成工房
            </h1>
          </div>
          <button
            onClick={() => setIsCreateStoryOpen(true)}
            className="text-[11px] font-black text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 px-3 py-1.5 rounded-full flex items-center gap-1 shadow-2xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> 目標を新規作成
          </button>
        </div>
        <p className="text-xs font-medium text-stone-500 mt-1 leading-relaxed">
          目標（メインクエスト）を決め、実行可能なサブクエストを自動生成します。
        </p>
      </header>

      {/* Target Story Header Card */}
      {activeStory ? (
        <Card className="bg-emerald-50/70 border-emerald-200/90 shadow-2xs rounded-2xl mb-4 relative overflow-hidden">
          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-1">
              <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest flex items-center gap-1">
                <Target className="w-3 h-3 text-emerald-600" /> 現在の目標（メインクエスト）
              </span>
              <button
                onClick={() => setIsCreateStoryOpen(true)}
                className="text-[10px] font-bold text-stone-500 hover:text-stone-800 flex items-center gap-0.5 bg-white/80 px-2 py-0.5 rounded-md border border-stone-200"
              >
                変更 <Edit3 className="w-3 h-3" />
              </button>
            </div>
            <h2 className="font-black text-sm text-stone-800 leading-snug">{activeStory.title}</h2>
            {activeStory.description && (
              <p className="text-xs text-stone-600 mt-1 leading-relaxed">{activeStory.description}</p>
            )}

            {/* If there are other stories, allow quick switching */}
            {allStories.length > 1 && (
              <div className="mt-3 pt-2 border-t border-emerald-200/60 flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-bold text-stone-400">他の目標:</span>
                {allStories.filter(s => s.id !== activeStory.id).map(s => (
                  <button
                    key={s.id}
                    onClick={() => handleSelectStory(s.id)}
                    className="text-[10px] font-bold text-stone-600 hover:text-stone-900 bg-white px-2 py-0.5 rounded-md border border-stone-200"
                  >
                    {s.title}
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="p-6 rounded-3xl bg-amber-50 border border-amber-200 text-center mb-4 shadow-sm">
          <Target className="w-10 h-10 text-amber-600 mx-auto mb-2" />
          <h2 className="font-black text-sm text-stone-800 mb-1">まだ目標（メインクエスト）がありません</h2>
          <p className="text-xs text-stone-600 mb-4 leading-relaxed">
            まずは達成したい目標を1つ作成して、そこからサブクエストを展開しましょう！
          </p>
          <Button
            onClick={() => setIsCreateStoryOpen(true)}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl py-5 font-bold text-xs shadow-md"
          >
            <Plus className="w-4 h-4 mr-1.5" /> 自分で目標を作成する
          </Button>
        </div>
      )}

      {!showPrompt ? (
        <div className="space-y-4">
          {/* Primary Quick Choice: AI Full Auto */}
          <div className="p-4 rounded-3xl bg-gradient-to-r from-stone-900 to-stone-800 text-white shadow-lg border border-stone-700">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-black mb-1">
              <Sparkles className="w-4 h-4" /> 一番おすすめ（入力不要）
            </div>
            <p className="text-xs text-stone-300 mb-3 leading-relaxed">
              目標までの道筋が分からなくても大丈夫です。AIが第1章〜第3章と今日できるサブクエストを自動設計します。
            </p>
            <Button 
              disabled={!activeStory}
              onClick={() => handleGeneratePrompt("unknown", "small")}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl py-6 text-sm font-bold shadow-md shadow-emerald-600/30 disabled:opacity-50"
            >
              <Wand2 className="w-4 h-4 mr-2" />
              AIにおまかせでサブクエストを分解する
            </Button>
          </div>

          {/* Selection Option 1: Situation */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-2 px-1">
              今のあなたの状況・現在地に一番近いものは？（タップで選択）
            </label>
            <div className="space-y-2">
              {SITUATION_PRESETS.map((sit) => {
                const Icon = sit.icon;
                const isSelected = selectedSituation === sit.id;
                return (
                  <div
                    key={sit.id}
                    onClick={() => setSelectedSituation(sit.id)}
                    className={`cursor-pointer p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
                      isSelected 
                        ? "bg-white border-emerald-500 shadow-sm ring-1 ring-emerald-500/50" 
                        : "bg-stone-50/70 border-stone-200/80 hover:bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`p-1.5 rounded-xl ${isSelected ? "bg-emerald-100 text-emerald-700" : "bg-stone-200/60 text-stone-500"}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-stone-800 block">{sit.label}</span>
                        <span className="text-[10px] text-stone-500">{sit.hint}</span>
                      </div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selection Option 2: Pace */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-2 px-1">
              どんなペース・進め方が理想ですか？
            </label>
            <div className="space-y-2">
              {PACE_PRESETS.map((p) => {
                const isSelected = selectedPace === p.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => setSelectedPace(p.id)}
                    className={`cursor-pointer p-3 rounded-2xl border transition-all flex items-center justify-between ${
                      isSelected 
                        ? "bg-white border-teal-500 shadow-sm ring-1 ring-teal-500/50" 
                        : "bg-stone-50/70 border-stone-200/80 hover:bg-white"
                    }`}
                  >
                    <span className="text-xs font-bold text-stone-800">{p.label}</span>
                    {isSelected && <Check className="w-4 h-4 text-teal-600 shrink-0" />}
                  </div>
                );
              })}
            </div>
          </div>

          <Button 
            disabled={!activeStory}
            onClick={() => handleGeneratePrompt()}
            className="w-full bg-stone-900 hover:bg-black text-white rounded-2xl py-6 text-sm font-bold shadow-md disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4 mr-2 text-amber-400" />
            選択した条件でAIプロンプトを生成する
          </Button>

          {/* Direct Template Loader (No AI needed) */}
          <div className="pt-2 space-y-2">
            <button
              disabled={!activeStory}
              onClick={handleApplyQuickPreset}
              className="w-full p-3 rounded-2xl bg-amber-50 hover:bg-amber-100 border border-amber-200/80 text-amber-900 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <Zap className="w-3.5 h-3.5 text-amber-600" />
              <span>AIを使わず「黄金の初期クエスト」を今すぐ自動生成する</span>
            </button>

            <button
              onClick={() => router.push("/quests")}
              className="w-full p-2.5 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-600 text-xs font-bold flex items-center justify-center gap-1 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>クエスト掲示板で手動でサブクエストを追加する</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <h3 className="text-[11px] font-black text-stone-400 uppercase tracking-widest mb-2 px-1">
              ステップ 1: プロンプトをコピー
            </h3>
            <Button 
              onClick={handleCopy}
              className="w-full bg-stone-900 hover:bg-black text-white rounded-2xl py-6 text-sm font-bold shadow-md relative overflow-hidden group transition-all"
            >
              {copied ? (
                <span className="flex items-center text-emerald-400">
                  <Check className="w-5 h-5 mr-2" /> コピー完了！
                </span>
              ) : (
                <span className="flex items-center">
                  <Copy className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" /> プロンプトをコピーする
                </span>
              )}
            </Button>
          </div>

          <div>
            <h3 className="text-[11px] font-black text-stone-400 uppercase tracking-widest mb-2 px-1">
              ステップ 2: お使いのAIを開いて貼り付け
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <a 
                href="https://chatgpt.com/" 
                target="_blank" 
                rel="noreferrer" 
                className="flex items-center justify-center p-3 bg-white border border-stone-200 rounded-xl text-xs font-bold text-stone-700 hover:border-emerald-500 shadow-2xs transition-colors"
              >
                ChatGPT を開く <ExternalLink className="w-3.5 h-3.5 ml-1 text-stone-400" />
              </a>
              <a 
                href="https://gemini.google.com/" 
                target="_blank" 
                rel="noreferrer" 
                className="flex items-center justify-center p-3 bg-white border border-stone-200 rounded-xl text-xs font-bold text-stone-700 hover:border-emerald-500 shadow-2xs transition-colors"
              >
                Gemini を開く <ExternalLink className="w-3.5 h-3.5 ml-1 text-stone-400" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-[11px] font-black text-stone-400 uppercase tracking-widest mb-2 px-1">
              生成プロンプトのプレビュー
            </h3>
            <div className="bg-stone-100 border border-stone-200 rounded-2xl p-3.5 h-36 overflow-y-auto text-[11px] font-mono text-stone-600 whitespace-pre-wrap leading-relaxed shadow-inner">
              {promptText}
            </div>
          </div>

          <div className="pt-2">
            <Button 
              onClick={() => router.push("/quest-builder/import")}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl py-6 text-sm font-bold shadow-lg shadow-emerald-600/25"
            >
              クエスト取り込み画面へ進む <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </div>

          <div className="text-center">
            <button
              onClick={() => setShowPrompt(false)}
              className="text-stone-400 hover:text-stone-700 text-xs font-bold"
            >
              条件の選択に戻る
            </button>
          </div>
        </div>
      )}

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

          <div className="space-y-3 py-2 max-h-[60vh] overflow-y-auto pr-1">
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
                目標の理由・目指す情景 (任意)
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
              この目標を設定してクエスト作成へ
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
    </div>
  );
}
