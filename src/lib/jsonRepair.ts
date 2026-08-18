/**
 * Robust JSON extraction, repair, and lenient parsing utility for LLM outputs
 */

export function extractAndParseJson<T = any>(rawText: string): T | null {
  if (!rawText || !rawText.trim()) return null;

  let text = rawText.trim();

  // 1. Tag extraction: ---CRESTWARD_JSON_START--- ... ---CRESTWARD_JSON_END---
  const startTag = "---CRESTWARD_JSON_START---";
  const endTag = "---CRESTWARD_JSON_END---";

  if (text.includes(startTag)) {
    const afterStart = text.split(startTag)[1];
    if (afterStart.includes(endTag)) {
      text = afterStart.split(endTag)[0].trim();
    } else {
      text = afterStart.trim();
    }
  } else {
    // Check for markdown code blocks
    const mdMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (mdMatch) {
      text = mdMatch[1].trim();
    } else {
      // Find outermost JSON brackets
      const firstBrace = text.indexOf("{");
      const lastBrace = text.lastIndexOf("}");
      if (firstBrace !== -1) {
        if (lastBrace !== -1 && lastBrace > firstBrace) {
          text = text.slice(firstBrace, lastBrace + 1);
        } else {
          text = text.slice(firstBrace);
        }
      }
    }
  }

  // 2. Direct parse attempt
  try {
    return JSON.parse(text);
  } catch (e) {
    // Proceed to repair
  }

  // 3. Sanitization & Repair pipeline
  let sanitized = text
    // Replace smart quotes
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    // Remove JS comments (// ... and /* ... */)
    .replace(/\/\/.*$/gm, "")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    // Remove standalone ellipsis (... or …) that are not inside strings
    .replace(/,\s*(?:\.\.\.|…)\s*/g, "")
    .replace(/\[\s*(?:\.\.\.|…)\s*\]/g, "[]")
    .replace(/\{\s*(?:\.\.\.|…)\s*\}/g, "{}")
    .replace(/:\s*(?:\.\.\.|…)/g, ': ""')
    // Remove trailing commas before } or ]
    .replace(/,\s*([\}\]])/g, "$1");

  try {
    return JSON.parse(sanitized);
  } catch (e) {
    // Proceed to auto-closing brackets repair
  }

  // 4. Auto-closing unclosed brackets / braces
  let repaired = sanitized;
  let openBraces = 0;
  let openBrackets = 0;
  let inString = false;
  let escape = false;

  for (let i = 0; i < repaired.length; i++) {
    const ch = repaired[i];
    if (escape) {
      escape = false;
      continue;
    }
    if (ch === "\\") {
      escape = true;
      continue;
    }
    if (ch === '"') {
      inString = !inString;
      continue;
    }
    if (!inString) {
      if (ch === "{") openBraces++;
      else if (ch === "}") openBraces = Math.max(0, openBraces - 1);
      else if (ch === "[") openBrackets++;
      else if (ch === "]") openBrackets = Math.max(0, openBrackets - 1);
    }
  }

  // If inside unclosed string, close it
  if (inString) {
    repaired += '"';
  }

  // Clean trailing commas before closing
  repaired = repaired.replace(/,\s*$/, "");

  // Close open brackets & braces
  while (openBrackets > 0) {
    repaired += "]";
    openBrackets--;
  }
  while (openBraces > 0) {
    repaired += "}";
    openBraces--;
  }

  try {
    return JSON.parse(repaired);
  } catch (e) {
    // Proceed to regex fallback
  }

  // 5. Ultimate Regex Segment Extractor
  return extractPartialSections(rawText);
}

function extractPartialSections(text: string): any {
  const result: any = {
    patterns: [],
    values: [],
    tensions: [],
    futureScenes: [],
    storyCandidates: [],
    experiments: []
  };

  // Helper to extract array of objects with title/name
  const extractItems = (keyRegex: RegExp, fieldExtractors: Record<string, RegExp>): any[] => {
    const sectionMatch = text.match(keyRegex);
    if (!sectionMatch) return [];
    
    const items: any[] = [];
    const blockText = sectionMatch[1];
    
    // Split by { ... } objects
    const objMatches = blockText.match(/\{[\s\S]*?\}/g);
    if (objMatches) {
      for (const objStr of objMatches) {
        const item: any = {};
        for (const [field, regex] of Object.entries(fieldExtractors)) {
          const fm = objStr.match(regex);
          if (fm && fm[1]) {
            item[field] = fm[1].trim();
          }
        }
        if (Object.keys(item).length > 0) {
          items.push(item);
        }
      }
    }
    return items;
  };

  result.patterns = extractItems(
    /"patterns"\s*:\s*\[([\s\S]*?)(?:\]|\n\s*"[a-zA-Z]+")/i,
    {
      title: /"title"\s*:\s*"([^"]+)"/,
      description: /"description"\s*:\s*"([^"]+)"/,
      confidence: /"confidence"\s*:\s*"([^"]+)"/
    }
  );

  result.values = extractItems(
    /"values"\s*:\s*\[([\s\S]*?)(?:\]|\n\s*"[a-zA-Z]+")/i,
    {
      name: /"name"\s*:\s*"([^"]+)"/,
      description: /"description"\s*:\s*"([^"]+)"/
    }
  );

  result.tensions = extractItems(
    /"tensions"\s*:\s*\[([\s\S]*?)(?:\]|\n\s*"[a-zA-Z]+")/i,
    {
      title: /"title"\s*:\s*"([^"]+)"/,
      currentState: /"currentState"\s*:\s*"([^"]+)"/,
      desiredState: /"desiredState"\s*:\s*"([^"]+)"/
    }
  );

  result.futureScenes = extractItems(
    /"futureScenes"\s*:\s*\[([\s\S]*?)(?:\]|\n\s*"[a-zA-Z]+")/i,
    {
      title: /"title"\s*:\s*"([^"]+)"/,
      description: /"description"\s*:\s*"([^"]+)"/
    }
  );

  result.storyCandidates = extractItems(
    /"storyCandidates"\s*:\s*\[([\s\S]*?)(?:\]|\n\s*"[a-zA-Z]+")/i,
    {
      title: /"title"\s*:\s*"([^"]+)"/,
      description: /"description"\s*:\s*"([^"]+)"/
    }
  );

  // If at least one section was successfully extracted
  const hasData = result.patterns.length > 0 || 
                  result.values.length > 0 || 
                  result.tensions.length > 0 || 
                  result.futureScenes.length > 0 || 
                  result.storyCandidates.length > 0;

  return hasData ? result : null;
}
