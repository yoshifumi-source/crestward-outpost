"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { storage } from "@/services/storage";
import { GoalProject, Milestone, Quest } from "@/types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, ArrowLeft, Download, Sparkles, Wand2 } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { translateAnalysisJson, translateText } from "@/lib/translator";
import { extractAndParseJson } from "@/lib/jsonRepair";

const SAMPLE_PROJECTS_TEXT = `---CRESTWARD_JSON_START---
{
  "projects": [
    {
      "title": "📱 自作アプリの販売・リリースで稼ぐ",
      "description": "Web/スマホアプリを開発・公開し、月5〜10万円のストック収益を作る",
      "milestones": [
        {
          "title": "① アプリ開発のための学習・インプット",
          "quests": [
            {
              "title": "アプリ開発の専門書テキストを探して選定する",
              "description": "最適な技術書・チュートリアルを1冊選んで用意する（所要時間10分）",
              "difficulty": "easy"
            },
            {
              "title": "専門書（全213ページ）を読み進める",
              "description": "日々の読書ページ数を記録し、知識をインプットする",
              "difficulty": "normal",
              "metric": {
                "targetValue": 213,
                "currentValue": 0,
                "unit": "ページ"
              }
            }
          ]
        },
        {
          "title": "② v1.0 プロトタイプ開発",
          "quests": [
            {
              "title": "開発ツールの選定と初期環境セットアップ",
              "description": "エディタやフレームワークの準備を整える（所要時間15分）",
              "difficulty": "easy"
            },
            {
              "title": "v1.0 コア機能の画面モックとロジック実装",
              "description": "一番大事なコア機能のみを最小構成で実装する",
              "difficulty": "hard"
            }
          ]
        },
        {
          "title": "③ リリース & 実機テスト・改善",
          "quests": [
            {
              "title": "実機で使ってみて問題点・改善点を5つ洗い出す",
              "description": "自分で実際に操作し、使いにくい部分をメモする",
              "difficulty": "normal"
            }
          ]
        }
      ]
    },
    {
      "title": "🎤 職場外グループでの講演・出張で稼ぐ",
      "description": "専門知識や知見を活かして研修・セミナーを行い、副収入を得る",
      "milestones": [
        {
          "title": "① 講演テーマ選定と企画書・スライド作成",
          "quests": [
            {
              "title": "得意分野の講演テーマ案を3つ書き出す",
              "description": "自分が話せて相手の役に立つトピックを箇条書きで整理する",
              "difficulty": "easy"
            }
          ]
        }
      ]
    }
  ]
}
---CRESTWARD_JSON_END---`;

