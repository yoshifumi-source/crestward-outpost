"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { storage } from "@/services/storage";
import { MainStory, QuestChapter, Milestone, Quest } from "@/types";
import { Button } from "@/components/ui/button";
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
  ShieldCheck, 
  HelpCircle,
  Play
} from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

// Preset option choices
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

export default function QuestBuilderPage() {
  const router = useRouter();
  const [activeStory, setActiveStory] = useState<MainStory | null>(null);
  
  // Selected choice chips
  const [selectedSituation, setSelectedSituation] = useState<string>("unknown");
  const [selectedPace, setSelectedPace] = useState<string>("small");
  
  const [promptText, setPromptText] = useState("");
  const [copied, setCopied] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const story = storage.getActiveStory();
    if (story) setActiveStory(story);
  }, []);

  const handleGeneratePrompt = (overrideSituation?: string, overridePace?: string) => {
    if (!activeStory) return;

    const sitObj = SITUATION_PRESETS.find(s => s.id === (overrideSituation || selectedSituation));
    const paceObj = PACE_PRESETS.find(p => p.id === (overridePace || selectedPace));

    const situationText = sitObj ? `${sitObj.label} ${sitObj.hint}` : "何から始めればいいか分からないため、AIから最適なステップを提案してください。";
    const paceText = paceObj ? paceObj.label : "無理のない超スモールステップ（1日5〜15分）";

    const template = `あなたは、人生設計・行動変容を支援するプロの「クエストビルダー（RPG設計者）」です。

ユーザーは「${activeStory.title}」という大きなメインストーリー（目標）を持っていますが、
遠い目標であるため「最初の中間目標（マイルストーン）や、具体的に今日明日何から手をつければいいのか」が分からない状態です。

あなた（AI）が導き手として、このストーリーを達成するための「第1章〜第3章」のロードマップと、
今日からすぐ始められる具体的なクエスト（1回5〜15分程度のアクション）を【100%自然な日本語】で設計してください。

【ユーザーの現在の状況・希望ペース】
- 現在地・心境: ${situationText}
- 希望ペース: ${paceText}

【メインストーリー（目標）】
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

まず、ユーザーを応援する温かいアドバイスと解説を出力してください。
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

    // Direct 1-click template creation without needing external AI
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

  if (!activeStory) {
    return (
      <div className="min-h-screen flex flex-col p-6 max-w-md mx-auto pt-10 text-center">
        <p className="text-stone-500 font-bold mb-4">進行中のメインストーリーがありません。</p>
        <Link href="/profile" className="text-emerald-600 font-bold text-xs underline">
          自己探索ガイドからストーリーを作成する
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col p-6 max-w-md mx-auto pt-6 pb-24">
      <header className="mb-5">
        <Link href="/" className="inline-flex items-center text-stone-400 hover:text-stone-700 text-xs font-bold mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1" /> ホームに戻る
        </Link>
        <div className="flex items-center gap-2 mb-1">
          <Hammer className="w-5 h-5 text-emerald-600" />
          <h1 className="text-xl font-black text-stone-800 tracking-tight">
            クエスト作成工房
          </h1>
        </div>
        <p className="text-xs font-medium text-stone-500 leading-relaxed">
          大きな目標（ストーリー）を、今日すぐできる「小さなクエスト」にAIが自動分解します。
        </p>
      </header>

      {!showPrompt ? (
        <div className="space-y-4">
          {/* Target Story Card */}
          <Card className="bg-emerald-50/60 border-emerald-200/80 shadow-2xs rounded-2xl">
            <CardContent className="p-4">
              <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest block mb-1">
                分解するメインストーリー
              </span>
              <h2 className="font-black text-sm text-stone-800 leading-snug">{activeStory.title}</h2>
              {activeStory.description && (
                <p className="text-xs text-stone-600 mt-1 leading-relaxed">{activeStory.description}</p>
              )}
            </CardContent>
          </Card>

          {/* Primary Quick Choice: AI Full Auto */}
          <div className="p-4 rounded-3xl bg-gradient-to-r from-stone-900 to-stone-800 text-white shadow-lg border border-stone-700">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-black mb-1">
              <Sparkles className="w-4 h-4" /> 一番おすすめ（入力不要）
            </div>
            <p className="text-xs text-stone-300 mb-3 leading-relaxed">
              目標までの道筋が分からなくても大丈夫です。AIが第1章〜第3章と今日できるクエストを自動設計します。
            </p>
            <Button 
              onClick={() => handleGeneratePrompt("unknown", "small")}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl py-6 text-sm font-bold shadow-md shadow-emerald-600/30"
            >
              <Wand2 className="w-4 h-4 mr-2" />
              AIにおまかせでクエストを分解する
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
            onClick={() => handleGeneratePrompt()}
            className="w-full bg-stone-900 hover:bg-black text-white rounded-2xl py-6 text-sm font-bold shadow-md"
          >
            <Sparkles className="w-4 h-4 mr-2 text-amber-400" />
            選択した条件でAIプロンプトを生成する
          </Button>

          {/* Direct Template Loader (No AI needed) */}
          <div className="pt-2">
            <button
              onClick={handleApplyQuickPreset}
              className="w-full p-3 rounded-2xl bg-amber-50 hover:bg-amber-100 border border-amber-200/80 text-amber-900 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Zap className="w-3.5 h-3.5 text-amber-600" />
              <span>AIを使わず「黄金の初期クエスト」を今すぐ自動生成する</span>
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
    </div>
  );
}
