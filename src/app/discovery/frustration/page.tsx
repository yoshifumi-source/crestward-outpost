"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { storage } from "@/services/storage";
import { DiscoveryEvidence } from "@/types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { Progress } from "@/components/ui/progress";

const QUESTIONS = [
  "最近「もっとこうだったらいいのに」と感じたことはありますか？",
  "日常で繰り返し面倒・不便・もったいないと感じることはありますか？",
  "今の生活で、もう少し増やしたい時間はありますか？",
  "逆に、減らしたいことはありますか？",
  "それが少し改善したら、どんな気持ちになりそうですか？"
];

export default function FrustrationDiscoveryPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>(Array(QUESTIONS.length).fill(""));

  const isLastStep = step === QUESTIONS.length - 1;

  const handleNext = () => {
    if (!isLastStep) {
      setStep(s => s + 1);
    } else {
      handleAnalyze();
    }
  };

  const handleAnalyze = () => {
    const content = QUESTIONS.map((q, i) => {
      if (!answers[i].trim()) return null;
      return `Q: ${q}\nA: ${answers[i].trim()}`;
    }).filter(Boolean).join("\n\n");

    if (content) {
      const evidence: DiscoveryEvidence = {
        id: `ev_${Date.now()}`,
        type: "frustration",
        title: "変えたい不満・違和感の記録",
        content,
        createdAt: Date.now(),
        includedInAnalysis: true,
      };

      // Filter out previous frustration evidences to prevent duplicates
      const existing = storage.getDiscoveryEvidences().filter(e => e.type !== "frustration");
      storage.saveDiscoveryEvidences([...existing, evidence]);
    }

    router.push("/discovery/analyze");
  };

  return (
    <div className="min-h-screen flex flex-col p-6 max-w-md mx-auto pt-6 pb-20">
      <header className="mb-6 flex flex-col">
        <Link 
          href={step === 0 ? "/onboarding" : "#"} 
          onClick={(e) => {
            if (step > 0) {
              e.preventDefault();
              setStep(s => s - 1);
            }
          }} 
          className="inline-flex items-center text-stone-400 hover:text-stone-700 text-xs font-bold mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> {step === 0 ? "戻る" : "前の質問へ"}
        </Link>
        <div className="flex items-center gap-3 mb-3">
          <Progress value={((step + 1) / QUESTIONS.length) * 100} className="h-2 bg-stone-200 *:bg-rose-500 rounded-full" />
          <span className="text-xs font-mono font-bold text-rose-600 shrink-0">{step + 1} / {QUESTIONS.length}</span>
        </div>
        <h1 className="text-base font-black text-stone-800 leading-snug">
          {QUESTIONS[step]}
        </h1>
      </header>

      <div className="flex-1 flex flex-col mb-6">
        <Textarea 
          placeholder="思いつくままに書いてみましょう（スキップも可能です）"
          className="flex-1 min-h-[220px] resize-none text-sm p-4 rounded-2xl bg-white border-stone-200 shadow-inner focus-visible:ring-rose-500"
          value={answers[step]}
          onChange={(e) => {
            const newAnswers = [...answers];
            newAnswers[step] = e.target.value;
            setAnswers(newAnswers);
          }}
          autoFocus
        />
      </div>

      <div className="mt-auto flex gap-2.5">
        {!isLastStep ? (
          <>
            <Button 
              variant="outline"
              onClick={handleNext}
              className="flex-1 rounded-2xl py-6 text-stone-500 border-stone-300 font-bold text-xs"
            >
              スキップ
            </Button>
            <Button 
              onClick={handleNext}
              className="flex-[2] bg-rose-600 hover:bg-rose-700 text-white rounded-2xl py-6 font-bold text-sm shadow-md shadow-rose-600/20"
            >
              次へ <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </>
        ) : (
          <Button 
            onClick={handleAnalyze}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl py-6 text-base font-bold shadow-lg shadow-emerald-600/25"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            AI自己分析プロンプトを生成する
          </Button>
        )}
      </div>
    </div>
  );
}
