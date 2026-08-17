"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { storage } from "@/services/storage";
import { QuestChapter, Milestone, Quest } from "@/types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, ArrowLeft, Download } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

export default function QuestImportPage() {
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
      
      const startTag = "---CRESTWARD_JSON_START---";
      const endTag = "---CRESTWARD_JSON_END---";
      
      if (content.includes(startTag) && content.includes(endTag)) {
        jsonString = content.split(startTag)[1].split(endTag)[0];
      } else {
        const match = content.match(/```json\n([\s\S]*?)\n```/);
        if (match) {
          jsonString = match[1];
        }
      }

      const parsed = JSON.parse(jsonString.trim());

      if (!parsed.chapters) {
        throw new Error("chapters データが見つかりません。");
      }

      const activeStory = storage.getActiveStory();
      if (!activeStory) throw new Error("アクティブなストーリーがありません。");

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
          title: chData.title,
          order: chapterOrder++,
          status: "active"
        });

        let milestoneOrder = 0;
        chData.milestones?.forEach((msData: any) => {
          const milestoneId = `ms_${Date.now()}_${Math.random()}`;
          newMilestones.push({
            id: milestoneId,
            chapterId: chapterId,
            title: msData.title,
            order: milestoneOrder++,
            status: "active"
          });

          msData.quests?.forEach((qData: any) => {
            const questId = `q_${Date.now()}_${Math.random()}`;
            newQuests.push({
              id: questId,
              title: qData.title,
              description: qData.description,
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

      router.push("/");
    } catch (err: any) {
      console.error(err);
      setError("データの読み取りに失敗しました。AIの回答をすべてコピーして貼り付けてください。");
    }
  };

  return (
    <div className="min-h-screen flex flex-col p-6 max-w-md mx-auto pt-10">
      <header className="mb-6 flex flex-col">
        <Link href="/quest-builder" className="inline-flex items-center text-stone-400 hover:text-stone-600 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Builder
        </Link>
        <h1 className="text-2xl font-black text-stone-800 tracking-tight mb-2">
          Import Quests
        </h1>
        <p className="text-sm font-medium text-stone-500">
          AIからの回答をすべてコピーし、下の枠に貼り付けてください。
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
          Import Quests
        </Button>
      </div>
    </div>
  );
}