export default function QuestImportPage() {
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
      const rawParsed = extractAndParseJson(targetText);
      if (!rawParsed) {
        throw new Error("データの読み取りに失敗しました。");
      }

      const parsed = translateAnalysisJson(rawParsed);
      const activeStory = storage.getActiveStory();
      if (!activeStory) throw new Error("アクティブな大目標が設定されていません。");

      const existingProjects = storage.getProjects();
      const existingMilestones = storage.getMilestones();
      const existingQuests = storage.getQuests();

      const newProjects: GoalProject[] = [];
      const newMilestones: Milestone[] = [];
      const newQuests: Quest[] = [];

      // Support "projects" hierarchy (Level 3 -> Level 4 -> Level 5)
      if (parsed.projects && Array.isArray(parsed.projects)) {
        let projOrder = existingProjects.filter(p => p.storyId === activeStory.id).length;

        parsed.projects.forEach((projData: any) => {
          const projectId = `proj_${Date.now()}_${Math.random()}`;
          newProjects.push({
            id: projectId,
            storyId: activeStory.id,
            title: translateText(projData.title),
            description: translateText(projData.description),
            order: projOrder++,
            status: "active",
            progress: 0,
            createdAt: Date.now()
          });

          let msOrder = 0;
          projData.milestones?.forEach((msData: any) => {
            const milestoneId = `ms_${Date.now()}_${Math.random()}`;
            newMilestones.push({
              id: milestoneId,
              chapterId: "ch_default",
              projectId: projectId,
              title: translateText(msData.title),
              order: msOrder++,
              status: "active"
            });

            msData.quests?.forEach((qData: any) => {
              const questId = `q_${Date.now()}_${Math.random()}`;
              
              let metricObj = undefined;
              if (qData.metric && typeof qData.metric.targetValue === "number") {
                metricObj = {
                  targetValue: qData.metric.targetValue,
                  currentValue: qData.metric.currentValue || 0,
                  unit: translateText(qData.metric.unit) || "回",
                  history: []
                };
              }

              newQuests.push({
                id: questId,
                title: translateText(qData.title),
                description: translateText(qData.description),
                storyId: activeStory.id,
                projectId: projectId,
                milestoneId: milestoneId,
                status: "active",
                difficulty: qData.difficulty || "normal",
                mpCost: qData.difficulty === "easy" ? 1 : qData.difficulty === "hard" ? 3 : 2,
                xpReward: qData.difficulty === "easy" ? 50 : qData.difficulty === "hard" ? 150 : 100,
                goldReward: qData.difficulty === "easy" ? 20 : qData.difficulty === "hard" ? 80 : 50,
                skillTags: [],
                metric: metricObj,
                createdAt: Date.now()
              });
            });
          });
        });
      } else if (parsed.chapters && Array.isArray(parsed.chapters)) {
        // Fallback for chapters structure
        let msOrder = 0;
        parsed.chapters.forEach((chData: any) => {
          chData.milestones?.forEach((msData: any) => {
            const milestoneId = `ms_${Date.now()}_${Math.random()}`;
            newMilestones.push({
              id: milestoneId,
              chapterId: "ch_default",
              title: translateText(msData.title),
              order: msOrder++,
              status: "active"
            });

            msData.quests?.forEach((qData: any) => {
              const questId = `q_${Date.now()}_${Math.random()}`;
              newQuests.push({
                id: questId,
                title: translateText(qData.title),
                description: translateText(qData.description),
                storyId: activeStory.id,
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
      } else {
        throw new Error("有効なプロジェクトまたはマイルストーン構造が見つかりません。");
      }

      storage.saveProjects([...existingProjects, ...newProjects]);
      storage.saveMilestones([...existingMilestones, ...newMilestones]);
      storage.saveQuests([...existingQuests, ...newQuests]);

      storage.recalculateStoryProgress(activeStory.id);
      router.push("/story");
    } catch (err: any) {
      console.error(err);
      setError("データの読み取りに失敗しました。AIの回答をすべてコピーして貼り付けてください。");
    }
  };

  const handleInsertSample = () => {
    setContent(SAMPLE_PROJECTS_TEXT);
    handleImport(SAMPLE_PROJECTS_TEXT);
  };

  return (
    <div className="min-h-screen flex flex-col p-6 max-w-md mx-auto pt-6 pb-24">
      <header className="mb-4 flex flex-col">
        <Link href="/quest-builder" className="inline-flex items-center text-stone-400 hover:text-stone-700 text-xs font-bold mb-3 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1" /> ビルダーに戻る
        </Link>
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-5 h-5 text-emerald-600" />
          <h1 className="text-xl font-black text-stone-800 tracking-tight">
            多階層クエストの取り込み
          </h1>
        </div>
        <p className="text-xs font-medium text-stone-500 leading-relaxed">
          AIからの回答をすべてコピーし、下の枠に貼り付けてください。プロジェクト・マイルストーン・クエストが自動で多階層ロードされます。
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
                <Wand2 className="w-3 h-3" /> サンプル多階層データで取り込みを試す
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
          <Wand2 className="w-3.5 h-3.5 text-amber-500" /> サンプル多階層データを自動入力
        </button>
      </div>

      <div className="flex-1 flex flex-col mb-4">
        <Textarea 
          placeholder="AIからの回答をここにそのまま貼り付けてください..."
          className="flex-1 min-h-[260px] resize-none text-xs font-mono p-4 rounded-2xl bg-white border-stone-200 shadow-inner focus-visible:ring-emerald-500 leading-relaxed"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
      </div>

      <div className="mt-auto">
        <Button 
          onClick={() => handleImport()}
          disabled={!content.trim()}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl py-6 text-sm font-bold shadow-lg shadow-emerald-600/25"
        >
          <Download className="w-4 h-4 mr-2" />
          多階層クエストを取り込む
        </Button>
      </div>
    </div>
  );
}
