"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, ArrowLeft, CheckCircle2, Download } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

export default function ImportDiscoveryPage() {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleImport = () => {
    setError(null);
    if (!content.trim()) {
      setError("AIからの返答を貼り付けてください。");
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
        const match = content.match(/```json\n([\s\S]*?)\n```/);
        if (match) {
          jsonString = match[1];
        }
      }

      const parsed = JSON.parse(jsonString.trim());

      // 簡易バリデーション
      if (!parsed.patterns && !parsed.tensions && !parsed.storyCandidates) {
        throw new Error("必要なデータ（patterns, tensions等）が見つかりません。");
      }

      // localStorageに一時保存（Review画面で使うため）
      if (typeof window !== "undefined") {
        localStorage.setItem("crestward_imported_analysis", JSON.stringify(parsed));
      }

      router.push("/discovery/review");
    } catch (err: any) {
      console.error(err);
      setError("JSONデータの読み取りに失敗しました。AIの回答全体をそのままコピーして貼り付けてみてください。");
    }
  };

  return (
    <div className="min-h-screen flex flex-col p-6 max-w-md mx-auto pt-10">
      <header className="mb-6 flex flex-col">
        <Link href="/discovery/analyze" className="inline-flex items-center text-stone-400 hover:text-stone-600 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Analysis Kit
        </Link>
        <h1 className="text-2xl font-black text-stone-800 tracking-tight mb-2">
          Import Analysis
        </h1>
        <p className="text-sm font-medium text-stone-500">
          AIからの回答をすべてコピーし、下の枠に貼り付けてください。必要なデータは自動で抽出されます。
        </p>
      </header>

      {error && (
        <Card className="bg-rose-50/80 border-rose-200 mb-6 shadow-sm">
          <CardContent className="p-4 flex gap-3 items-start">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="text-sm font-bold text-rose-800">
              {error}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex-1 flex flex-col mb-6">
        <Textarea 
          placeholder="AIの回答をここにペーストしてください..."
          className="flex-1 min-h-[300px] resize-none text-xs font-mono p-4 rounded-2xl bg-white/80 border-white shadow-inner focus-visible:ring-emerald-500"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
      </div>

      <div className="mt-auto">
        <Button 
          onClick={handleImport}
          disabled={!content.trim()}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-full py-6 text-lg font-bold shadow-md shadow-emerald-600/20"
        >
          <Download className="w-5 h-5 mr-2" />
          Import Data
        </Button>
      </div>
    </div>
  );
}
