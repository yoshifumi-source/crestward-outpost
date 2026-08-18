"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, ArrowLeft, Download, Sparkles, Wand2, ArrowRight, HelpCircle } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { translateAnalysisJson } from "@/lib/translator";
import { extractAndParseJson } from "@/lib/jsonRepair";

const SAMPLE_ANALYSIS_TEXT = `---CRESTWARD_JSON_START---
{
  "patterns": [
    {
      "title": "改善を通じた自己成長",
      "description": "日常の不便や非効率を自分の工夫で少しずつ改善していくことに、深い充実感を感じている可能性があります。",
      "confidence": "high"
    },
    {
      "title": "自律と自己決定の欲求",
      "description": "周囲に流されず、自分の時間やペースを自分でコントロールしたいという強い意志が見られます。",
      "confidence": "high"
    },
    {
      "title": "専門能力を通じた貢献と価値提供",
      "description": "自身のスキルや知見を高め、誰かの役に立ったり価値を届けることにやりがいを感じています。",
      "confidence": "medium"
    }
  ],
  "values": [
    {
      "name": "創造性と最適化",
      "description": "仕組みやプロセスを自ら工夫してより良くすることに価値を感じています。",
      "evidence": ["日常の工夫に関する記録より"]
    },
    {
      "name": "自律と自由な余白",
      "description": "時間や場所にとらわれず、自己決定できる余白を重視しています。",
      "evidence": ["時間の使い方に関する記録より"]
    },
    {
      "name": "家族との豊かな時間",
      "description": "大切な人たちと安心できる良好な関係を保ち続けることを大切にしています。",
      "evidence": ["人間関係に関する記録より"]
    }
  ],
  "tensions": [
    {
      "title": "目の前の日常業務と長期的な創作のバランス",
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
      "relatedValues": ["創造性と最適化", "自律と自由な余白"],
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
---CRESTWARD_JSON_END---`;

export default function ImportDiscoveryPage() {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleImport = (textToParse?: string) => {
    setError(null);
    const targetText = textToParse || content;

    if (!targetText.trim()) {
      setError("AIからの回答テキストを貼り付けてください。");
      return;
    }

    try {
      const parsed = extractAndParseJson(targetText);

      if (!parsed) {
        throw new Error("JSONデータの抽出に失敗しました。");
      }

      // 簡易バリデーション
      if (!parsed.patterns && !parsed.tensions && !parsed.storyCandidates && !parsed.values) {
        throw new Error("必要な分析項目（価値観・パターン・ストーリー）が見つかりません。");
      }

      // 全項目を日本語に翻訳・正規化
      const localized = translateAnalysisJson(parsed);

      // localStorageに一時保存（Review画面で使用）
      if (typeof window !== "undefined") {
        localStorage.setItem("crestward_imported_analysis", JSON.stringify(localized));
      }

      router.push("/discovery/review");
    } catch (err: any) {
      console.error(err);
      setError("データの読み取りに失敗しました。AIの回答の末尾にある ---CRESTWARD_JSON_START--- から ---CRESTWARD_JSON_END--- の部分が含まれているかご確認ください。");
    }
  };

  const handleInsertSample = () => {
    setContent(SAMPLE_ANALYSIS_TEXT);
    handleImport(SAMPLE_ANALYSIS_TEXT);
  };

  return (
    <div className="min-h-screen flex flex-col p-6 max-w-md mx-auto pt-6 pb-24">
      <header className="mb-4 flex flex-col">
        <Link href="/discovery/analyze" className="inline-flex items-center text-stone-400 hover:text-stone-700 text-xs font-bold mb-3 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1" /> プロンプト画面に戻る
        </Link>
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-5 h-5 text-emerald-600" />
          <h1 className="text-xl font-black text-stone-800 tracking-tight">
            AI分析結果の取り込み
          </h1>
        </div>
        <p className="text-xs font-medium text-stone-500 leading-relaxed">
          ChatGPTやGemini等からの回答文をコピーし、下の枠にそのまま貼り付けてください。
        </p>
      </header>

      {error && (
        <Card className="bg-rose-50 border-rose-200 mb-4 shadow-2xs rounded-2xl">
          <CardContent className="p-3.5 flex flex-col gap-2">
            <div className="flex gap-2 items-start">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="text-xs font-bold text-rose-800 leading-relaxed">
                {error}
              </div>
            </div>
            <div className="pt-1 border-t border-rose-200/60 flex justify-end">
              <button
                onClick={handleInsertSample}
                className="text-[11px] font-black text-emerald-700 hover:text-emerald-800 underline flex items-center gap-1"
              >
                <Wand2 className="w-3 h-3" /> サンプル分析データで取り込みを試す
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Helper Button */}
      <div className="mb-3 flex justify-end">
        <button
          onClick={handleInsertSample}
          className="text-[11px] font-bold text-stone-500 hover:text-stone-800 bg-white border border-stone-200 px-3 py-1.5 rounded-full shadow-2xs flex items-center gap-1 transition-colors"
        >
          <Wand2 className="w-3.5 h-3.5 text-amber-500" /> サンプル分析結果を自動入力
        </button>
      </div>

      <div className="flex-1 flex flex-col mb-4">
        <Textarea 
          placeholder="AIからの回答をここにそのまま貼り付けてください（全文貼り付けでOKです）..."
          className="flex-1 min-h-[260px] resize-none text-xs font-mono p-4 rounded-2xl bg-white border-stone-200 shadow-inner focus-visible:ring-emerald-500 leading-relaxed"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
      </div>

      <div className="space-y-2 mt-auto">
        <Button 
          onClick={() => handleImport()}
          disabled={!content.trim()}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl py-6 text-sm font-bold shadow-lg shadow-emerald-600/25"
        >
          <Download className="w-4 h-4 mr-2" />
          分析データを取り込む
        </Button>

        <Button 
          variant="ghost"
          onClick={() => router.push("/discovery/story-candidate")}
          className="w-full text-stone-400 hover:text-stone-700 text-xs font-bold py-2"
        >
          AIを使わずに手動で物語を作成する <ArrowRight className="w-3.5 h-3.5 ml-1" />
        </Button>
      </div>
    </div>
  );
}
