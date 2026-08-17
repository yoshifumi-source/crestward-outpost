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
  "最近「こんな生き方いいな」と思った人はいますか？",
  "その人の何が羨ましかったのでしょうか？",
  "お金や時間の制約が少なければ、もっとやってみたいことはありますか？",
  "昔から何度も興味を持っていることはありますか？",
  "5年後の自分に一つだけ変化を起こせるなら、何を変えたいですか？"
];

export default function AspirationDiscoveryPage() {
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
        type: "aspiration",
        title: "Aspiration Analysis",
        content,
        createdAt: Date.now(),
        includedInAnalysis: true,
      };

      const existing = storage.getDiscoveryEvidences();
      storage.saveDiscoveryEvidences([...existing, evidence]);
    }

    router.push("/discovery/analyze");
  };

  return (
    <div className="min-h-screen flex flex-col p-6 max-w-md mx-auto pt-10">
      <header className="mb-8 flex flex-col">
        <Link href={step === 0 ? "/onboarding" : "#"} onClick={(e) => {
          if (step > 0) {
            e.preventDefault();
            setStep(s => s - 1);
          }
        }} className="inline-flex items-center text-stone-400 hover:text-stone-600 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </Link>
        <div className="flex items-center gap-4 mb-4">
          <Progress value={((step + 1) / QUESTIONS.length) * 100} className="h-1.5 bg-stone-200 *:bg-amber-400" />
          <span className="text-xs font-mono text-stone-400">{step + 1}/{QUESTIONS.length}</span>
        </div>
        <h1 className="text-xl font-bold text-stone-800 leading-snug">
          {QUESTIONS[step]}
        </h1>
      </header>

      <div className="flex-1 flex flex-col mb-6">
        <Textarea 
          placeholder="思いつくままに書いてみましょう（スキップも可能です）"
          className="flex-1 min-h-[200px] resize-none text-base p-4 rounded-2xl bg-white/80 border-white shadow-inner focus-visible:ring-amber-400"
          value={answers[step]}
          onChange={(e) => {
            const newAnswers = [...answers];
            newAnswers[step] = e.target.value;
            setAnswers(newAnswers);
          }}
          autoFocus
        />
      </div>

      <div className="mt-auto flex gap-3">
        {!isLastStep ? (
          <>
            <Button 
              variant="outline"
              onClick={handleNext}
              className="flex-1 rounded-full py-6 text-stone-500 border-stone-200"
            >
              Skip
            </Button>
            <Button 
              onClick={handleNext}
              className="flex-[2] bg-amber-500 hover:bg-amber-600 text-white rounded-full py-6 font-bold shadow-md shadow-amber-500/20"
            >
              Next <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </>
        ) : (
          <Button 
            onClick={handleAnalyze}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-full py-6 text-lg font-bold shadow-md shadow-emerald-600/20"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            Analyze with AI
          </Button>
        )}
      </div>
    </div>
  );
}
