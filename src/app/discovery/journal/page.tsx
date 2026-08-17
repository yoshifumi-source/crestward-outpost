"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { storage } from "@/services/storage";
import { DiscoveryEvidence } from "@/types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Sparkles } from "lucide-react";
import Link from "next/link";

export default function JournalDiscoveryPage() {
  const router = useRouter();
  const [content, setContent] = useState("");

  const handleAnalyze = () => {
    if (!content.trim()) return;

    const evidence: DiscoveryEvidence = {
      id: `ev_${Date.now()}`,
      type: "journal",
      title: "日記・メモの記録",
      content: content.trim(),
      createdAt: Date.now(),
      includedInAnalysis: true,
    };

    // Filter out previous journal evidences to prevent duplicates
    const existing = storage.getDiscoveryEvidences().filter(e => e.type !== "journal");
    storage.saveDiscoveryEvidences([...existing, evidence]);

    router.push("/discovery/analyze");
  };

  return (
    <div className="min-h-screen flex flex-col p-6 max-w-md mx-auto pt-6 pb-20">
      <header className="mb-6 flex flex-col">
        <Link href="/onboarding" className="inline-flex items-center text-stone-400 hover:text-stone-700 text-xs font-bold mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1" /> 戻る
        </Link>
        <h1 className="text-xl font-black text-stone-800 tracking-tight mb-1.5">
          普段の日記やメモを貼り付ける
        </h1>
        <p className="text-xs font-medium text-stone-500 leading-relaxed">
          数日分でも数か月分でも構いません。文章をきれいに整理する必要はありません。
        </p>
      </header>

      <div className="flex-1 flex flex-col mb-6">
        <Textarea 
          placeholder="昨日はこんなことがあった。これが楽しかった、あるいはこれが不満だった..."
          className="flex-1 min-h-[260px] resize-none text-sm p-4 rounded-2xl bg-white border-stone-200 shadow-inner focus-visible:ring-emerald-500 leading-relaxed"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
      </div>

      <div className="mt-auto">
        <Button 
          onClick={handleAnalyze}
          disabled={!content.trim()}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl py-6 text-base font-bold shadow-lg shadow-emerald-600/20"
        >
          <Sparkles className="w-5 h-5 mr-2" />
          AI自己分析プロンプトを生成する
        </Button>
      </div>
    </div>
  );
}
