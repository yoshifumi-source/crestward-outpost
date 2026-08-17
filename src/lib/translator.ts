// Comprehensive English -> Japanese Translator for AI Discovery & Quest Analysis

const EXACT_PHRASE_MAP: Record<string, string> = {
  // Patterns & Core Themes
  "Growth through improvement": "改善を通じた自己成長",
  "Desire for effective self-control": "自律と自己決定の欲求",
  "Contribution through competence": "専門能力を通じた貢献と価値提供",
  "Growth & Optimization": "創造性とプロセスの最適化",
  "Autonomy & Freedom": "自律と時間・場所の自由",
  "Family & Connection": "家族や大切な人との豊かな時間",
  "Health & Vitality": "健康とバイタリティ",
  "Creativity & Expression": "創造性と自己表現",
  "Learning & Curiosity": "継続的な学習と知的好奇心",
  "Purpose & Impact": "目的意識と社会への価値提供",
  "Financial Freedom": "経済的・時間的自由の獲得",
  "Mastery & Excellence": "卓越した技術の習得と熟達",
  "Self-discipline & Focus": "自己規律と深い集中",
  "Mindfulness & Peace": "マインドフルネスと心の平穏",
  "Exploration & Adventure": "探求と冒険の精神",
  "Work-Life Balance": "仕事と私生活の調和",
  "Personal Growth": "自己成長と進化",
  "Deep Focus & Flow": "深い集中とフロー体験",
  "Efficiency & Structure": "効率化と仕組みづくり",
  "Empathy & Community": "共感と支え合えるコミュニティ",
  "Resilience & Adaptability": "回復力と柔軟な適応力",
  "Clarity & Vision": "明確な未来のビジョン",

  // Tensions & Gaps
  "Family and personal time": "家族との時間と自分の一人時間の調和",
  "Daily tasks and creative vision": "目の前の日常業務と長期的な創作のバランス",
  "Speed vs perfection": "スピードと完成度のバランス",
  "Structure vs flexibility": "規律と柔軟性のバランス",
  "Energy depletion vs ambition": "活力の消耗と高い目標のギャップ",

  // Story Candidates & Experiments
  "Balanced personal time": "自分を回復・成長させる一人時間を作る",
  "Create a dedicated personal recharge time": "自分を回復・成長させる一人時間を作る",
  "Establish a sustainable morning routine": "持続可能な朝の集中習慣を確立する",
  "Build an autonomous product": "自律型プロダクトの開発と自由な暮らしの実現",
  "Strengthen core technical skills": "コア技術スキルの習得と実践",
  "Secure 30 minutes of uninterrupted focus daily": "毎日30分の邪魔されない集中時間を確保する",
  "Test a 30-day morning focus habit": "朝の集中時間を30日試す",
  "30-day energy management experiment": "30日間のエネルギー管理実験"
};

const VOCAB_MAP: [RegExp, string][] = [
  [/\bGrowth\b/gi, "成長"],
  [/\bOptimization\b/gi, "最適化"],
  [/\bImprovement\b/gi, "改善"],
  [/\bAutonomy\b/gi, "自律"],
  [/\bFreedom\b/gi, "自由"],
  [/\bControl\b/gi, "自己管理"],
  [/\bCompetence\b/gi, "能力・専門性"],
  [/\bContribution\b/gi, "貢献"],
  [/\bFamily\b/gi, "家族"],
  [/\bConnection\b/gi, "繋がり"],
  [/\bHealth\b/gi, "健康"],
  [/\bVitality\b/gi, "活力"],
  [/\bCreativity\b/gi, "創造性"],
  [/\bExpression\b/gi, "表現"],
  [/\bLearning\b/gi, "学習"],
  [/\bCuriosity\b/gi, "知的好奇心"],
  [/\bDiscipline\b/gi, "自己規律"],
  [/\bFocus\b/gi, "集中"],
  [/\bBalance\b/gi, "調和・バランス"],
  [/\bEfficiency\b/gi, "効率化"],
  [/\bProductivity\b/gi, "生産性"],
  [/\bAdventure\b/gi, "冒険"],
  [/\bJourney\b/gi, "旅路"],
  [/\bChallenge\b/gi, "挑戦"],
  [/\bHabit\b/gi, "習慣"],
  [/\bRoutine\b/gi, "ルーティン"],
  [/\bhigh\b/gi, "高"],
  [/\bmedium\b/gi, "中"],
  [/\blow\b/gi, "低"],
];

