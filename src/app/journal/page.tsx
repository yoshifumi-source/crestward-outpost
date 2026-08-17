"use client";

import { useEffect, useState } from "react";
import { storage } from "@/services/storage";
import { StoryLog, Reward, UserSettings } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  BookOpen, 
  Sparkles, 
  Coins, 
  Award, 
  HelpCircle, 
  Map, 
  Compass, 
  Target, 
  CheckCircle2, 
  Plus, 
  Heart, 
  Zap, 
  Sun,
  Flame,
  Coffee,
  Check
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

export default function JournalAndGuidePage() {
  const [activeTab, setActiveTab] = useState<"logs" | "tavern" | "guide">("guide");
  const [logs, setLogs] = useState<StoryLog[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [settings, setSettings] = useState<UserSettings | null>(null);

  // New reward modal
  const [isAddRewardOpen, setIsAddRewardOpen] = useState(false);
  const [newRewardName, setNewRewardName] = useState("");
  const [newRewardCost, setNewRewardCost] = useState(50);

  const loadData = () => {
    setLogs(storage.getStoryLogs());
    setRewards(storage.getRewards());
    setSettings(storage.getSettings());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handlePurchaseReward = (reward: Reward) => {
    if (!settings) return;

    if (settings.gold < reward.goldCost) {
      alert(`ゴールドが足りません！（必要: ${reward.goldCost}G / 所持: ${settings.gold}G）\nクエストをクリアしてゴールドを稼ぎましょう！`);
      return;
    }

    storage.addGold(-reward.goldCost);

    storage.addStoryLog({
      id: `log_${Date.now()}`,
      date: Date.now(),
      type: "milestone_reached",
      title: `リワード獲得: ${reward.name}`,
      description: `${reward.goldCost} Gold を消費して自分へのご褒美を獲得しました。`
    });

    alert(`🎉 ご褒美獲得おめでとうございます！\n\n「${reward.name}」\n\n現実世界で思いっきり満喫してください！ (-${reward.goldCost} G)`);
    loadData();
  };

  const handleAddReward = () => {
    if (!newRewardName.trim()) return;

    const newRew: Reward = {
      id: `rew_${Date.now()}`,
      name: newRewardName.trim(),
      goldCost: Number(newRewardCost) || 50
    };

    const updated = [...rewards, newRew];
    storage.saveRewards(updated);
    setIsAddRewardOpen(false);
    setNewRewardName("");
    setNewRewardCost(50);
    loadData();
  };

  return (
    <main className="flex flex-col min-h-screen p-4 pb-28 mx-auto max-w-md">
      {/* Header */}
      <header className="mb-4 pt-2">
        <div className="flex items-center justify-between mb-2 px-1">
          <div className="flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-emerald-600" />
            <h1 className="text-[11px] font-black text-emerald-800 uppercase tracking-widest">
              冒険録 & 酒場 (Chronicles)
            </h1>
          </div>
          {settings && (
            <div className="flex items-center gap-1 text-xs font-mono font-bold text-amber-700 bg-amber-50 border border-amber-200/80 px-2.5 py-0.5 rounded-full">
              <Coins className="w-3.5 h-3.5 text-amber-500" />
              {settings.gold} G
            </div>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="flex bg-stone-200/70 p-1 rounded-2xl">
          <button
            onClick={() => setActiveTab("guide")}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 ${
              activeTab === "guide" ? "bg-white text-stone-800 shadow-sm" : "text-stone-500 hover:text-stone-800"
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5 text-emerald-600" />
            冒険の手引き
          </button>
          <button
            onClick={() => setActiveTab("tavern")}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 ${
              activeTab === "tavern" ? "bg-white text-stone-800 shadow-sm" : "text-stone-500 hover:text-stone-800"
            }`}
          >
            <Coins className="w-3.5 h-3.5 text-amber-500" />
            酒場 (リワード)
          </button>
          <button
            onClick={() => setActiveTab("logs")}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 ${
              activeTab === "logs" ? "bg-white text-stone-800 shadow-sm" : "text-stone-500 hover:text-stone-800"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
            冒険の足跡
          </button>
        </div>
      </header>

      {/* TAB 1: 冒険の手引き (Interactive In-App Manual) */}
      {activeTab === "guide" && (
        <section className="space-y-4 animate-fadeIn">
          {/* Intro card */}
          <div className="glass-panel p-5 rounded-3xl border border-stone-200 shadow-sm">
            <h2 className="text-base font-black text-stone-800 mb-1 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              Crestwardの世界へようこそ！
            </h2>
            <p className="text-xs font-medium text-stone-600 leading-relaxed">
              Crestwardは、あなたの人生を「オープンワールドRPG」のように見立て、自分だけの価値観や目標を発見し、日々のクエストとしてクリアしていくツールです。
            </p>
          </div>

          {/* Guide Item 1 */}
          <div className="glass-panel p-4 rounded-2xl border border-stone-200 shadow-2xs">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-800 font-black text-xs flex items-center justify-center">
                1
              </div>
              <h3 className="font-black text-sm text-stone-800">朝のチェックインとHP/MP</h3>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed mb-3">
              毎朝、ホーム画面の「朝のデイリーチェックイン」から睡眠や体調を記録します。
            </p>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-100 text-rose-900">
                <span className="font-bold flex items-center gap-1 mb-0.5">
                  <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" /> HP (体力)
                </span>
                一日の活動許容量。睡眠と身体の軽さで回復。
              </div>
              <div className="p-2.5 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-900">
                <span className="font-bold flex items-center gap-1 mb-0.5">
                  <Zap className="w-3.5 h-3.5 fill-indigo-500 text-indigo-500" /> MP (気力)
                </span>
                クエスト実行コスト。気分と活力で回復。
              </div>
            </div>
          </div>

          {/* Guide Item 2 */}
          <div className="glass-panel p-4 rounded-2xl border border-stone-200 shadow-2xs">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-xl bg-amber-100 text-amber-800 font-black text-xs flex items-center justify-center">
                2
              </div>
              <h3 className="font-black text-sm text-stone-800">クエスト達成とWHYボタン</h3>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed mb-2">
              クエストをクリアすると、経験値（XP）とGoldが手に入り、レベルアップします。
            </p>
            <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200/60 text-xs text-amber-950 flex items-start gap-2">
              <HelpCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block mb-0.5">「？」ボタンで目的を再確認</span>
                クエスト右上の「？」を押すと、今やっているタスクが「どのマイルストーン、どのメインストーリー、どの未来」に繋がっているのかを瞬時に振り返ることができます。
              </div>
            </div>
          </div>

          {/* Guide Item 3 */}
          <div className="glass-panel p-4 rounded-2xl border border-stone-200 shadow-2xs">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-xl bg-indigo-100 text-indigo-800 font-black text-xs flex items-center justify-center">
                3
              </div>
              <h3 className="font-black text-sm text-stone-800">コンパスとAI自己探索</h3>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed mb-2">
              「コンパス」画面では、自分が大切にしたい価値観（Values）や抱えているギャップ（Tensions）を確認できます。
            </p>
            <p className="text-[11px] text-stone-500 bg-stone-50 p-2.5 rounded-xl border border-stone-100">
              💡 迷ったときはいつでも「Guided Discovery」でAIプロンプトを生成し、ChatGPT等に相談して自分らしい物語をインポートできます。
            </p>
          </div>

          {/* Guide Item 4 */}
          <div className="glass-panel p-4 rounded-2xl border border-stone-200 shadow-2xs">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-xl bg-purple-100 text-purple-800 font-black text-xs flex items-center justify-center">
                4
              </div>
              <h3 className="font-black text-sm text-stone-800">酒場で現実のご褒美を獲得</h3>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              稼いだGoldは、本画面の「酒場」タブで現実の自分へのご褒美（コーヒーやスイーツ、温泉など）と交換して楽しみましょう！
            </p>
          </div>
        </section>
      )}

      {/* TAB 2: 酒場 (Tavern / Reward Shop) */}
      {activeTab === "tavern" && (
        <section className="space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between px-1">
            <div>
              <h2 className="text-sm font-black text-stone-800">酒場のリワードショップ</h2>
              <p className="text-[11px] text-stone-500">Goldを消費して現実の自分にご褒美をあげましょう。</p>
            </div>
            <button
              onClick={() => setIsAddRewardOpen(true)}
              className="text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1"
            >
              <Plus className="w-3 h-3" /> ご褒美追加
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {rewards.map((reward) => (
              <div
                key={reward.id}
                onClick={() => handlePurchaseReward(reward)}
                className="cursor-pointer glass-panel p-4 rounded-2xl border border-stone-200 shadow-2xs hover:shadow-md hover:border-amber-300 transition-all flex flex-col justify-between group active:scale-95"
              >
                <h3 className="font-bold text-xs text-stone-800 mb-3 group-hover:text-amber-700 transition-colors leading-snug">
                  {reward.name}
                </h3>
                <div className="flex items-center justify-between pt-2 border-t border-stone-100">
                  <span className="text-[10px] font-bold text-stone-400">交換</span>
                  <span className="text-xs font-mono font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md flex items-center gap-1 border border-amber-200/60">
                    <Coins className="w-3.5 h-3.5 text-amber-500" />
                    {reward.goldCost} G
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* TAB 3: 冒険の足跡 (Story Chronicles / Logs) */}
      {activeTab === "logs" && (
        <section className="space-y-3 animate-fadeIn">
          <h2 className="text-xs font-black text-stone-500 uppercase tracking-widest px-1">
            冒険のタイムライン
          </h2>

          {logs.length === 0 ? (
            <div className="p-8 rounded-3xl bg-white border border-stone-200 text-center text-xs font-bold text-stone-500">
              まだ記録がありません。
            </div>
          ) : (
            <div className="space-y-2.5">
              {logs.map((log) => {
                const dateStr = new Date(log.date).toLocaleDateString("ja-JP", {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit"
                });

                return (
                  <div key={log.id} className="glass-panel p-3.5 rounded-2xl border border-stone-200 shadow-2xs">
                    <div className="flex justify-between items-center text-[10px] text-stone-400 font-mono mb-1">
                      <span>{dateStr}</span>
                      <span className="px-2 py-0.2 rounded-full bg-stone-100 text-stone-600 font-bold uppercase text-[9px]">
                        {log.type}
                      </span>
                    </div>
                    <h4 className="font-bold text-xs text-stone-800 mb-0.5">
                      {log.title}
                    </h4>
                    {log.description && (
                      <p className="text-[11px] text-stone-500 leading-relaxed">
                        {log.description}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* Add Reward Modal */}
      <Dialog open={isAddRewardOpen} onOpenChange={setIsAddRewardOpen}>
        <DialogContent className="max-w-xs mx-auto rounded-3xl p-6 bg-white/95 backdrop-blur-xl border border-stone-100 shadow-2xl">
          <DialogHeader className="text-center">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 mx-auto flex items-center justify-center mb-2 shadow-sm">
              <Coins className="w-6 h-6" />
            </div>
            <DialogTitle className="text-lg font-black text-stone-800">
              新しいご褒美を追加
            </DialogTitle>
            <DialogDescription className="text-xs font-medium text-stone-500">
              頑張った自分にプレゼントしたいリワードを設定しましょう。
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">ご褒美の名前</label>
              <Input 
                value={newRewardName}
                onChange={(e) => setNewRewardName(e.target.value)}
                placeholder="例: 高級アイスを食べる 🍨"
                className="text-xs rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">必要ゴールド (G)</label>
              <Input 
                type="number"
                value={newRewardCost}
                onChange={(e) => setNewRewardCost(Number(e.target.value))}
                min={10}
                max={1000}
                className="text-xs rounded-xl"
              />
            </div>
          </div>

          <Button
            onClick={handleAddReward}
            disabled={!newRewardName.trim()}
            className="w-full bg-amber-600 hover:bg-amber-700 text-white rounded-2xl py-5 font-bold text-xs shadow-md mt-2"
          >
            ご褒美を登録する
          </Button>
        </DialogContent>
      </Dialog>
    </main>
  );
}
