export type Value = {
  id: string;
  name: string;
  level: number; // 1-5
  createdAt: number;
  updatedAt: number;
};

export type ValueSnapshot = {
  id: string;
  date: string; // YYYY-MM
  values: Record<string, number>; // value name -> level
};

export type FutureVision = {
  id: string;
  content: string;
  createdAt: number;
  updatedAt: number;
};

export type StoryStatus = 
  | "active"
  | "completed"
  | "pivoted"
  | "evolved"
  | "dormant"
  | "abandoned";

export type MainStory = {
  id: string;
  title: string;
  description: string;
  futureVisionId?: string;
  status: StoryStatus;
  progress: number; // 0-100
  metric?: QuestMetric;
  startedAt: number;
  endedAt?: number;
  parentStoryId?: string;
  nextStoryId?: string;
  pivotReason?: string;
  createdAt: number;
  updatedAt: number;
};

export type ProjectStatus = "active" | "completed" | "dormant" | "paused";

export type GoalProject = {
  id: string;
  storyId: string;
  title: string; // 例: "アプリ販売で稼ぐ", "社外講演・出張", "物品販売"
  description?: string;
  icon?: string;
  order: number;
  status: ProjectStatus;
  progress: number; // 0-100
  metric?: QuestMetric;
  createdAt: number;
  updatedAt?: number;
};

export type QuestDifficulty = "easy" | "normal" | "hard" | "very_hard";
export type QuestStatus = "active" | "completed" | "paused" | "abandoned";

export type MetricProgressLog = {
  id: string;
  date: number; // timestamp
  amountAdded: number;
  totalAfter: number;
  note?: string;
};

export type QuestMetric = {
  targetValue: number; // 目標値 (例: 1000000, 213, 300)
  currentValue: number; // 現在値 (例: 250000, 55, 30)
  unit: string; // 単位 (例: "円", "ページ", "km", "回", "時間")
  history?: MetricProgressLog[];
};

export type SubTask = {
  id: string;
  title: string;
  completed: boolean;
  createdAt: number;
  completedAt?: number;
};

export type Quest = {
  id: string;
  title: string;
  description: string;
  storyId: string;
  projectId?: string;
  parentQuestId?: string;
  chapterId?: string;
  milestoneId?: string;
  status: QuestStatus;
  difficulty: QuestDifficulty;
  mpCost: number;
  xpReward: number;
  goldReward: number;
  skillTags: string[];
  metric?: QuestMetric;
  subTasks?: SubTask[];
  dueDate?: number;
  completedAt?: number;
  createdAt: number;
};

export type Skill = {
  id: string;
  name: string;
  level: number;
  xp: number;
};

export type Reward = {
  id: string;
  name: string;
  goldCost: number;
};

export type LogType = 
  | "story_started"
  | "quest_completed"
  | "metric_progress_updated"
  | "story_pivoted"
  | "story_evolved"
  | "value_changed"
  | "milestone_reached"
  | "journal_insight"
  | "discovery_started"
  | "pattern_confirmed"
  | "value_confirmed"
  | "tension_created"
  | "future_scene_created"
  | "experiment_started"
  | "experiment_completed"
  | "story_candidate_selected"
  | "ai_analysis_imported"
  | "quest_line_created"
  | "project_created";

export type StoryLog = {
  id: string;
  date: number; // timestamp
  type: LogType;
  title: string;
  description?: string;
  storyId?: string;
  projectId?: string;
  questId?: string;
  metadata?: Record<string, any>;
};

export type DailyCheckIn = {
  id: string;
  date: string; // YYYY-MM-DD
  sleep: number; // 1-5
  energy: number; // 1-5
  mood: number; // 1-5
  physicalCondition: number; // 1-5
  calculatedHp: number;
  calculatedMp: number;
};

export type JournalEntry = {
  id: string;
  date: string; // YYYY-MM-DD
  mostAdvancedStory?: string;
  mpDrainers?: string;
  tomorrowStrategy?: string;
  freeText?: string;
};

export type UserSettings = {
  name: string;
  title: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  onboardingCompleted: boolean;
  currentHp: number;
  maxHp: number;
  currentMp: number;
  maxMp: number;
  gold: number;
  lastCheckInDate?: string;
};

// --- Guided Discovery Data Models ---

export type EvidenceType =
  | "journal"
  | "frustration"
  | "aspiration"
  | "joy"
  | "envy"
  | "flow"
  | "custom";

export interface DiscoveryEvidence {
  id: string;
  type: EvidenceType;
  title?: string;
  content: string;
  createdAt: number;
  includedInAnalysis: boolean;
}

export interface Pattern {
  id: string;
  title: string;
  description: string;
  confidence?: "low" | "medium" | "high";
  source: "manual" | "ai-import";
  userResponse?: "accepted" | "unsure" | "rejected";
}

export interface Tension {
  id: string;
  title: string;
  currentState: string;
  desiredState: string;
  whyItMatters?: string;
  relatedValueIds: string[];
  createdAt: number;
}

export interface FutureScene {
  id: string;
  title: string;
  description: string;
  tensionId?: string;
  relatedValueIds: string[];
  createdAt: number;
}

export type ExperimentStatus = "planned" | "active" | "completed" | "stopped";

export interface Experiment {
  id: string;
  title: string;
  description?: string;
  hypothesis?: string;
  durationDays?: number;
  startedAt?: number;
  endedAt?: number;
  status: ExperimentStatus;
  relatedValueIds: string[];
  relatedTensionId?: string;
  outcome?: "helpful" | "mixed" | "not_helpful";
  reflection?: string;
}

export interface QuestChapter {
  id: string;
  storyId: string;
  projectId?: string;
  title: string;
  order: number;
  status: "active" | "completed";
}

export interface Milestone {
  id: string;
  chapterId: string;
  projectId?: string;
  title: string;
  order: number;
  status: "active" | "completed";
  metric?: QuestMetric;
}
