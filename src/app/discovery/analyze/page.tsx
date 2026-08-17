"use client";

import { useEffect, useState } from "react";
import { storage } from "@/services/storage";
import { DiscoveryEvidence } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Check, Copy, ExternalLink, ShieldAlert, ArrowLeft, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AnalyzeDiscoveryPage() {
  const router = useRouter();
  const [evidences, setEvidences] = useState<DiscoveryEvidence[]>([]);
  const [promptText, setPromptText] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const allEvidences = storage.getDiscoveryEvidences();
    // Deduplicate evidences by content to prevent duplicate records
    const uniqueMap = new Map<string, DiscoveryEvidence>();
    allEvidences.filter(e => e.includedInAnalysis).forEach(e => {
      const trimmed = e.content.trim();
      if (trimmed && !uniqueMap.has(trimmed)) {
        uniqueMap.set(trimmed, e);
      }
    });

    const uniqueEvidences = Array.from(uniqueMap.values());
    setEvidences(uniqueEvidences);

    const typeNames: Record<string, string> = {
      journal: "日記・メモ",
      frustration: "変えたい不満・違和感",
      aspiration: "憧れ・理想の未来",
      joy: "喜び・充実",
      envy: "羨望",
      flow: "没頭・フロー",
      custom: "自己探索の記録"
    };

    const evidenceText = uniqueEvidences
      .map((e, i) => `【記録 ${i + 1} (${typeNames[e.type] || e.type})】\n${e.content}`)
      .join("\n\n");

    const template = `あなたは、人生設計、行動変容、目標設計を支援するプロフェッショナルな分析者です。

以下は私自身が書いた自己探索（日記や日頃の違和感、憧れなど）の記録です。
この文章から、私の人生を決めつけるのではなく、「この人にはこういう傾向や大切にしたい価値観があるのではないか」という仮説として、すべて【日本語】で分析してください。

【重要な出力指示】
1. タイトル、説明文、価値観名など、すべての項目を必ず【自然で分かりやすい日本語】で出力してください。（英語のタイトルは一切使わないでください）
   例:
   - 良い例: "改善による成長", "自己効力感と自律", "能力を通じた貢献", "家族と個人の調和"
   - 避ける例: "Growth through improvement", "Desire for effective self-control"
2. 価値観を断定せず、「○○を大切にしている可能性があります」という丁寧な仮説として提示してください。
3. 価値観そのものを安易に目標に変換しないでください。必ず「現状 (Current State)」→「理想 (Desired State)」→「未来の情景 (Future Scene)」→「物語の候補 (Story Candidate)」の順序で逆算して組み立ててください。

まず人間が読みやすい分析・考察の文章を出力してください。
その後、アプリが取り込めるよう、必ず末尾に以下の形式でJSONを出力してください。
JSONの前後に必ず ---CRESTWARD_JSON_START--- と ---CRESTWARD_JSON_END--- を記載してください。

\`\`\`json
---CRESTWARD_JSON_START---
{
  "patterns": [
    {
      "title": "改善による自己成長",
      "description": "日常の不便や非効率を自分の工夫で少しずつ改善していくことに、深い充実感を感じている可能性があります。",
      "confidence": "high"
    },
    {
      "title": "自律と自己コントロールへの欲求",
      "description": "周囲に流されず、自分の時間やペースを自分でコントロールしたいという強い意志が見られます。",
      "confidence": "high"
    },
    {
      "title": "能力を通じた価値提供と貢献",
      "description": "自身の専門性やスキルを高め、誰かの役に立ったり価値を届けることにやりがいを感じています。",
      "confidence": "medium"
    }
  ],
  "values": [
    {
      "name": "創造性と最適化",
      "description": "仕組みやプロセスを自ら工夫してより良くすることに価値を感じています。",
      "evidence": ["..."]
    },
    {
      "name": "自律と自由",
      "description": "時間や場所にとらわれず、自己決定できる余白を重視しています。",
      "evidence": ["..."]
    },
    {
      "name": "家族との豊かな時間",
      "description": "大切な人たちと安心できる良好な関係を保ち続けることを大切にしています。",
      "evidence": ["..."]
    }
  ],
  "tensions": [
    {
      "title": "目の前の業務と長期的な創作のバランス",
      "currentState": "日常の作業に追われ、本当に注力したいコアプロジェクトへの時間が削られがち。",
      "desiredState": "毎朝最優先で自分のプロジェクトに時間を確保し、心に余裕を持てている状態。"
    }
  ],
  "futureScenes": [
    {
      "title": "静かな朝に自由な創作を楽しむ情景",
      "description": "時間と場所に縛られず、自分が誇れるプロダクトを作りながら家族と穏やかに暮らしている。"
    }
  ],
  "storyCandidates": [
    {
      "title": "自律型プロダクトの開発と自由なライフスタイルの確立",
      "description": "自分の強みを活かしたWebプロダクトをリリースし、収益と自由な時間の両立を達成する。",
      "relatedValues": ["創造性と最適化", "自律と自由"],
      "realWorldUnlocks": ["自分の創作に集中できる環境", "精神的・時間的なゆとり"]
    }
  ],
  "experiments": [
    {
      "title": "朝の創作・自己投資時間を30日試す",
      "description": "毎朝最初の30分を自分のプロジェクトに充て、集中度と満足度を記録する。",
      "durationDays": 30
    }
  ]
}
---CRESTWARD_JSON_END---
\`\`\`

---
【分析対象の記録】
${evidenceText || "（特に入力された記録がありません。一般的な自己探索の仮説を提示してください）"}
`;

    setPromptText(template);
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(promptText);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="min-h-screen flex flex-col p-6 max-w-md mx-auto pt-6 pb-24">
      {/* Back button */}
      <header className="mb-4">
        <Link href="/onboarding" className="inline-flex items-center text-stone-400 hover:text-stone-700 text-xs font-bold mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1" /> オンボーディングに戻る
        </Link>
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-5 h-5 text-amber-500" />
          <h1 className="text-xl font-black text-stone-800 tracking-tight">
            AI自己分析プロンプト
          </h1>
        </div>
        <p className="text-xs font-medium text-stone-500 leading-relaxed">
          入力した記録をもとに、AIに渡す専用プロンプトを作成しました。
        </p>
      </header>

      {/* Security alert */}
      <Card className="bg-amber-50/90 border-amber-200/80 mb-5 shadow-2xs rounded-2xl">
        <CardContent className="p-3.5 flex gap-2.5 items-start">
          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs font-medium text-amber-900 leading-relaxed">
            外部AI（ChatGPTやGeminiなど）に送信する前に、下部のプレビュー内容をご確認ください。
          </div>
        </CardContent>
      </Card>

      {/* Step 1: Copy */}
      <div className="mb-5">
        <h3 className="text-[11px] font-black text-stone-400 uppercase tracking-widest mb-2 px-1">
          Step 1: プロンプトをコピー
        </h3>
        <Button 
          onClick={handleCopy}
          className="w-full bg-stone-900 hover:bg-black text-white rounded-2xl py-6 text-base font-bold shadow-md relative overflow-hidden group transition-all"
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

      {/* Step 2: Open AI */}
      <div className="mb-5">
        <h3 className="text-[11px] font-black text-stone-400 uppercase tracking-widest mb-2 px-1">
          Step 2: お使いのAIを開いて貼り付け
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

      {/* Step 3: Preview */}
      <div className="mb-5">
        <h3 className="text-[11px] font-black text-stone-400 uppercase tracking-widest mb-2 px-1">
          Step 3: 生成プロンプトの確認
        </h3>
        <div className="bg-stone-100/80 border border-stone-200 rounded-2xl p-3.5 h-40 overflow-y-auto text-[11px] font-mono text-stone-600 whitespace-pre-wrap leading-relaxed shadow-inner">
          {promptText}
        </div>
      </div>

      {/* Step 4: Go to Import */}
      <div className="mt-auto pt-2">
        <Button 
          onClick={() => router.push("/discovery/import")}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl py-6 text-sm font-bold shadow-lg shadow-emerald-600/20"
        >
          AIの回答をインポートする画面へ <ArrowRight className="w-4 h-4 ml-1.5" />
        </Button>
      </div>

      <div className="mt-3 text-center">
        <Button 
          variant="ghost" 
          onClick={() => router.push("/discovery/story-candidate")} 
          className="text-stone-400 hover:text-stone-700 text-xs font-bold"
        >
          AIを使わずに手動で物語を作成する
        </Button>
      </div>
    </div>
  );
}
