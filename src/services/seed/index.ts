import { storage } from "@/services/storage";
import { Value, FutureVision, MainStory, Quest, Skill, Reward } from "@/types";

export const initializeSeedData = () => {
  const settings = storage.getSettings();
  
  // ユーザー向けのカスタムシードを強制反映させるための処理
  if (typeof window !== "undefined" && !localStorage.getItem("force_custom_seed_v3")) {
    localStorage.clear();
    localStorage.setItem("force_custom_seed_v3", "true");
  } else if (settings.onboardingCompleted) {
    return;
  }

  const now = Date.now();

  // 抽出したユーザーの価値観
  const seedValues: Value[] = [
    { id: "v1", name: "最適化・快適化", level: 5, createdAt: now, updatedAt: now },
    { id: "v2", name: "創意工夫", level: 5, createdAt: now, updatedAt: now },
    { id: "v3", name: "目に見える成果", level: 4, createdAt: now, updatedAt: now },
    { id: "v4", name: "リソース管理", level: 4, createdAt: now, updatedAt: now },
    { id: "v5", name: "家族との時間", level: 5, createdAt: now, updatedAt: now },
    { id: "v6", name: "健康", level: 4, createdAt: now, updatedAt: now },
  ];
  storage.saveValues(seedValues);

  const seedFutureVision: FutureVision = {
    id: "fv1",
    content: "自らの工夫と学習によって「不便」を「快適」へと進化させ、その成長プロセス自体を楽しんでいる。\n限られたリソース（時間・集中力）をパズルのように最適に配分し、仕事でもDIYでも、確かな手応えのある「目に見える成果」を生み出し続けている。",
    createdAt: now,
    updatedAt: now,
  };
  storage.saveFutureVision(seedFutureVision);

  const seedStory: MainStory = {
    id: "ms1",
    title: "キャンピングカー移動オフィス化計画",
    description: "限られた空間と電力をやり繰りし、どこでも最高のパフォーマンスが出せる「自分だけの秘密基地」を完成させる。",
    futureVisionId: "fv1",
    status: "active",
    progress: 15,
    startedAt: now - 86400000 * 5, 
    createdAt: now - 86400000 * 5,
    updatedAt: now,
  };
  storage.saveStories([seedStory]);

  const seedQuests: Quest[] = [
    {
      id: "q1",
      title: "現状の不便さ（ボトルネック）をリストアップする",
      description: "何が一番の課題かを分析する（ゲームの初期探索フェーズ）",
      storyId: "ms1",
      status: "completed",
      difficulty: "easy",
      mpCost: 1,
      xpReward: 50,
      goldReward: 20,
      skillTags: ["分析", "最適化"],
      completedAt: now - 86400000 * 4,
      createdAt: now - 86400000 * 5,
    },
    {
      id: "q2",
      title: "電気配線の基礎知識をインプットする",
      description: "必要な部品と配線図を学ぶ（スキルの獲得）",
      storyId: "ms1",
      status: "completed",
      difficulty: "normal",
      mpCost: 2,
      xpReward: 100,
      goldReward: 50,
      skillTags: ["学習", "DIY"],
      completedAt: now - 86400000 * 2,
      createdAt: now - 86400000 * 4,
    },
    {
      id: "q3",
      title: "サブバッテリーシステムの配線図を書く",
      description: "頭の中のアイデアを目に見える形に落とし込む",
      storyId: "ms1",
      status: "active",
      difficulty: "hard",
      mpCost: 3,
      xpReward: 150,
      goldReward: 80,
      skillTags: ["設計", "創意工夫"],
      createdAt: now,
    },
    {
      id: "q4",
      title: "必要な配線ケーブルと端子をリスト化・発注する",
      description: "リソースの管理と調達（アイテム集め）",
      storyId: "ms1",
      status: "active",
      difficulty: "normal",
      mpCost: 1,
      xpReward: 50,
      goldReward: 30,
      skillTags: ["リソース管理"],
      createdAt: now,
    }
  ];
  storage.saveQuests(seedQuests);

  const seedSkills: Skill[] = [
    { id: "s1", name: "最適化思考", level: 3, xp: 350 },
    { id: "s2", name: "DIY・工作", level: 2, xp: 120 },
    { id: "s3", name: "自己分析", level: 4, xp: 480 },
  ];
  storage.saveSkills(seedSkills);

  const seedRewards: Reward[] = [
    { id: "r1", name: "サバイバルゲームを1時間プレイ", goldCost: 100 },
    { id: "r2", name: "高めのコーヒー豆を買う", goldCost: 50 },
    { id: "r3", name: "DIY用の新しい工具を買う", goldCost: 300 },
  ];
  storage.saveRewards(seedRewards);

  storage.addStoryLog({
    id: "log1",
    date: now - 86400000 * 5,
    type: "story_started",
    title: "新しいストーリーが始まりました",
    description: "「キャンピングカー移動オフィス化計画」",
    storyId: "ms1",
  });
  
  storage.addStoryLog({
    id: "log2",
    date: now - 86400000 * 4,
    type: "quest_completed",
    title: "クエスト完了",
    description: "「現状の不便さのリストアップ」を完了しました。",
    storyId: "ms1",
    questId: "q1",
  });

  storage.addStoryLog({
    id: "log3",
    date: now - 86400000 * 2,
    type: "quest_completed",
    title: "クエスト完了",
    description: "「電気配線の基礎知識」を習得しました。",
    storyId: "ms1",
    questId: "q2",
  });

  settings.onboardingCompleted = true;
  storage.saveSettings(settings);
};
