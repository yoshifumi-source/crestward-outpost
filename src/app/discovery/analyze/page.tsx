"use client";

import { useEffect, useState } from "react";
import { storage } from "@/services/storage";
import { DiscoveryEvidence } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, ArrowRight, Check, Copy, ExternalLink, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AnalyzeDiscoveryPage() {
  const router = useRouter();
  const [evidences, setEvidences] = useState<DiscoveryEvidence[]>([]);
  const [promptText, setPromptText] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const allEvidences = storage.getDiscoveryEvidences();
    const toAnalyze = allEvidences.filter(e => e.includedInAnalysis);
    setEvidences(toAnalyze);

    const evidenceText = toAnalyze.map((e, i) => `【記録 ${i + 1} (${e.type})】\n${e.content}`).join("\n\n");

    const template = `あなたは、人生設計、行動変容、目標設計を支援する分析者です。

以下は私自身が書いたJournalや自己探索の回答です。
この文章から、私の人生を決めつけるのではなく、「この人にはこういう傾向があるのではないか」という仮説として分析してください。

特に以下を分析してください。
1. 繰り返し現れるテーマ
2. 喜びや充実を感じている場面
3. 強い不満やストレスを感じる場面
4. 自分から進んで取り組んでいること
5. 羨望や憧れの対象
6. 失いたくないもの
7. 本人が改善したがっていること
8. 背景にありそうな価値観
9. 現状と望む状態とのギャップ
10. 今後試してみる価値がありそうな人生の方向

価値観を断定しないでください。
「あなたは○○な人です」ではなく、「○○を大切にしている可能性があります」という形で提示してください。
価値観そのものを目標にしないでください。例えば「Family」というValueから「家族と毎日30分話す」という安易なGoalへ直接変換しないでください。
代わりに、Current State → Desired State → Future Scene → Story Candidate という順序で考えてください。

AIにはまず人間が読みやすい分析を出力してください。
その後、必ず以下のJSONスキーマと互換性のあるJSONだけを最後に出力するよう要求します。
JSONの前後には、
---CRESTWARD_JSON_START---
および
---CRESTWARD_JSON_END---
を付けてください。

\`\`\`json
{
  "patterns": [
    {
      "title": "Growth through improvement",
      "description": "不便や不足を少しずつ改善することに充実を感じている可能性があります。",
      "confidence": "high"
    }
  ],
  "values": [
    {
      "name": "Growth & Optimization",
      "description": "不便や非効率を自分の工夫で改善することを大切にしている可能性があります。",
      "evidence": ["..."]
    }
  ],
  "tensions": [
    {
      "title": "Family and personal time",
      "currentState": "家族との時間を大切にしている一方、一人の時間が不足すると消耗しやすい。",
      "desiredState": "家族との関係を保ちながら、一人で回復・成長する時間も確保できている。"
    }
  ],
  "futureScenes": [
    {
      "title": "Balanced personal time",
      "description": "家族と過ごした後、自分自身の学習や趣味にも落ち着いて取り組めている。"
    }
  ],
  "storyCandidates": [
    {
      "title": "自分を回復・成長させる一人時間を作る",
      "description": "家族との関係を大切にしながら、自分自身のための時間も無理なく維持する。",
      "relatedValues": ["Family", "Growth", "Freedom"],
      "realWorldUnlocks": ["自分の学習時間を確保できる", "疲労感を減らす"]
    }
  ],
  "experiments": [
    {
      "title": "朝の一人時間を30日試す",
      "description": "朝の一定時間を自分自身の活動に使い、満足度を記録する。",
      "durationDays": 30
    }
  ]
}
\`\`\`

---
以下の記録を分析してください。

${evidenceText}
`;

    setPromptText(template);
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(promptText);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="min-h-screen flex flex-col p-6 max-w-md mx-auto pt-10 pb-20">
      <header className="mb-6">
        <h1 className="text-2xl font-black text-stone-800 tracking-tight mb-2">
          AI Analysis Kit
        </h1>
        <p className="text-sm font-medium text-stone-500">
          AIに渡す分析用プロンプトを作成しました。
        </p>
      </header>

      <Card className="bg-amber-50/80 border-amber-200 mb-6 shadow-sm">
        <CardContent className="p-4 flex gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-sm font-medium text-amber-800 leading-relaxed">
            Journalには個人的な情報が含まれている可能性があります。<br/><br/>
            外部AIへ送信する前に、下部でコピーする内容（Preview）を必ず確認してください。
          </div>
        </CardContent>
      </Card>

      <div className="mb-8">
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

      <div className="mb-8">
        <h3 className="text-xs font-black text-stone-500 uppercase tracking-widest mb-3">2. Open preferred AI</h3>
        <p className="text-sm text-stone-500 mb-3">コピーしたテキストを普段お使いのAIに貼り付けてください。</p>
        <div className="flex gap-2">
          <a href="https://chatgpt.com/" target="_blank" rel="noreferrer" className="flex-1 flex items-center justify-center p-3 bg-white border border-stone-200 rounded-xl text-sm font-bold text-stone-700 hover:border-stone-400 transition-colors">
            ChatGPT <ExternalLink className="w-3 h-3 ml-1" />
          </a>
          <a href="https://gemini.google.com/" target="_blank" rel="noreferrer" className="flex-1 flex items-center justify-center p-3 bg-white border border-stone-200 rounded-xl text-sm font-bold text-stone-700 hover:border-stone-400 transition-colors">
            Gemini <ExternalLink className="w-3 h-3 ml-1" />
          </a>
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-xs font-black text-stone-500 uppercase tracking-widest mb-3">3. Preview</h3>
        <div className="bg-white/80 border border-stone-200 rounded-2xl p-4 h-48 overflow-y-auto text-xs font-mono text-stone-600 whitespace-pre-wrap">
          {promptText}
        </div>
      </div>

      <div className="mt-auto">
        <h3 className="text-xs font-black text-stone-500 uppercase tracking-widest mb-3 text-center">4. After Analysis</h3>
        <Button 
          onClick={() => router.push("/discovery/import")}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-full py-6 text-base font-bold shadow-md shadow-emerald-600/20"
        >
          Go to Import Screen <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>

      <div className="mt-6 text-center">
        <Button variant="ghost" onClick={() => router.push("/discovery/story-candidate")} className="text-stone-400 hover:text-stone-600 text-xs font-bold">
          Continue manually (Skip AI)
        </Button>
      </div>
    </div>
  );
}
