import { 
  Value, 
  FutureVision, 
  MainStory, 
  Quest, 
  Skill, 
  Reward, 
  StoryLog, 
  DailyCheckIn, 
  JournalEntry, 
  UserSettings,
  DiscoveryEvidence,
  Pattern,
  Tension,
  FutureScene,
  Experiment,
  QuestChapter,
  Milestone
} from "@/types";

const PREFIX = "crestward_";

const get = <T>(key: string, defaultValue: T): T => {
  if (typeof window === "undefined") return defaultValue;
  const stored = localStorage.getItem(`${PREFIX}${key}`);
  if (!stored) return defaultValue;
  try {
    return JSON.parse(stored) as T;
  } catch {
    return defaultValue;
  }
};

const set = <T>(key: string, value: T): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem(`${PREFIX}${key}`, JSON.stringify(value));
};

const DEFAULT_SETTINGS: UserSettings = {
  name: "冒険者 Yoshifumi",
  title: "見習い航海士",
  level: 1,
  xp: 0,
  xpToNextLevel: 100,
  onboardingCompleted: false,
  currentHp: 100,
  maxHp: 100,
  currentMp: 10,
  maxMp: 10,
  gold: 50,
};

export const storage = {
  // Settings & Status
  getSettings: () => get<UserSettings>("settings", DEFAULT_SETTINGS),
  saveSettings: (settings: UserSettings) => set("settings", settings),

  // Level & XP System
  addExperience: (xpGained: number): { newLevel: number; leveledUp: boolean; currentXp: number; nextLevelXp: number } => {
    const settings = storage.getSettings();
    let { level, xp, xpToNextLevel } = settings;
    xp += xpGained;
    let leveledUp = false;

    while (xp >= xpToNextLevel) {
      xp -= xpToNextLevel;
      level += 1;
      xpToNextLevel = Math.floor(xpToNextLevel * 1.5);
      leveledUp = true;
    }

    const updated = { ...settings, level, xp, xpToNextLevel };
    storage.saveSettings(updated);

    if (leveledUp) {
      storage.addStoryLog({
        id: `log_${Date.now()}`,
        date: Date.now(),
        type: "milestone_reached",
        title: `レベルアップ！ Lv.${level} に到達`,
        description: `経験値を積み、冒険者として新たな高みへと成長しました。`
      });
    }

    return { newLevel: level, leveledUp, currentXp: xp, nextLevelXp: xpToNextLevel };
  },

  // Gold System
  addGold: (goldGained: number) => {
    const settings = storage.getSettings();
    const updated = { ...settings, gold: Math.max(0, settings.gold + goldGained) };
    storage.saveSettings(updated);
    return updated.gold;
  },

  // Values
  getValues: () => get<Value[]>("values", []),
  saveValues: (values: Value[]) => set("values", values),

  // Future Vision
  getFutureVision: () => get<FutureVision | null>("future_vision", null),
  saveFutureVision: (vision: FutureVision) => set("future_vision", vision),

  // Stories
  getStories: () => get<MainStory[]>("stories", []),
  saveStories: (stories: MainStory[]) => set("stories", stories),
  getActiveStory: () => get<MainStory[]>("stories", []).find(s => s.status === "active"),

  // Quests
  getQuests: () => get<Quest[]>("quests", []),
  saveQuests: (quests: Quest[]) => set("quests", quests),

  // Skills
  getSkills: () => get<Skill[]>("skills", []),
  saveSkills: (skills: Skill[]) => set("skills", skills),
  addSkillExperience: (skillName: string, xpGained: number) => {
    const skills = storage.getSkills();
    const existing = skills.find(s => s.name === skillName);
    if (existing) {
      existing.xp += xpGained;
      if (existing.xp >= existing.level * 100) {
        existing.level += 1;
      }
      storage.saveSkills(skills);
    } else {
      skills.push({ id: `sk_${Date.now()}`, name: skillName, level: 1, xp: xpGained });
      storage.saveSkills(skills);
    }
  },

  // Rewards
  getRewards: () => get<Reward[]>("rewards", []),
  saveRewards: (rewards: Reward[]) => set("rewards", rewards),

  // Logs
  getStoryLogs: () => get<StoryLog[]>("story_logs", []),
  saveStoryLogs: (logs: StoryLog[]) => set("story_logs", logs),
  addStoryLog: (log: StoryLog) => {
    const logs = storage.getStoryLogs();
    set("story_logs", [log, ...logs]);
  },

  // Daily Check-ins
  getCheckIns: () => get<DailyCheckIn[]>("check_ins", []),
  saveCheckIns: (checkIns: DailyCheckIn[]) => set("check_ins", checkIns),

  // Journals
  getJournals: () => get<JournalEntry[]>("journals", []),
  saveJournals: (journals: JournalEntry[]) => set("journals", journals),

  // --- Guided Discovery ---
  getDiscoveryEvidences: () => get<DiscoveryEvidence[]>("discovery_evidences", []),
  saveDiscoveryEvidences: (evidences: DiscoveryEvidence[]) => set("discovery_evidences", evidences),

  getPatterns: () => get<Pattern[]>("patterns", []),
  savePatterns: (patterns: Pattern[]) => set("patterns", patterns),

  getTensions: () => get<Tension[]>("tensions", []),
  saveTensions: (tensions: Tension[]) => set("tensions", tensions),

  getFutureScenes: () => get<FutureScene[]>("future_scenes", []),
  saveFutureScenes: (scenes: FutureScene[]) => set("future_scenes", scenes),

  getExperiments: () => get<Experiment[]>("experiments", []),
  saveExperiments: (experiments: Experiment[]) => set("experiments", experiments),

  getChapters: () => get<QuestChapter[]>("quest_chapters", []),
  saveChapters: (chapters: QuestChapter[]) => set("quest_chapters", chapters),
  
  getMilestones: () => get<Milestone[]>("quest_milestones", []),
  saveMilestones: (milestones: Milestone[]) => set("quest_milestones", milestones),

  // Preset Seeder (Sample Adventurer Setup for Instant Delight)
  loadSamplePreset: () => {
    const now = Date.now();
    const todayStr = new Date().toISOString().split("T")[0];

    const settings: UserSettings = {
      name: "冒険者 Yoshifumi",
      title: "自律型クリエイター",
      level: 3,
      xp: 45,
      xpToNextLevel: 150,
      onboardingCompleted: true,
      currentHp: 85,
      maxHp: 100,
      currentMp: 8,
      maxMp: 10,
      gold: 140,
      lastCheckInDate: todayStr
    };

    const values: Value[] = [
      { id: "v_1", name: "創造性と表現 (Creativity)", level: 5, createdAt: now, updatedAt: now },
      { id: "v_2", name: "家族との豊かな時間 (Family)", level: 5, createdAt: now, updatedAt: now },
      { id: "v_3", name: "自己成長と学習 (Growth)", level: 4, createdAt: now, updatedAt: now },
      { id: "v_4", name: "健康とバイタリティ (Health)", level: 4, createdAt: now, updatedAt: now },
      { id: "v_5", name: "経済的・時間的自由 (Freedom)", level: 4, createdAt: now, updatedAt: now }
    ];

    const vision: FutureVision = {
      id: "fv_1",
      content: "自分のアイデアと技術を形にして人々に価値を届け、家族と自由な時間を過ごしながら世界中を冒険する人生",
      createdAt: now,
      updatedAt: now
    };

    const story: MainStory = {
      id: "story_1",
      title: "自律型プロダクトの開発と自由なライフスタイルの確立",
      description: "自身の強みを活かしたWebアプリケーションをリリースし、収益と自由な時間の両立を達成する。",
      futureVisionId: "fv_1",
      status: "active",
      progress: 35,
      startedAt: now - 1000 * 60 * 60 * 24 * 14,
      createdAt: now,
      updatedAt: now
    };

    const chapters: QuestChapter[] = [
      { id: "ch_1", storyId: "story_1", title: "Chapter 1: コアプロダクトの完成と検証", order: 0, status: "active" },
      { id: "ch_2", storyId: "story_1", title: "Chapter 2: ユーザー獲得と収益化モデルの確立", order: 1, status: "active" }
    ];

    const milestones: Milestone[] = [
      { id: "ms_1", chapterId: "ch_1", title: "マイルストーン 1: アプリの主要機能とUIの徹底磨き込み", order: 0, status: "active" },
      { id: "ms_2", chapterId: "ch_1", title: "マイルストーン 2: 最初のテストユーザーからのフィードバック収集", order: 1, status: "active" }
    ];

    const quests: Quest[] = [
      {
        id: "q_1",
        title: "朝のチェックインを行い、本日の活動方針を決める",
        description: "睡眠・気分・体調を記録し、本日のMP配分を計画する。",
        storyId: "story_1",
        chapterId: "ch_1",
        milestoneId: "ms_1",
        status: "active",
        difficulty: "easy",
        mpCost: 1,
        xpReward: 30,
        goldReward: 15,
        skillTags: ["自己管理", "マインドフルネス"],
        createdAt: now
      },
      {
        id: "q_2",
        title: "CrestwardのUIと操作フローを実際にテストする",
        description: "ホーム、クエスト、コンパス画面を巡回して使い心地を体感する。",
        storyId: "story_1",
        chapterId: "ch_1",
        milestoneId: "ms_1",
        status: "active",
        difficulty: "normal",
        mpCost: 2,
        xpReward: 80,
        goldReward: 40,
        skillTags: ["プロダクト開発", "UI/UX"],
        createdAt: now
      },
      {
        id: "q_3",
        title: "30分間の集中プログラミングで機能の仕上げを行う",
        description: "タイマーをセットして、最優先タスクに深く没頭する。",
        storyId: "story_1",
        chapterId: "ch_1",
        milestoneId: "ms_1",
        status: "active",
        difficulty: "hard",
        mpCost: 3,
        xpReward: 150,
        goldReward: 70,
        skillTags: ["エンジニアリング", "集中力"],
        createdAt: now
      }
    ];

    const experiments: Experiment[] = [
      {
        id: "exp_1",
        title: "毎朝15分の散歩と日光浴の習慣化",
        description: "朝のエネルギーと集中力を高めるための30日間実験。",
        durationDays: 30,
        status: "active",
        startedAt: now - 1000 * 60 * 60 * 24 * 7,
        relatedValueIds: ["v_4"]
      }
    ];

    const tensions: Tension[] = [
      {
        id: "ten_1",
        title: "日常の業務に追われ、長期的な創作の時間が削られる",
        currentState: "目の前の作業に時間を奪われ、本当に作りたいものに着手できていない",
        desiredState: "毎朝最優先で自分のコアプロジェクトに2時間を確保できている状態",
        relatedValueIds: ["v_1", "v_5"],
        createdAt: now
      }
    ];

    const futureScenes: FutureScene[] = [
      {
        id: "fs_1",
        title: "陽の光が入る書斎で、家族の笑顔を感じながら創作に没頭する朝",
        description: "時間と場所に縛られず、自分が誇れるプロダクトを世界に届けている情景。",
        relatedValueIds: ["v_1", "v_2"],
        createdAt: now
      }
    ];

    const skills: Skill[] = [
      { id: "sk_1", name: "プロダクト設計・UI/UX", level: 4, xp: 280 },
      { id: "sk_2", name: "エンジニアリング", level: 5, xp: 450 },
      { id: "sk_3", name: "自己管理・バイタリティ", level: 3, xp: 190 },
      { id: "sk_4", name: "発信・ストーリーテリング", level: 2, xp: 110 }
    ];

    const rewards: Reward[] = [
      { id: "rew_1", name: "極上のスペシャルティコーヒーブレイク ☕️", goldCost: 50 },
      { id: "rew_2", name: "気になっていたビジネス書を1冊購入 📚", goldCost: 120 },
      { id: "rew_3", name: "家族とお気に入りのカフェでスイーツタイム 🍰", goldCost: 200 },
      { id: "rew_4", name: "週末の日帰り温泉・サウナリフレッシュ ♨️", goldCost: 350 }
    ];

    const logs: StoryLog[] = [
      {
        id: "log_init_1",
        date: now - 1000 * 60 * 60 * 24 * 3,
        type: "story_started",
        title: "新たな物語「自律型プロダクトの開発」を開始",
        description: "未来の情景に向かって第一歩を踏み出しました。"
      },
      {
        id: "log_init_2",
        date: now - 1000 * 60 * 60 * 24 * 1,
        type: "quest_completed",
        title: "クエスト達成「開発環境と要件の整理」",
        description: "80 XP と 40 Gold を獲得しました。"
      }
    ];

    storage.saveSettings(settings);
    storage.saveValues(values);
    storage.saveFutureVision(vision);
    storage.saveStories([story]);
    storage.saveChapters(chapters);
    storage.saveMilestones(milestones);
    storage.saveQuests(quests);
    storage.saveExperiments(experiments);
    storage.saveTensions(tensions);
    storage.saveFutureScenes(futureScenes);
    storage.saveSkills(skills);
    storage.saveRewards(rewards);
    storage.saveStoryLogs(logs);
  }
};
