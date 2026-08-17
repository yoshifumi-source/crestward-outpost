"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { storage } from "@/services/storage";
import { MainStory } from "@/types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, ArrowRight, Check, Copy, ExternalLink, Sparkles } from "lucide-react";
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
実行可能な小さなステップ（クエスト）の階層構造を作成してください。

【メインストーリー】
タイトル: ${activeStory.title}
目的: ${activeStory.description}

【最初のマイルストーンのイメージ】
${milestoneContext || "特になし（AIから提案してください）"}

【アプローチの希望】
${approachContext || "特になし（AIから提案してください）"}

---
クエストは「今日・明日からすぐ始められる」具体的な行動に落とし込んでください。
難易度は "easy", "normal", "hard" のいずれかで設定してください。

AIとしてのアドバイスを出力した後、最後に必ず以下のJSONスキーマと互換性のあるJSONを出力してください。
JSONの前後には、
---CRESTWARD_JSON_START---
および
---CRESTWARD_JSON_END---
を付けてください。

\`\`\`json
{
  "chapters": [
    {
      "title": "Chapter 1: 基礎知識の収集と環境構築",
      "milestones": [
        {
          "title": "マイルストーン 1: 必要なツールの洗い出し",
          "quests": [
            {
              "title": "ネットで参考事例を3つ探す",
              "description": "スマホで検索し、良さそうな事例をブックマークする",
              "difficulty": "easy"
            }
          ]
        }
      ]
    }
  ]
}
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
    return <div className="p-6 text-stone-500">アクティブなメインストーリーがありません。</div>;
  }

  return (
    <div className="min-h-screen flex flex-col p-6 max-w-md mx-auto pt-10 pb-20">
      <header className="mb-8">
        <Link href="/" className="inline-flex items-center text-stone-400 hover:text-stone-600 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1" /> Home
        </Link>
        <h1 className="text-2xl font-black text-stone-800 tracking-tight mb-2">
          Quest Builder
        </h1>
        <p className="text-sm font-medium text-stone-500">
          メインストーリーを具体的なクエストに分解します。
        </p>
      </header>

      {!showPrompt ? (
        <div className="space-y-6">
          <Card className="bg-white/80 border-stone-200">
            <CardContent className="p-4">
              <h3 className="text-xs font-black text-stone-500 uppercase tracking-widest mb-1">現在のストーリー</h3>
              <p className="font-bold text-stone-800">{activeStory.title}</p>
            </CardContent>
          </Card>

          <div>
            <label className="block text-xs font-bold text-stone-500 mb-2">
              最初のマイルストーン（中間目標）のイメージはありますか？
            </label>
            <Textarea 
              placeholder="例：まずは必要な道具を揃えるところまで"
              className="w-full text-sm p-4 rounded-2xl bg-white/80 border-white shadow-inner focus-visible:ring-emerald-500 min-h-[100px] resize-none"
              value={milestoneContext}
              onChange={(e) => setMilestoneContext(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-500 mb-2">
              どんなアプローチで進めたいですか？
            </label>
            <Textarea 
              placeholder="例：本を読むより、まずは小さく手を動かして試したい"
              className="w-full text-sm p-4 rounded-2xl bg-white/80 border-white shadow-inner focus-visible:ring-emerald-500 min-h-[100px] resize-none"
              value={approachContext}
              onChange={(e) => setApproachContext(e.target.value)}
            />
          </div>

          <Button 
            onClick={handleGeneratePrompt}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-full py-6 text-lg font-bold shadow-md shadow-emerald-600/20"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            Generate AI Prompt
          </Button>

          <div className="text-center">
            <Button variant="ghost" onClick={() => router.push("/")} className="text-stone-400 hover:text-stone-600 text-xs font-bold">
              手動でクエストを追加する (Skip AI)
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="mb-2">
            <h3 className="text-xs font-black text-stone-500 uppercase tracking-widest mb-3">1. Copy Prompt</h3>
            <Button 
              onClick={handleCopy}
              className="w-full bg-stone-800 hover:bg-stone-900 text-white rounded-2xl py-8 text-lg font-bold shadow-md relative overflow-hidden group"
            >
              {copied ? (
                <span className="flex items-center text-emerald-400">
                  <Check className="w-5 h-5 mr-2" /> Copied!
                </span>
              ) : (
                <span className="flex items-center">
                  <Copy className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" /> Copy Prompt
                </span>
              )}
            </Button>
          </div>

          <div className="mb-2">
            <h3 className="text-xs font-black text-stone-500 uppercase tracking-widest mb-3">2. Open AI</h3>
            <div className="flex gap-2">
              <a href="https://chatgpt.com/" target="_blank" rel="noreferrer" className="flex-1 flex items-center justify-center p-3 bg-white border border-stone-200 rounded-xl text-sm font-bold text-stone-700 hover:border-stone-400 transition-colors">
                ChatGPT <ExternalLink className="w-3 h-3 ml-1" />
              </a>
              <a href="https://gemini.google.com/" target="_blank" rel="noreferrer" className="flex-1 flex items-center justify-center p-3 bg-white border border-stone-200 rounded-xl text-sm font-bold text-stone-700 hover:border-stone-400 transition-colors">
                Gemini <ExternalLink className="w-3 h-3 ml-1" />
              </a>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-xs font-black text-stone-500 uppercase tracking-widest mb-3 text-center">3. Import Data</h3>
            <Button 
              onClick={() => router.push("/quest-builder/import")}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-full py-6 text-base font-bold shadow-md shadow-emerald-600/20"
            >
              Go to Import Screen <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
