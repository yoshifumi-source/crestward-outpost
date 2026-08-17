"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { storage } from "@/services/storage";
import { QuestChapter, Milestone, Quest } from "@/types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, ArrowLeft, Download, Sparkles } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { translateAnalysisJson, translateText } from "@/lib/translator";

export default function QuestImportPage() {
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
      
      const startTag = "---CRESTWARD_JSON_START---";
      const endTag = "---CRESTWARD_JSON_END---";
      
      if (content.includes(startTag) && content.includes(endTag)) {
        jsonString = content.split(startTag)[1].split(endTag)[0];
      } else {
        const match = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/```([\s\S]*?)```/);
        if (match) {
          jsonString = match[1];
        }
      }

      const rawParsed = JSON.parse(jsonString.trim());
      const parsed = translateAnalysisJson(rawParsed);

      if (!parsed.chapters) {
        throw new Error("chapters（章）データが見つかりません。");
      }

      const activeStory = storage.getActiveStory();
      if (!activeStory) throw new Error("アクティブなストーリーが設定されていません。");

      const existingChapters = storage.getChapters();
      const existingMilestones = storage.getMilestones();
      const existingQuests = storage.getQuests();

      const newChapters: QuestChapter[] = [];
      const newMilestones: Milestone[] = [];
      const newQuests: Quest[] = [];

      let chapterOrder = existingChapters.filter(c => c.storyId === activeStory.id).length;

      parsed.chapters.forEach((chData: any) => {
        const chapterId = `ch_${Date.now()}_${Math.random()}`;
        newChapters.push({
          id: chapterId,
          storyId: activeStory.id,
          title: translateText(chData.title),
          order: chapterOrder++,
          status: "active"
        });

        let milestoneOrder = 0;
        chData.milestones?.forEach((msData: any) => {
          const milestoneId = `ms_${Date.now()}_${Math.random()}`;
          newMilestones.push({
            id: milestoneId,
            chapterId: chapterId,
            title: translateText(msData.title),
            order: milestoneOrder++,
            status: "active"
          });

          msData.quests?.forEach((qData: any) => {
            const questId = `q_${Date.now()}_${Math.random()}`;
            newQuests.push({
              id: questId,
              title: translateText(qData.title),
              description: translateText(qData.description),
              storyId: activeStory.id,
              chapterId: chapterId,
              milestoneId: milestoneId,
              status: "active",
              difficulty: qData.difficulty || "normal",
              mpCost: qData.difficulty === "easy" ? 1 : qData.difficulty === "hard" ? 3 : 2,
              xpReward: qData.difficulty === "easy" ? 50 : qData.difficulty === "hard" ? 150 : 100,
              goldReward: qData.difficulty === "easy" ? 20 : qData.difficulty === "hard" ? 80 : 50,
              skillTags: [],
              createdAt: Date.now()
            });
          });
        });
      });

      storage.saveChapters([...existingChapters, ...newChapters]);
      storage.saveMilestones([...existingMilestones, ...newMilestones]);
      storage.saveQuests([...existingQuests, ...newQuests]);

      router.push("/story");
    } catch (err: any) {
      console.error(err);
      setError("データの読み取りに失敗しました。AIの回答をすべてコピーして貼り付けてください。");
    }
  };

  return (
    <div className="min-h-screen flex flex-col p-6 max-w-md mx-auto pt-6 pb-24">
      <header className="mb-5 flex flex-col">
        <Link href="/quest-builder" className="inline-flex items-center text-stone-400 hover:text-stone-700 text-xs font-bold mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1" /> ビルダーに戻る
        </Link>
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-5 h-5 text-emerald-600" />
          <h1 className="text-xl font-black text-stone-800 tracking-tight">
            クエスト構造の取り込み
          </h1>
        </div>
        <p className="text-xs font-medium text-stone-500 leading-relaxed">
          AIからの回答をすべてコピーし、下の枠に貼り付けてください。章・マイルストーン・クエストが自動でロードされます。
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
          placeholder="AIからの回答をここに貼り付けてください..."
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
          クエストを取り込む
        </Button>
      </div>
    </div>
  );
}
