"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { 
  Compass, 
  Map as MapIcon, 
  Target, 
  BookOpen, 
  Flame, 
  Zap, 
  Sparkles, 
  TrendingUp, 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle2, 
  HelpCircle, 
  GitBranch, 
  FolderKanban, 
  Layers, 
  ShieldCheck, 
  ChevronDown,
  ChevronUp,
  FolderPlus
} from "lucide-react";

export default function GuidePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"flow" | "features" | "scenarios" | "faq">("flow");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (idx: number) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  return (
    <div className="min-h-screen bg-stone-50/50 pb-28">
      {/* Hero Header */}
      <header className="bg-gradient-to-b from-emerald-950 via-stone-900 to-stone-900 text-white pt-10 pb-12 px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px]" />
        
        <div className="max-w-4xl mx-auto relative z-10">
          <Link href="/" className="inline-flex items-center text-stone-400 hover:text-white text-xs font-bold mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-1" /> アプリホームに戻る
          </Link>
          
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              公式マニュアル & 冒険の手引き
            </span>
          </div>

          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white mb-2 leading-tight">
            Crestward Outpost<br />
            <span className="text-emerald-400 text-xl md:text-2xl font-bold">完全攻略ガイド</span>
          </h1>

          <p className="text-xs md:text-sm font-medium text-stone-300 leading-relaxed max-w-2xl">
            遠大な目標を「複数の達成手段 ➔ 工程 ➔ 今日できる10分のアクション」に多階層で逆算し、RPGのように冒険者レベルを上げながら達成していく人生設計アプリです。
          </p>

          {/* Quick Jump Buttons */}
          <div className="flex gap-2 mt-5 flex-wrap">
            <Button
              onClick={() => setActiveTab("flow")}
              size="sm"
              className={`rounded-xl text-xs font-bold transition-all ${
                activeTab === "flow" 
                  ? "bg-emerald-500 text-stone-950 shadow-md shadow-emerald-500/20" 
                  : "bg-stone-800 text-stone-300 hover:bg-stone-700"
              }`}
            >
              🚀 多階層ツリー構造
            </Button>
            <Button
              onClick={() => setActiveTab("scenarios")}
              size="sm"
              className={`rounded-xl text-xs font-bold transition-all ${
                activeTab === "scenarios" 
                  ? "bg-emerald-500 text-stone-950 shadow-md shadow-emerald-500/20" 
                  : "bg-stone-800 text-stone-300 hover:bg-stone-700"
              }`}
            >
              💼 活用事例（副業・アプリ等）
            </Button>
            <Button
              onClick={() => setActiveTab("features")}
              size="sm"
              className={`rounded-xl text-xs font-bold transition-all ${
                activeTab === "features" 
                  ? "bg-emerald-500 text-stone-950 shadow-md shadow-emerald-500/20" 
                  : "bg-stone-800 text-stone-300 hover:bg-stone-700"
              }`}
            >
              📱 各画面の機能
            </Button>
            <Button
              onClick={() => setActiveTab("faq")}
              size="sm"
              className={`rounded-xl text-xs font-bold transition-all ${
                activeTab === "faq" 
                  ? "bg-emerald-500 text-stone-950 shadow-md shadow-emerald-500/20" 
                  : "bg-stone-800 text-stone-300 hover:bg-stone-700"
              }`}
            >
              ❓ よくある質問 (FAQ)
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-4xl mx-auto p-4 md:p-8 -mt-4 relative z-20 space-y-6">

        {/* TAB 1: FLOW (5-TIER TREE SYSTEM) */}
        {activeTab === "flow" && (
          <div className="space-y-4">
            <div className="p-4 rounded-3xl bg-white border border-stone-200 shadow-sm">
              <h2 className="font-black text-sm text-stone-800 mb-1 flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-emerald-600" />
                目標・クエストの多階層ツリー構造
              </h2>
              <p className="text-xs text-stone-500 leading-relaxed mb-3">
                「目標はあるけれど何から手をつければいいか分からない」を解消するため、以下の5段階で行動を自動分解＆連動管理します。
              </p>
              
              <div className="bg-stone-50 p-3 rounded-2xl border border-stone-200/80 space-y-2 text-xs font-bold text-stone-700 font-mono">
                <div className="flex items-center gap-2 text-purple-700 bg-purple-50 p-2.5 rounded-xl border border-purple-200/60">
                  <span className="text-lg">🌟</span>
                  <div>
                    <span className="text-[10px] text-purple-500 block font-black">Level 1: 究極の理想・価値観</span>
                    『お金と時間に不自由しない自由な生活』
                  </div>
                </div>
                <div className="text-center text-stone-400 text-xs">▼ 逆算</div>
                <div className="flex items-center gap-2 text-emerald-800 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200/60">
                  <span className="text-lg">👑</span>
                  <div>
                    <span className="text-[10px] text-emerald-600 block font-black">Level 2: 戦略的大目標（メインストーリー）</span>
                    『副業で年収100万円アップ』
                  </div>
                </div>
                <div className="text-center text-stone-400 text-xs">▼ 複数の手段に展開</div>
                <div className="flex items-center gap-2 text-indigo-800 bg-indigo-50 p-2.5 rounded-xl border border-indigo-200/60">
                  <span className="text-lg">📱</span>
                  <div>
                    <span className="text-[10px] text-indigo-600 block font-black">Level 3: 達成手段（プロジェクト / トラック）</span>
                    『①アプリ販売』『②社外講演』『③物品販売』
                  </div>
                </div>
                <div className="text-center text-stone-400 text-xs">▼ 工程に分解</div>
                <div className="flex items-center gap-2 text-teal-900 bg-teal-50 p-2.5 rounded-xl border border-teal-200/60">
                  <span className="text-lg">🚩</span>
                  <div>
                    <span className="text-[10px] text-teal-700 block font-black">Level 4: 工程（マイルストーン）</span>
                    『学習・インプット』➔『v1.0開発』➔『改善』
                  </div>
                </div>
                <div className="text-center text-stone-400 text-xs">▼ 今日の1アクション</div>
                <div className="flex items-center gap-2 text-amber-900 bg-amber-50 p-2.5 rounded-xl border border-amber-200/60">
                  <span className="text-lg">⚔️</span>
                  <div>
                    <span className="text-[10px] text-amber-700 block font-black">Level 5: 実行クエスト & 数値目標</span>
                    『専門書25P読了 (25/213P)』『ツール選定』
                  </div>
                </div>
              </div>
            </div>

            {/* Step-by-Step Cards */}
            <div className="space-y-3">
              <h3 className="text-[11px] font-black text-stone-400 uppercase tracking-widest px-1">
                具体的な使い方の流れ（6ステップ）
              </h3>

              {/* Step 1 */}
              <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-sm relative">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-800 font-black text-xs flex items-center justify-center shrink-0">
                    1
                  </div>
                  <div className="flex-1">
                    <h4 className="font-black text-xs text-stone-800">
                      大目標（メインストーリー）を設定する
                    </h4>
                    <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                      「ストーリー」または「クエスト作成工房」から、達成したい目標を入力します。
                    </p>
                    <div className="mt-2 text-[11px] font-bold text-stone-600 bg-stone-50 p-2 rounded-xl border border-stone-200/60">
                      例: 「お金に不自由しない生活（副業で年収100万）」
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-sm relative">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-800 font-black text-xs flex items-center justify-center shrink-0">
                    2
                  </div>
                  <div className="flex-1">
                    <h4 className="font-black text-xs text-stone-800">
                      AIまたはワンタップで多階層ツリーを自動生成
                    </h4>
                    <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                      「クエスト作成工房」で <strong>「AIにおまかせで多階層ツリーを分解する」</strong> を選ぶと、複数の手段・工程・クエストが一括生成されます。<strong>「黄金の多階層ツリーを今すぐ自動生成」</strong> ならワンタップで即時反映されます。
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-sm relative">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-800 font-black text-xs flex items-center justify-center shrink-0">
                    3
                  </div>
                  <div className="flex-1">
                    <h4 className="font-black text-xs text-stone-800">
                      手動で手段（プロジェクト）や工程を自由に拡張
                    </h4>
                    <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                      「ストーリー」画面の <strong>「＋手段を追加」「＋工程追加」「＋クエスト」</strong> から、自分専用のロードマップを自由自在にカスタマイズできます。
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 4 */}
              <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-sm relative">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-800 font-black text-xs flex items-center justify-center shrink-0">
                    4
                  </div>
                  <div className="flex-1">
                    <h4 className="font-black text-xs text-stone-800">
                      日々の数値進捗を記録（＋進捗を記録）
                    </h4>
                    <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                      読書や売上などの数値クエストで <strong>「＋進捗を記録する」</strong> から「今日読んだ <code>+25</code> ページ」を入力。クエストの到達度が上がると、プロジェクト ➔ 大目標全体の進捗率が連動して上昇します！
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 5 */}
              <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-sm relative">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-800 font-black text-xs flex items-center justify-center shrink-0">
                    5
                  </div>
                  <div className="flex-1">
                    <h4 className="font-black text-xs text-stone-800">
                      「なぜやるのか（WHY）」をいつでも確認
                    </h4>
                    <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                      クエストカードの <strong>「？」ボタン</strong> を押すと、この作業が「どのプロジェクトの、どの大目標の、どんな理想のためにあるのか」の5段階の系譜が表示され、モチベーションが蘇ります。
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 6 */}
              <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-sm relative">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-800 font-black text-xs flex items-center justify-center shrink-0">
                    6
                  </div>
                  <div className="flex-1">
                    <h4 className="font-black text-xs text-stone-800">
                      クエスト達成 & レベルアップ！
                    </h4>
                    <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                      クエストを達成すると <strong>「達成！」</strong> ボタンを押して経験値（XP）とGoldを獲得。冒険者レベルやスキルが成長します！
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SCENARIOS */}
        {activeTab === "scenarios" && (
          <div className="space-y-4">
            <div className="p-4 rounded-3xl bg-white border border-stone-200 shadow-sm">
              <h2 className="font-black text-sm text-stone-800 mb-1 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                実際の使い方の具体例
              </h2>
              <p className="text-xs text-stone-500 leading-relaxed">
                大目標の下に複数の達成トラックを走らせる多階層モデルの活用例です。
              </p>
            </div>

            {/* Case: Side Income Multi-Track */}
            <div className="p-5 rounded-3xl bg-gradient-to-br from-indigo-50/80 to-white border border-indigo-200/80 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-base">💼</span>
                <span className="text-[10px] font-black uppercase tracking-wider text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full">
                  活用例: 多階層副業トラック
                </span>
              </div>
              <h3 className="font-black text-sm text-indigo-950 mb-1">
                「お金に不自由しない生活（副業で年収100万円アップ）」
              </h3>
              <p className="text-xs text-stone-600 mb-3 leading-relaxed">
                1つの方法に依存せず、アプリ販売・講演・物販の3つの手段を並行して進めるケース。
              </p>

              <div className="space-y-2.5 text-xs">
                {/* Track A */}
                <div className="p-3 bg-white rounded-xl border border-indigo-100">
                  <span className="font-black text-indigo-900 block text-xs mb-1">📱 プロジェクト A: 自作アプリ販売</span>
                  <div className="pl-2 border-l-2 border-indigo-200 space-y-1 text-[11px] text-stone-600">
                    <p className="font-bold text-stone-800">🚩 ① 学習・インプット工程</p>
                    <p>・専門書テキスト選定 (初級/MP1/達成済)</p>
                    <p>・専門書（全213ページ）読了 ➔ <code>55/213 ページ (25.8%)</code></p>
                    <p className="font-bold text-stone-800 mt-1">🚩 ② v1.0 プロトタイプ開発</p>
                    <p>・ツール選定とセットアップ (初級/MP1)</p>
                    <p>・v1.0 コア機能の実装 (上級/MP3)</p>
                    <p className="font-bold text-stone-800 mt-1">🚩 ③ 実機テスト & 改善</p>
                    <p>・実機で問題点を5つ洗い出す (中級/MP2)</p>
                  </div>
                </div>

                {/* Track B */}
                <div className="p-3 bg-white rounded-xl border border-indigo-100">
                  <span className="font-black text-indigo-900 block text-xs mb-1">🎤 プロジェクト B: 社外講演・出張</span>
                  <div className="pl-2 border-l-2 border-indigo-200 space-y-1 text-[11px] text-stone-600">
                    <p>・得意分野の講演テーマ案を3つ書き出す (初級/MP1)</p>
                  </div>
                </div>

                {/* Track C */}
                <div className="p-3 bg-white rounded-xl border border-indigo-100">
                  <span className="font-black text-indigo-900 block text-xs mb-1">📦 プロジェクト C: 物品販売</span>
                  <div className="pl-2 border-l-2 border-indigo-200 space-y-1 text-[11px] text-stone-600">
                    <p>・不用品・出品アイテムの写真撮影 (初級/MP1)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: FEATURES */}
        {activeTab === "features" && (
          <div className="space-y-3">
            <h3 className="text-[11px] font-black text-stone-400 uppercase tracking-widest px-1">
              主要画面と機能の解説
            </h3>

            {/* Home */}
            <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-sm">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="p-1.5 rounded-xl bg-emerald-100 text-emerald-800">
                  <Flame className="w-4 h-4" />
                </div>
                <h4 className="font-black text-xs text-stone-800">① ホーム（ダッシュボード）</h4>
              </div>
              <p className="text-xs text-stone-500 leading-relaxed">
                ステータス、進行中の大目標と手段プレビュー、本日のアクティブクエストが一覧表示されます。進捗入力やクエスト達成もこの画面からワンタップで行えます。
              </p>
            </div>

            {/* Story */}
            <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-sm">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="p-1.5 rounded-xl bg-indigo-100 text-indigo-800">
                  <MapIcon className="w-4 h-4" />
                </div>
                <h4 className="font-black text-xs text-stone-800">② ストーリー（多階層ツリー航海図）</h4>
              </div>
              <p className="text-xs text-stone-500 leading-relaxed">
                大目標 ➔ プロジェクト（手段） ➔ マイルストーン（工程） ➔ クエストの完全な階層マップです。「＋手段を追加」「＋工程追加」で自由にロードマップを組み立てられます。
              </p>
            </div>

            {/* Quests */}
            <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-sm">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="p-1.5 rounded-xl bg-amber-100 text-amber-800">
                  <Target className="w-4 h-4" />
                </div>
                <h4 className="font-black text-xs text-stone-800">③ クエスト掲示板</h4>
              </div>
              <p className="text-xs text-stone-500 leading-relaxed">
                プロジェクト別のフィルター絞り込みや、新規クエスト作成（数値目標設定や所属プロジェクトの紐付け）が可能です。
              </p>
            </div>

            {/* Quest Builder */}
            <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-sm">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="p-1.5 rounded-xl bg-purple-100 text-purple-800">
                  <FolderKanban className="w-4 h-4" />
                </div>
                <h4 className="font-black text-xs text-stone-800">④ 多階層クエスト作成工房</h4>
              </div>
              <p className="text-xs text-stone-500 leading-relaxed">
                目標を入力するだけで、AIが多階層ツリー（手段・工程・今日できるタスク）を自動分解するプロンプトを生成します。
              </p>
            </div>
          </div>
        )}

        {/* TAB 4: FAQ */}
        {activeTab === "faq" && (
          <div className="space-y-3">
            <h3 className="text-[11px] font-black text-stone-400 uppercase tracking-widest px-1">
              よくある質問 (FAQ)
            </h3>

            {[
              {
                q: "目標（メインストーリー）を複数持ちたい場合はどうすればいいですか？",
                a: "ストーリー画面またはクエスト作成工房の「＋大目標追加」からいくつでも作成できます。作成後はタブで切り替えて各目標ごとのプロジェクトツリーを管理できます。"
              },
              {
                q: "クエストを完了したら、大目標の進捗バーはどうなりますか？",
                a: "クエストの完了や数値進捗（+25Pなど）が記録されると、所属するマイルストーン、プロジェクト、そして大目標全体の達成度（%）がリアルタイムに連動して再計算されます。"
              },
              {
                q: "数値目標のない通常のチェックリスト型タスクも作れますか？",
                a: "はい、作れます。「数値目標を設定する」をオフにしておけば、ワンタップで達成できる通常のRPGクエストとして運用できます。"
              },
              {
                q: "方針転換（ピボット）したくなったらどうすればいいですか？",
                a: "ストーリー画面右上の「方針転換」ボタンを押して理由をメモしてください。過去の挑戦ログとして美しくアーカイブされ、新たな目標を設定できます。"
              }
            ].map((item, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-white border border-stone-200 shadow-sm transition-all">
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full flex justify-between items-center text-left gap-2 font-black text-xs text-stone-800"
                >
                  <span>Q. {item.q}</span>
                  {openFaq === idx ? (
                    <ChevronUp className="w-4 h-4 text-stone-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-stone-400 shrink-0" />
                  )}
                </button>
                {openFaq === idx && (
                  <p className="text-xs text-stone-600 mt-2.5 pt-2.5 border-t border-stone-100 leading-relaxed">
                    {item.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
