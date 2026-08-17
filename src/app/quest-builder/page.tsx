"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { storage } from "@/services/storage";
import { MainStory } from "@/types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, ArrowRight, Check, Copy, ExternalLink, Sparkles, Hammer } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

export default function QuestBuilderPage() {
  const router = useRouter();
  const [activeStory, setActiveStory] = useState<MainStory | null>(null);
  
  const [milestoneContext, setMilestoneContext] = useState("");
  const [approachContext, setApproachContext] = useState("");
  
  const [promptText, setPromptText] = useState("");
  const [copied, setCopied] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const story = storage.getActiveStory();
    if (story) setActiveStory(story);
  }, []);

  const handleGeneratePrompt = () => {
    if (!activeStory) return;

    const template = `あなたは、人生設計や目標設計を支援する「クエストビルダー」です。
私がこれから取り組む「メインストーリー（長期目標）」と、「最初のマイルストーン」「アプローチの希望」をもとに、
実行可能な小さなステップ（クエスト）の階層構造をすべて【日本語】で作成してください。

【メインストーリー】
タイトル: ${activeStory.title}
目的: ${activeStory.description}

【最初のマイルストーンのイメージ】
${milestoneContext || "特になし（AIから最適なステップを提案してください）"}

【アプローチの希望】
${approachContext || "特になし（AIから最適な進め方を提案してください）"}

---
【出力ルール】
1. タイトル、説明文など、すべてのテキストを必ず【自然で分かりやすい日本語】で出力してください。
2. クエストは「今日・明日からすぐ始められる」具体的な1アクションに落とし込んでください。
3. 難易度は "easy"（初級・消費MP1）、"normal"（中級・消費MP2）、"hard"（上級・消費MP3）のいずれかで設定してください。

AIとしてのアドバイス・解説を出力した後、最後に必ず以下の形式でJSONを出力してください。
JSONの前後に必ず ---CRESTWARD_JSON_START--- と ---CRESTWARD_JSON_END--- を記載してください。

\`\`\`json
---CRESTWARD_JSON_START---
{
  "chapters": [
    {
      "title": "第1章: 基礎知識の収集と環境構築",
      "milestones": [
        {
          "title": "マイルストーン 1: 必要なツールの洗い出しと選定",
          "quests": [
            {
              "title": "参考となる事例や記事を3つ調べる",
              "description": "スマホで検索し、良さそうな事例をブックマークして概要を把握する",
              "difficulty": "easy"
            },
            {
              "title": "必要な道具・アイテムの候補リストを作る",
              "description": "メモ帳やスプレッドシートにリストアップする",
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
          メインストーリーを、今日から実行できる小さなステップ（クエスト）に分解します。
        </p>
      </header>

      {!showPrompt ? (
        <div className="space-y-4">
          <Card className="bg-white border-stone-200 shadow-2xs rounded-2xl">
            <CardContent className="p-4">
              <h3 className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1">現在のストーリー</h3>
              <p className="font-bold text-sm text-stone-800">{activeStory.title}</p>
              {activeStory.description && (
                <p className="text-xs text-stone-500 mt-1">{activeStory.description}</p>
              )}
            </CardContent>
          </Card>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              最初のマイルストーン（中間目標）のイメージはありますか？
            </label>
            <Textarea 
              placeholder="例：まずは必要な道具や材料を揃えるところまで進めたい"
              className="w-full text-xs p-3.5 rounded-2xl bg-white border-stone-200 shadow-inner focus-visible:ring-emerald-500 min-h-[90px] resize-none leading-relaxed"
              value={milestoneContext}
              onChange={(e) => setMilestoneContext(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              どんなアプローチ・ペースで進めたいですか？
            </label>
            <Textarea 
              placeholder="例：本をじっくり読むより、まずは小さく手を動かして試したい"
              className="w-full text-xs p-3.5 rounded-2xl bg-white border-stone-200 shadow-inner focus-visible:ring-emerald-500 min-h-[90px] resize-none leading-relaxed"
              value={approachContext}
              onChange={(e) => setApproachContext(e.target.value)}
            />
          </div>

          <Button 
            onClick={handleGeneratePrompt}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl py-6 text-sm font-bold shadow-lg shadow-emerald-600/25"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            AIクエスト分解プロンプトを生成する
          </Button>

          <div className="text-center pt-1">
            <Button variant="ghost" onClick={() => router.push("/quests")} className="text-stone-400 hover:text-stone-700 text-xs font-bold">
              AIを使わずに手動でクエストを追加する
            </Button>
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
        </div>
      )}
    </div>
  );
}
