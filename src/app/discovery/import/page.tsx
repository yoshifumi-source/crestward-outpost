"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, ArrowLeft, Download, Sparkles } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { translateAnalysisJson } from "@/lib/translator";

export default function ImportDiscoveryPage() {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleImport = () => {
    setError(null);
    if (!content.trim()) {
      setError("AIからの回答テキストを貼り付けてください。");
      return;
    }

    try {
      let jsonString = content;
      
      // CRESTWARD_JSONタグを探す
      const startTag = "---CRESTWARD_JSON_START---";
      const endTag = "---CRESTWARD_JSON_END---";
      
      if (content.includes(startTag) && content.includes(endTag)) {
        jsonString = content.split(startTag)[1].split(endTag)[0];
      } else {
        // MarkdownのJSONブロックを探すフォールバック
        const match = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/```([\s\S]*?)```/);
        if (match) {
          jsonString = match[1];
        }
      }

      const parsed = JSON.parse(jsonString.trim());

      // 簡易バリデーション
      if (!parsed.patterns && !parsed.tensions && !parsed.storyCandidates && !parsed.values) {
        throw new Error("必要な分析データが見つかりません。");
      }

      // 全項目を包括的に日本語に翻訳・変換
      const localized = translateAnalysisJson(parsed);

      // localStorageに一時保存（Review画面で使うため）
      if (typeof window !== "undefined") {
        localStorage.setItem("crestward_imported_analysis", JSON.stringify(localized));
      }

      router.push("/discovery/review");
    } catch (err: any) {
      console.error(err);
      setError("データの読み取りに失敗しました。AIの返答全文（または ---CRESTWARD_JSON_START--- から ---CRESTWARD_JSON_END--- の部分）をコピーして貼り付けてみてください。");
    }
  };

  return (
    <div className="min-h-screen flex flex-col p-6 max-w-md mx-auto pt-6 pb-24">
      <header className="mb-5 flex flex-col">
        <Link href="/discovery/analyze" className="inline-flex items-center text-stone-400 hover:text-stone-700 text-xs font-bold mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1" /> プロンプト画面に戻る
        </Link>
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-5 h-5 text-emerald-600" />
          <h1 className="text-xl font-black text-stone-800 tracking-tight">
            AI分析結果の取り込み
          </h1>
        </div>
        <p className="text-xs font-medium text-stone-500 leading-relaxed">
          ChatGPTやGemini等からの回答文をコピーし、下の枠にそのまま貼り付けてください。自動でデータを解析し、日本語化して取り込みます。
        </p>
      </header>

      {error && (
        <Card className="bg-rose-50 border-rose-200 mb-4 shadow-2xs rounded-2xl">
          <CardContent className="p-3.5 flex gap-2.5 items-start">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="text-xs font-bold text-rose-800 leading-relaxed">
              {error}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex-1 flex flex-col mb-5">
        <Textarea 
          placeholder="AIからの回答をここにそのまま貼り付けてください..."
          className="flex-1 min-h-[280px] resize-none text-xs font-mono p-4 rounded-2xl bg-white border-stone-200 shadow-inner focus-visible:ring-emerald-500 leading-relaxed"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
      </div>

      <div className="mt-auto">
        <Button 
          onClick={handleImport}
          disabled={!content.trim()}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl py-6 text-sm font-bold shadow-lg shadow-emerald-600/25"
        >
          <Download className="w-4 h-4 mr-2" />
          分析データを取り込む
        </Button>
      </div>
    </div>
  );
}