/**
 * Translates any string from English to natural Japanese.
 */
export function translateText(input?: string): string {
  if (!input || typeof input !== "string") return "";
  const trimmed = input.trim();
  if (!trimmed) return "";

  // 1. Direct exact phrase match
  if (EXACT_PHRASE_MAP[trimmed]) {
    return EXACT_PHRASE_MAP[trimmed];
  }

  // 2. Check if string is already mostly Japanese (contains Hiragana or Katakana or Kanji)
  const hasJapanese = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(trimmed);
  if (hasJapanese) {
    // If it has Japanese, we only replace embedded English words like "Growth" or "Family"
    let result = trimmed;
    for (const [pattern, replacement] of VOCAB_MAP) {
      result = result.replace(pattern, replacement);
    }
    return result;
  }

  // 3. Translate common English patterns
  let translated = trimmed;
  for (const [exact, repl] of Object.entries(EXACT_PHRASE_MAP)) {
    if (translated.includes(exact)) {
      translated = translated.split(exact).join(repl);
    }
  }

  // 4. Word-by-word replacement
  for (const [pattern, replacement] of VOCAB_MAP) {
    translated = translated.replace(pattern, replacement);
  }

  return translated;
}

/**
 * Deeply translates an entire AI analysis result JSON object.
 */
export function translateAnalysisJson(data: any): any {
  if (!data || typeof data !== "object") return data;

  const result: any = { ...data };

  // 1. Patterns
  if (Array.isArray(result.patterns)) {
    result.patterns = result.patterns.map((p: any) => ({
      ...p,
      title: translateText(p.title),
      description: translateText(p.description),
      confidence: p.confidence === "high" || p.confidence === "medium" || p.confidence === "low" 
        ? p.confidence 
        : "high"
    }));
  }

  // 2. Values
  if (Array.isArray(result.values)) {
    result.values = result.values.map((v: any) => ({
      ...v,
      name: translateText(v.name),
      description: translateText(v.description),
      evidence: Array.isArray(v.evidence) ? v.evidence.map(translateText) : []
    }));
  }

  // 3. Tensions
  if (Array.isArray(result.tensions)) {
    result.tensions = result.tensions.map((t: any) => ({
      ...t,
      title: translateText(t.title),
      currentState: translateText(t.currentState),
      desiredState: translateText(t.desiredState),
      whyItMatters: translateText(t.whyItMatters)
    }));
  }

  // 4. Future Scenes
  if (Array.isArray(result.futureScenes)) {
    result.futureScenes = result.futureScenes.map((f: any) => ({
      ...f,
      title: translateText(f.title),
      description: translateText(f.description)
    }));
  }

  // 5. Story Candidates
  if (Array.isArray(result.storyCandidates)) {
    result.storyCandidates = result.storyCandidates.map((s: any) => ({
      ...s,
      title: translateText(s.title),
      description: translateText(s.description),
      relatedValues: Array.isArray(s.relatedValues) ? s.relatedValues.map(translateText) : [],
      realWorldUnlocks: Array.isArray(s.realWorldUnlocks) ? s.realWorldUnlocks.map(translateText) : []
    }));
  }

  // 6. Experiments
  if (Array.isArray(result.experiments)) {
    result.experiments = result.experiments.map((e: any) => ({
      ...e,
      title: translateText(e.title),
      description: translateText(e.description),
      durationDays: Number(e.durationDays) || 30
    }));
  }

  // 7. Chapters & Quests (if from quest builder)
  if (Array.isArray(result.chapters)) {
    result.chapters = result.chapters.map((ch: any) => ({
      ...ch,
      title: translateText(ch.title),
      milestones: Array.isArray(ch.milestones) ? ch.milestones.map((m: any) => ({
        ...m,
        title: translateText(m.title),
        quests: Array.isArray(m.quests) ? m.quests.map((q: any) => ({
          ...q,
          title: translateText(q.title),
          description: translateText(q.description)
        })) : []
      })) : []
    }));
  }

  return result;
}
