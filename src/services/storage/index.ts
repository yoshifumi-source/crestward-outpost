"use client";

import {
  UserSettings,
  Value,
  FutureVision,
  MainStory,
  GoalProject,
  Quest,
  Skill,
  Reward,
  StoryLog,
  DailyCheckIn,
  JournalEntry,
  DiscoveryEvidence,
  Pattern,
  Tension,
  FutureScene,
  Experiment,
  QuestChapter,
  Milestone
} from "@/types";

const STORAGE_PREFIX = "crestward_";

function get<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") return defaultValue;
  const item = localStorage.getItem(STORAGE_PREFIX + key);
  if (!item) return defaultValue;
  try {
    return JSON.parse(item);
  } catch (e) {
    console.error(`Error parsing ${key}`, e);
    return defaultValue;
  }
}

function set<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error saving ${key}`, e);
  }
}

export const storage = {
  // Settings & User
  getSettings: (): UserSettings => get<UserSettings>("settings", {
    name: "新米冒険者",
    title: "自律を探求する者",
    level: 1,
    xp: 0,
    xpToNextLevel: 100,
    onboardingCompleted: false,
    currentHp: 100,
    maxHp: 100,
    currentMp: 10,
    maxMp: 10,
    gold: 50,
  }),
  saveSettings: (settings: UserSettings) => set("settings", settings),

  addExperience: (amount: number): { leveledUp: boolean; newLevel: number } => {
    const settings = storage.getSettings();
    let currentXp = settings.xp + amount;
    let level = settings.level;
    let xpToNext = settings.xpToNextLevel;
    let leveledUp = false;

    while (currentXp >= xpToNext) {
      currentXp -= xpToNext;
      level += 1;
      xpToNext = Math.round(xpToNext * 1.5);
      leveledUp = true;
    }

    const updated = {
      ...settings,
      xp: currentXp,
      level,
      xpToNextLevel: xpToNext,
      maxHp: 100 + (level - 1) * 10,
      maxMp: 10 + (level - 1) * 2,
    };
    storage.saveSettings(updated);
    return { leveledUp, newLevel: level };
  },

  addGold: (goldGained: number) => {
    const settings = storage.getSettings();
    const updated = { ...settings, gold: Math.max(0, settings.gold + goldGained) };
    storage.saveSettings(updated);
    return updated.gold;
  },

  // Level 1: Future Vision & Core Values
  getFutureVision: () => get<FutureVision | null>("future_vision", null),
  saveFutureVision: (vision: FutureVision) => set("future_vision", vision),
  getValues: () => get<Value[]>("values", []),
  saveValues: (values: Value[]) => set("values", values),

  // Level 2: Strategic Main Stories (Multiple simultaneous active stories supported)
  getStories: () => get<MainStory[]>("stories", []),
  saveStories: (stories: MainStory[]) => set("stories", stories),
  getActiveStories: () => get<MainStory[]>("stories", []).filter(s => s.status === "active"),
  getActiveStory: () => get<MainStory[]>("stories", []).find(s => s.status === "active"),
  addStory: (story: MainStory) => {
    const stories = storage.getStories();
    storage.saveStories([story, ...stories]);
  },
  deleteStory: (storyId: string) => {
    const stories = storage.getStories().filter(s => s.id !== storyId);
    storage.saveStories(stories);
    const projects = storage.getProjects().filter(p => p.storyId !== storyId);
    storage.saveProjects(projects);
    const chapters = storage.getChapters().filter(c => c.storyId !== storyId);
    storage.saveChapters(chapters);
    const quests = storage.getQuests().filter(q => q.storyId !== storyId);
    storage.saveQuests(quests);
  },

  // Level 3: Means / Tracks (Projects under Story)
  getProjects: () => get<GoalProject[]>("goal_projects", []),
  saveProjects: (projects: GoalProject[]) => set("goal_projects", projects),
  addProject: (project: GoalProject) => {
    const current = storage.getProjects();
    storage.saveProjects([...current, project]);
    storage.recalculateStoryProgress(project.storyId);
  },
  deleteProject: (projectId: string) => {
    const projects = storage.getProjects();
    const target = projects.find(p => p.id === projectId);
    const storyId = target?.storyId;
    
    storage.saveProjects(projects.filter(p => p.id !== projectId));
    const milestones = storage.getMilestones().filter(m => m.projectId !== projectId);
    storage.saveMilestones(milestones);
    const quests = storage.getQuests().filter(q => q.projectId !== projectId);
    storage.saveQuests(quests);

    if (storyId) {
      storage.recalculateStoryProgress(storyId);
    }
  },

  // Level 5: Quests & Metrics
  getQuests: () => get<Quest[]>("quests", []),
  saveQuests: (quests: Quest[]) => {
    set("quests", quests);
    const stories = storage.getActiveStories();
    stories.forEach(s => storage.recalculateStoryProgress(s.id));
  },
  deleteQuest: (questId: string) => {
    const quests = storage.getQuests();
    const target = quests.find(q => q.id === questId);
    const storyId = target?.storyId;

    storage.saveQuests(quests.filter(q => q.id !== questId));
    if (storyId) {
      storage.recalculateStoryProgress(storyId);
    }
  },
  updateQuestMetric: (
    questId: string, 
    value: number, 
    isAbsolute = false, 
    note?: string
  ): { quest: Quest | null; isCompleted: boolean } => {
    const quests = storage.getQuests();
    const target = quests.find(q => q.id === questId);
    if (!target || !target.metric) return { quest: null, isCompleted: false };

    const oldVal = target.metric.currentValue || 0;
    const newVal = isAbsolute ? Math.max(0, value) : Math.max(0, oldVal + value);
    const amountAdded = isAbsolute ? (newVal - oldVal) : value;

    const logEntry = {
      id: `mpl_${Date.now()}`,
      date: Date.now(),
      amountAdded,
      totalAfter: newVal,
      note: note?.trim() || undefined
    };

    const history = target.metric.history || [];
    target.metric.currentValue = newVal;
    target.metric.history = [logEntry, ...history];

    const isCompleted = newVal >= target.metric.targetValue;
    if (isCompleted) {
      target.status = "completed";
      target.completedAt = Date.now();
    }

    storage.saveQuests(quests);

    storage.addStoryLog({
      id: `log_${Date.now()}`,
      date: Date.now(),
      type: "metric_progress_updated",
      title: `進捗記録: ${target.title}`,
      description: `${amountAdded >= 0 ? `+${amountAdded}` : amountAdded} ${target.metric.unit} （累計: ${newVal}/${target.metric.targetValue} ${target.metric.unit}）${note ? ` - ${note}` : ""}`,
      questId: target.id,
      storyId: target.storyId,
      projectId: target.projectId,
      metadata: {
        amountAdded,
        totalAfter: newVal,
        targetValue: target.metric.targetValue,
        unit: target.metric.unit,
        note
      }
    });

    if (target.storyId) {
      storage.recalculateStoryProgress(target.storyId);
    }

    return { quest: target, isCompleted };
  },

  // Dynamic Cascade Progress Recalculator
  recalculateStoryProgress: (storyId: string) => {
    const allProjects = storage.getProjects();
    const allQuests = storage.getQuests();
    const storyQuests = allQuests.filter(q => q.storyId === storyId);

    // Update each project's progress
    const updatedProjects = allProjects.map(proj => {
      if (proj.storyId !== storyId) return proj;
      const projQuests = storyQuests.filter(q => q.projectId === proj.id);
      if (projQuests.length === 0) return { ...proj, progress: 0 };

      let totalPercent = 0;
      projQuests.forEach(q => {
        if (q.status === "completed") {
          totalPercent += 100;
        } else if (q.metric && q.metric.targetValue > 0) {
          totalPercent += Math.min(100, (q.metric.currentValue / q.metric.targetValue) * 100);
        }
      });
      const progress = Math.min(100, Math.round(totalPercent / projQuests.length));
      return { ...proj, progress, updatedAt: Date.now() };
    });
    set("goal_projects", updatedProjects);

    // Update Main Story progress
    const allStories = storage.getStories();
    const story = allStories.find(s => s.id === storyId);
    if (story) {
      let storyProgress = 0;
      if (storyQuests.length > 0) {
        let totalPercent = 0;
        storyQuests.forEach(q => {
          if (q.status === "completed") {
            totalPercent += 100;
          } else if (q.metric && q.metric.targetValue > 0) {
            totalPercent += Math.min(100, (q.metric.currentValue / q.metric.targetValue) * 100);
          }
        });
        storyProgress = Math.min(100, Math.round(totalPercent / storyQuests.length));
      }
      const updatedStories = allStories.map(s => s.id === storyId ? { ...s, progress: storyProgress, updatedAt: Date.now() } : s);
      set("stories", updatedStories);
    }
  },

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
    storage.saveStoryLogs([log, ...logs]);
  },

  // Daily CheckIn
  getCheckIns: () => get<DailyCheckIn[]>("check_ins", []),
  saveCheckIns: (checkIns: DailyCheckIn[]) => set("check_ins", checkIns),

  // Journals
  getJournals: () => get<JournalEntry[]>("journals", []),
  saveJournals: (journals: JournalEntry[]) => set("journals", journals),

  // Guided Discovery
  getEvidence: () => get<DiscoveryEvidence[]>("discovery_evidence", []),
  saveEvidence: (evidence: DiscoveryEvidence[]) => set("discovery_evidence", evidence),
  getDiscoveryEvidences: () => get<DiscoveryEvidence[]>("discovery_evidence", []),
  saveDiscoveryEvidences: (evidence: DiscoveryEvidence[]) => set("discovery_evidence", evidence),

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

  // Preset Seeder (Multi-Goal & Multi-Tier Setup)
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

    // Level 1: Core Values
    const values: Value[] = [
      { id: "v_1", name: "経済的・時間的自由 (Freedom)", level: 5, createdAt: now, updatedAt: now },
      { id: "v_2", name: "創造性と表現 (Creativity)", level: 5, createdAt: now, updatedAt: now },
      { id: "v_3", name: "自己成長と学習 (Growth)", level: 4, createdAt: now, updatedAt: now },
      { id: "v_4", name: "健康とバイタリティ (Health)", level: 4, createdAt: now, updatedAt: now },
      { id: "v_5", name: "家族との豊かな時間 (Family)", level: 5, createdAt: now, updatedAt: now }
    ];

    // Level 1: Future Vision
    const vision: FutureVision = {
      id: "fv_1",
      content: "お金と時間に縛られず、自分が誇れるプロダクトを世界に届けながら家族と豊かに暮らす人生",
      createdAt: now,
      updatedAt: now
    };

    // Level 2: Multiple Active Strategic Goals (大目標を複数同時に設定)
    const stories: MainStory[] = [
      {
        id: "story_1",
        title: "お金に不自由しない生活（副業で年収100万円アップ）",
        description: "本業以外の複数の収益トラックを確立し、経済的自立と自由な時間の両立を達成する。",
        futureVisionId: "fv_1",
        status: "active",
        progress: 24,
        startedAt: now - 1000 * 60 * 60 * 24 * 14,
        createdAt: now,
        updatedAt: now
      },
      {
        id: "story_2",
        title: "開発・設計の専門書（全213ページ）を読破する",
        description: "日々の読書ページ数を記録し、知識とスキルを自分の武器にする。",
        futureVisionId: "fv_1",
        status: "active",
        progress: 26,
        startedAt: now - 1000 * 60 * 60 * 24 * 7,
        createdAt: now,
        updatedAt: now
      },
      {
        id: "story_3",
        title: "月間走行距離300kmのランニング習慣をつける",
        description: "実年齢マイナス20歳の体力とエネルギーを維持する。",
        futureVisionId: "fv_1",
        status: "active",
        progress: 12,
        startedAt: now - 1000 * 60 * 60 * 24 * 5,
        createdAt: now,
        updatedAt: now
      }
    ];

    // Level 3: Projects (Means / Tracks)
    const projects: GoalProject[] = [
      // Projects under Story 1: Side Income
      {
        id: "proj_app",
        storyId: "story_1",
        title: "📱 自作アプリの販売・リリースで稼ぐ",
        description: "Web/スマホアプリを開発・公開し、月5〜10万円のストック収益を作る",
        order: 0,
        status: "active",
        progress: 35,
        createdAt: now
      },
      {
        id: "proj_lecture",
        storyId: "story_1",
        title: "🎤 職場外グループでの講演・出張で稼ぐ",
        description: "専門知識や知見を活かして研修・セミナー・講演を行い、副収入を得る",
        order: 1,
        status: "active",
        progress: 10,
        createdAt: now
      },
      {
        id: "proj_goods",
        storyId: "story_1",
        title: "📦 物品販売で月1万円を安定して稼ぐ",
        description: "不用品整理や厳選アイテムの販売で即効性のあるキャッシュを生み出す",
        order: 2,
        status: "active",
        progress: 0,
        createdAt: now
      },

      // Projects under Story 2: Reading
      {
        id: "proj_reading",
        storyId: "story_2",
        title: "📚 専門書の集中読破・要約トラック",
        description: "毎日20〜30ページを読み進め、ノートに要点をまとめる",
        order: 0,
        status: "active",
        progress: 26,
        createdAt: now
      },

      // Projects under Story 3: Running
      {
        id: "proj_running",
        storyId: "story_3",
        title: "🏃 毎朝のジョギング＆体力強化トラック",
        description: "毎朝5〜10kmを走り、月間300kmの走破を目指す",
        order: 0,
        status: "active",
        progress: 12,
        createdAt: now
      }
    ];

    // Level 4: Milestones (Phases under Projects)
    const milestones: Milestone[] = [
      // App Project Milestones
      { id: "ms_app_1", chapterId: "ch_1", projectId: "proj_app", title: "① アプリ開発のための学習・インプット", order: 0, status: "active" },
      { id: "ms_app_2", chapterId: "ch_1", projectId: "proj_app", title: "② v1.0 プロトタイプ開発", order: 1, status: "active" },
      { id: "ms_app_3", chapterId: "ch_2", projectId: "proj_app", title: "③ リリース & 実機テスト・改善", order: 2, status: "active" },

      // Lecture Project Milestones
      { id: "ms_lec_1", chapterId: "ch_1", projectId: "proj_lecture", title: "① 講演テーマ選定と企画書・スライド作成", order: 0, status: "active" },

      // Goods Project Milestones
      { id: "ms_goods_1", chapterId: "ch_1", projectId: "proj_goods", title: "① 出品アイテムの選定と写真撮影・出品", order: 0, status: "active" },

      // Reading Project Milestones
      { id: "ms_read_1", chapterId: "ch_1", projectId: "proj_reading", title: "① 第1章〜第5章（基礎理論）の精読", order: 0, status: "active" },

      // Running Project Milestones
      { id: "ms_run_1", chapterId: "ch_1", projectId: "proj_running", title: "① 毎朝5kmランニングの習慣化", order: 0, status: "active" }
    ];

    // Level 5: Quests & Metrics under Milestones
    const quests: Quest[] = [
      // App Quests
      {
        id: "q_app_1",
        title: "アプリ開発の専門書テキストを探して選定する",
        description: "最適な技術書・チュートリアルを選んで手元に用意する（所要時間10分）。",
        storyId: "story_1",
        projectId: "proj_app",
        milestoneId: "ms_app_1",
        status: "completed",
        difficulty: "easy",
        mpCost: 1,
        xpReward: 40,
        goldReward: 20,
        skillTags: ["情報収集", "学習"],
        completedAt: now - 86400000 * 3,
        createdAt: now - 86400000 * 4
      },
      {
        id: "q_app_3",
        title: "開発ツールの選定と初期環境セットアップ",
        description: "エディタやフレームワークの準備を整える（所要時間15分）。",
        storyId: "story_1",
        projectId: "proj_app",
        milestoneId: "ms_app_2",
        status: "active",
        difficulty: "easy",
        mpCost: 1,
        xpReward: 50,
        goldReward: 25,
        skillTags: ["エンジニアリング"],
        createdAt: now
      },
      {
        id: "q_app_4",
        title: "v1.0 コア機能の画面モックとロジック実装",
        description: "一番大事なコア機能のみを最小構成で実装する。",
        storyId: "story_1",
        projectId: "proj_app",
        milestoneId: "ms_app_2",
        status: "active",
        difficulty: "hard",
        mpCost: 3,
        xpReward: 150,
        goldReward: 70,
        skillTags: ["エンジニアリング"],
        createdAt: now
      },
      {
        id: "q_app_5",
        title: "実機で使ってみて問題点・改善点を5つ洗い出す",
        description: "自分で実際に操作し、使いにくい部分をメモする。",
        storyId: "story_1",
        projectId: "proj_app",
        milestoneId: "ms_app_3",
        status: "active",
        difficulty: "normal",
        mpCost: 2,
        xpReward: 80,
        goldReward: 40,
        skillTags: ["品質改善", "UI/UX"],
        createdAt: now
      },

      // Lecture Quests
      {
        id: "q_lec_1",
        title: "社外向け講演のテーマ案を3つ書き出す",
        description: "自分が話せて相手の役に立つトピックを箇条書きで整理する。",
        storyId: "story_1",
        projectId: "proj_lecture",
        milestoneId: "ms_lec_1",
        status: "active",
        difficulty: "easy",
        mpCost: 1,
        xpReward: 40,
        goldReward: 20,
        skillTags: ["発信", "企画"],
        createdAt: now
      },

      // Goods Quests
      {
        id: "q_goods_1",
        title: "出品するアイテムを1つ選んで写真を撮影する",
        description: "明るい場所で綺麗に撮影し、出品の準備をする。",
        storyId: "story_1",
        projectId: "proj_goods",
        milestoneId: "ms_goods_1",
        status: "active",
        difficulty: "easy",
        mpCost: 1,
        xpReward: 40,
        goldReward: 20,
        skillTags: ["物販・実務"],
        createdAt: now
      },

      // Reading Quests (Story 2)
      {
        id: "q_read_1",
        title: "専門書（全213ページ）を読み進める",
        description: "日々の読書ページ数を記録し、知識をインプットする。",
        storyId: "story_2",
        projectId: "proj_reading",
        milestoneId: "ms_read_1",
        status: "active",
        difficulty: "normal",
        mpCost: 2,
        xpReward: 80,
        goldReward: 40,
        skillTags: ["自己研鑽", "プログラミング"],
        metric: {
          targetValue: 213,
          currentValue: 55,
          unit: "ページ",
          history: [
            { id: "mpl_1", date: now - 86400000 * 2, amountAdded: 30, totalAfter: 30, note: "第1章読了" },
            { id: "mpl_2", date: now - 86400000, amountAdded: 25, totalAfter: 55, note: "第2章読了" }
          ]
        },
        createdAt: now
      },

      // Running Quests (Story 3)
      {
        id: "q_run_1",
        title: "月間300kmランニングの走行距離を積み上げる",
        description: "走った距離を記録して月間目標を達成する。",
        storyId: "story_3",
        projectId: "proj_running",
        milestoneId: "ms_run_1",
        status: "active",
        difficulty: "normal",
        mpCost: 2,
        xpReward: 80,
        goldReward: 40,
        skillTags: ["体力強化", "健康"],
        metric: {
          targetValue: 300,
          currentValue: 35.5,
          unit: "km",
          history: [
            { id: "mpl_run_1", date: now - 86400000 * 4, amountAdded: 10, totalAfter: 10, note: "週末ロング走" },
            { id: "mpl_run_2", date: now - 86400000 * 2, amountAdded: 15.5, totalAfter: 25.5, note: "朝ラン" },
            { id: "mpl_run_3", date: now - 86400000, amountAdded: 10, totalAfter: 35.5, note: "ナイトラン" }
          ]
        },
        createdAt: now
      }
    ];

    const chapters: QuestChapter[] = [
      { id: "ch_1", storyId: "story_1", title: "第1フェーズ: 基礎構築とプロトタイプ", order: 0, status: "active" },
      { id: "ch_2", storyId: "story_1", title: "第2フェーズ: リリースと収益化", order: 1, status: "active" }
    ];

    const experiments: Experiment[] = [
      {
        id: "exp_1",
        title: "毎朝30分のアプリ開発集中タイム",
        description: "朝一番のエネルギーが高い時間にコードを書く30日間の実験。",
        durationDays: 30,
        status: "active",
        startedAt: now - 1000 * 60 * 60 * 24 * 7,
        relatedValueIds: ["v_1", "v_2"]
      }
    ];

    const tensions: Tension[] = [
      {
        id: "ten_1",
        title: "日常の業務に追われ、副業プロジェクトの時間が削られる",
        currentState: "目の前の作業に時間を奪われ、本当に作りたいものに着手できていない",
        desiredState: "毎朝最優先で自分のコアプロジェクトに時間を確保できている状態",
        relatedValueIds: ["v_1", "v_2"],
        createdAt: now
      }
    ];

    const futureScenes: FutureScene[] = [
      {
        id: "fs_1",
        title: "自作アプリからの収益通知を見ながら、家族と笑顔で朝食をとる風景",
        description: "時間と場所に縛られず、自分が誇れるプロダクトを作りながら豊かに暮らしている。",
        relatedValueIds: ["v_1", "v_5"],
        createdAt: now
      }
    ];

    const skills: Skill[] = [
      { id: "sk_1", name: "アプリ開発・設計", level: 4, xp: 280 },
      { id: "sk_2", name: "企画・プレゼン", level: 3, xp: 190 },
      { id: "sk_3", name: "物販・マーケティング", level: 2, xp: 110 }
    ];

    const rewards: Reward[] = [
      { id: "rew_1", name: "極上のスペシャルティコーヒーブレイク ☕️", goldCost: 50 },
      { id: "rew_2", name: "気になっていた専門書を1冊購入 📚", goldCost: 120 },
      { id: "rew_3", name: "家族とお気に入りのカフェでスイーツタイム 🍰", goldCost: 200 },
      { id: "rew_4", name: "週末の日帰り温泉・サウナリフレッシュ ♨️", goldCost: 350 }
    ];

    const logs: StoryLog[] = [
      {
        id: "log_init_1",
        date: now - 1000 * 60 * 60 * 24 * 7,
        type: "story_started",
        title: "大目標「お金に不自由しない生活（副業年収100万）」を開始",
        description: "3つのプロジェクト（アプリ販売・講演・物販）を立ち上げました。"
      },
      {
        id: "log_init_2",
        date: now - 1000 * 60 * 60 * 24 * 3,
        type: "quest_completed",
        title: "クエスト達成「アプリ開発の専門書テキストを探して選定」",
        description: "40 XP と 20 Gold を獲得しました。"
      }
    ];

    storage.saveSettings(settings);
    storage.saveValues(values);
    storage.saveFutureVision(vision);
    storage.saveStories(stories);
    storage.saveProjects(projects);
    storage.saveChapters(chapters);
    storage.saveMilestones(milestones);
    storage.saveQuests(quests);
    storage.saveExperiments(experiments);
    storage.saveTensions(tensions);
    storage.saveFutureScenes(futureScenes);
    storage.saveSkills(skills);
    storage.saveRewards(rewards);
    storage.saveStoryLogs(logs);

    stories.forEach(s => storage.recalculateStoryProgress(s.id));
  }
};
