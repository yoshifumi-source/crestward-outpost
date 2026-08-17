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
      title: "Pasted Journal",
      content: content.trim(),
      createdAt: Date.now(),
      includedInAnalysis: true,
    };

    const existing = storage.getDiscoveryEvidences();
    storage.saveDiscoveryEvidences([...existing, evidence]);

    router.push("/discovery/analyze");
  };

  return (
    <div className="min-h-screen flex flex-col p-6 max-w-md mx-auto pt-10">
      <header className="mb-6 flex flex-col">
        <Link href="/onboarding" className="inline-flex items-center text-stone-400 hover:text-stone-600 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </Link>
        <h1 className="text-2xl font-black text-stone-800 tracking-tight mb-2">
          Paste your journal
        </h1>
        <p className="text-sm font-medium text-stone-500">
          数日分でも、数か月分でも構いません。文章をきれいに整理する必要はありません。
        </p>
      </header>

      <div className="flex-1 flex flex-col mb-6">
        <Textarea 
          placeholder="昨日はこんなことがあった。今日はこれがうまくいかなかった..."
          className="flex-1 min-h-[300px] resize-none text-base p-4 rounded-2xl bg-white/80 border-white shadow-inner focus-visible:ring-emerald-500"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
      </div>

      <div className="mt-auto">
        <Button 
          onClick={handleAnalyze}
          disabled={!content.trim()}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-full py-6 text-lg font-bold shadow-md shadow-emerald-600/20"
        >
          <Sparkles className="w-5 h-5 mr-2" />
          Analyze with AI
        </Button>
      </div>
    </div>
  );
}
