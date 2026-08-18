"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
  Hammer, 
  Layers, 
  ShieldCheck, 
  Award,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Laptop,
  Smartphone,
  Check
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
        
        <div className="max-w-md mx-auto relative z-10">
          <Link href="/" className="inline-flex items-center text-stone-400 hover:text-white text-xs font-bold mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-1" /> アプリホームに戻る
          </Link>
          
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              公式マニュアル & 冒険の手引き
            </span>
          </div>

          <h1 className="text-2xl font-black tracking-tight text-white mb-2 leading-tight">
            Crestward Outpost<br />
            <span className="text-emerald-400 text-xl font-bold">完全攻略ガイド</span>
          </h1>

          <p className="text-xs font-medium text-stone-300 leading-relaxed">
            遠大な目標を「今日できる10分のアクション」に逆算し、RPGのように冒険者レベルを上げながら達成していく人生設計アプリです。
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
              🚀 基本の6ステップ
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
              💼 活用事例（副業・読書等）
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
      <main className="max-w-md mx-auto p-4 -mt-4 relative z-20 space-y-6">

        {/* TAB 1: FLOW (6 STEPS) */}
        {activeTab === "flow" && (
          <div className="space-y-4">
            <div className="p-4 rounded-3xl bg-white border border-stone-200 shadow-sm">
              <h2 className="font-black text-sm text-stone-800 mb-1 flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-emerald-600" />
                Crestwardの逆算システム（全体像）
              </h2>
              <p className="text-xs text-stone-500 leading-relaxed mb-3">
                「目標はあるけれど、何から手をつければいいか分からない」を解消するため、以下のピラミッド構造で行動を自動分解します。
              </p>
              
              <div className="bg-stone-50 p-3 rounded-2xl border border-stone-200/80 space-y-2 text-xs font-bold text-stone-700 font-mono">
                <div className="flex items-center gap-2 text-purple-700 bg-purple-50 p-2 rounded-xl border border-purple-200/60">
                  <span className="text-base">🧭</span>
                  <div>
                    <span className="text-[10px] text-purple-500 block font-black">ROOT</span>
                    価値観（自分が本当に大切にしたい軸）
                  </div>
                </div>
                <div className="text-center text-stone-400 text-xs">▼ 逆算</div>
                <div className="flex items-center gap-2 text-emerald-800 bg-emerald-50 p-2 rounded-xl border border-emerald-200/60">
                  <span className="text-base">👑</span>
                  <div>
                    <span className="text-[10px] text-emerald-600 block font-black">MACRO</span>
                    目標（メインクエスト / ストーリー）
                  </div>
                </div>
                <div className="text-center text-stone-400 text-xs">▼ 3段階に分解</div>
                <div className="flex items-center gap-2 text-indigo-800 bg-indigo-50 p-2 rounded-xl border border-indigo-200/60">
                  <span className="text-base">🚩</span>
                  <div>
                    <span className="text-[10px] text-indigo-600 block font-black">PHASE</span>
                    第1章〜第3章 & マイルストーン
                  </div>
                </div>
                <div className="text-center text-stone-400 text-xs">▼ 今日できる1歩へ</div>
                <div className="flex items-center gap-2 text-amber-900 bg-amber-50 p-2 rounded-xl border border-amber-200/60">
                  <span className="text-base">⚔️</span>
                  <div>
                    <span className="text-[10px] text-amber-700 block font-black">MICRO</span>
                    今日のアクション（サブクエスト: 5〜15分）
                  </div>
                </div>
              </div>
            </div>

            {/* Step-by-Step Cards */}
            <div className="space-y-3">
              <h3 className="text-[11px] font-black text-stone-400 uppercase tracking-widest px-1">
                具体的な使い方の流れ（6つのステップ）
              </h3>

              {/* Step 1 */}
              <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-sm relative">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-800 font-black text-xs flex items-center justify-center shrink-0">
                    1
                  </div>
                  <div className="flex-1">
                    <h4 className="font-black text-xs text-stone-800">
                      目標（メインクエスト）を設定する
                    </h4>
                    <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                      「クエスト作成工房」または「ストーリー画面」の <strong>「＋目標を新規作成」</strong> から、達成したい目標を入力します。
                    </p>
                    <div className="mt-2 text-[11px] font-bold text-stone-600 bg-stone-50 p-2 rounded-xl border border-stone-200/60">
                      例: 「副業アプリで年収100万円アップ」「専門書（213P）を読破」「月間300kmランニング」
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
                      AIまたはワンタップでクエストを自動分解
                    </h4>
                    <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                      <strong>「AIにおまかせでサブクエストを分解する」</strong> を押すと、ChatGPTやGemini用のプロンプトが生成されます。または <strong>「黄金の初期クエストを自動生成」</strong> を押せばAIを使わず即座にロードマップが完成します。
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
                      毎朝のチェックイン（MPをチャージ）
                    </h4>
                    <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                      ホーム画面上部の「冒険者ステータスカード」から朝のチェックインを行い、今日の体調・エネルギー（MP）を回復します。
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
                      日々の進捗を記録する（＋進捗を記録）
                    </h4>
                    <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                      読書や売上、走行距離などの数値目標があるクエストでは、<strong>「＋進捗を記録する」</strong> から「今日読んだ <code>+25</code> ページ」や「今日の副業収益 <code>+10,000</code> 円」を入力します。到達度（%）がリアルタイムに伸びていきます。
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
                      クエスト達成 & レベルアップ！
                    </h4>
                    <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                      クエストを達成すると <strong>「達成！」</strong> ボタンを押して経験値（XP）とGoldを獲得。冒険者レベルやスキルレベルがアップします！
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
                      ストーリー航海図で全体の進み具合を確認
                    </h4>
                    <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                      「ストーリー」タブを開くと、自分が大目標のどこまで進んだのか（チャプター達成度%）がマップ形式で一目で分かります。
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SCENARIOS (USE CASES) */}
        {activeTab === "scenarios" && (
          <div className="space-y-4">
            <div className="p-4 rounded-3xl bg-white border border-stone-200 shadow-sm">
              <h2 className="font-black text-sm text-stone-800 mb-1 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                実際の使い方の具体例
              </h2>
              <p className="text-xs text-stone-500 leading-relaxed">
                あなたの生活スタイルに合わせて、以下のような目標管理が可能です。
              </p>
            </div>

            {/* Case 1: App Development & Side Income */}
            <div className="p-5 rounded-3xl bg-gradient-to-br from-indigo-50/80 to-white border border-indigo-200/80 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-base">💼</span>
                <span className="text-[10px] font-black uppercase tracking-wider text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full">
                  活用例 1: 副業・プロダクト開発
                </span>
              </div>
              <h3 className="font-black text-sm text-indigo-950 mb-1">
                「副業アプリを開発・リリースして年収100万円アップ」
              </h3>
              <p className="text-xs text-stone-600 mb-3 leading-relaxed">
                自作アプリのリリースによる収益と、自由なライフスタイルの確立を目指すケース。
              </p>

              <div className="space-y-2 text-xs">
                <div className="p-2.5 bg-white rounded-xl border border-indigo-100">
                  <span className="font-bold text-indigo-900 block text-[11px]">🚩 第1章: 準備・プロトタイプ作成</span>
                  <p className="text-[11px] text-stone-500">・クエスト: 競合アプリを3つ調べて差別化ポイントをメモ (MP1 / +50XP)</p>
                  <p className="text-[11px] text-stone-500">・クエスト: コア機能の画面設計書を書く (MP2 / +100XP)</p>
                </div>
                <div className="p-2.5 bg-white rounded-xl border border-indigo-100">
                  <span className="font-bold text-indigo-900 block text-[11px]">💰 数値進捗管理: 収益ログ</span>
                  <p className="text-[11px] text-stone-500">・目標: <code>1,000,000 円</code></p>
                  <p className="text-[11px] text-stone-500">・日々の入力: 「アプリ内課金売上 <code>+12,000円</code>」→ 達成率 12.0%</p>
                </div>
              </div>
            </div>

            {/* Case 2: Reading & Skill Learning */}
            <div className="p-5 rounded-3xl bg-gradient-to-br from-emerald-50/80 to-white border border-emerald-200/80 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-base">📚</span>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                  活用例 2: 読書・スキル習得
                </span>
              </div>
              <h3 className="font-black text-sm text-emerald-950 mb-1">
                「開発・設計の専門書（全213ページ）を読破する」
              </h3>
              <p className="text-xs text-stone-600 mb-3 leading-relaxed">
                挫折しがちな分厚い専門書を、毎日のページ数カウントで着実に読み切るケース。
              </p>

              <div className="space-y-2 text-xs">
                <div className="p-2.5 bg-white rounded-xl border border-emerald-100">
                  <span className="font-bold text-emerald-900 block text-[11px]">📖 数値進捗管理: 読了ページ数</span>
                  <p className="text-[11px] text-stone-500">・目標: <code>213 ページ</code></p>
                  <p className="text-[11px] text-stone-500">・1日目: 「第1章読了 <code>+25ページ</code>」（到達度: 11.7%）</p>
                  <p className="text-[11px] text-stone-500">・2日目: 「第2章読了 <code>+30ページ</code>」（累計: 55/213P 25.8%）</p>
                  <p className="text-[11px] text-emerald-700 font-bold">・213ページ到達時: 自動で完了モーダルが開き報酬獲得！</p>
                </div>
              </div>
            </div>

            {/* Case 3: Health & Fitness */}
            <div className="p-5 rounded-3xl bg-gradient-to-br from-amber-50/80 to-white border border-amber-200/80 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-base">🏃</span>
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                  活用例 3: 体力維持・健康
                </span>
              </div>
              <h3 className="font-black text-sm text-amber-950 mb-1">
                「月間走行距離300kmのランニング習慣」
              </h3>
              <p className="text-xs text-stone-600 mb-3 leading-relaxed">
                実年齢マイナス20歳の体力とエネルギーをキープするための有酸素運動管理。
              </p>

              <div className="space-y-2 text-xs">
                <div className="p-2.5 bg-white rounded-xl border border-amber-100">
                  <span className="font-bold text-amber-900 block text-[11px]">👟 数値進捗管理: 走行距離 (km)</span>
                  <p className="text-[11px] text-stone-500">・目標: <code>300 km</code></p>
                  <p className="text-[11px] text-stone-500">・今日走った距離: <code>+5.5 km</code> を記録</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: FEATURES (SCREEN BY SCREEN) */}
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
                冒険者のステータス（レベル・HP・MP）、進行中のメインストーリー、本日のアクティブクエストが一覧表示されます。進捗入力やクエスト達成もこの画面からワンタップで行えます。
              </p>
            </div>

            {/* Story */}
            <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-sm">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="p-1.5 rounded-xl bg-indigo-100 text-indigo-800">
                  <MapIcon className="w-4 h-4" />
                </div>
                <h4 className="font-black text-xs text-stone-800">② ストーリー（航海図）</h4>
              </div>
              <p className="text-xs text-stone-500 leading-relaxed">
                大目標と、それを構成する第1章〜第3章、各マイルストーン、紐づくクエストのツリーがマップ形式で表示されます。方針転換（ピボット）や目標の新規追加もここから可能です。
              </p>
            </div>

            {/* Quests */}
            <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-sm">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="p-1.5 rounded-xl bg-amber-100 text-amber-800">
                  <Target className="w-4 h-4" />
                </div>
                <h4 className="font-black text-xs text-stone-800">③ クエスト（掲示板）</h4>
              </div>
              <p className="text-xs text-stone-500 leading-relaxed">
                すべてのクエストの確認、難易度・進行状況別のフィルタリング、新しい単発クエストのクイック追加、不要なクエストの削除（ゴミ箱）が行えます。
              </p>
            </div>

            {/* Compass / Discovery */}
            <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-sm">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="p-1.5 rounded-xl bg-purple-100 text-purple-800">
                  <Compass className="w-4 h-4" />
                </div>
                <h4 className="font-black text-xs text-stone-800">④ コンパス（自己探索・価値観）</h4>
              </div>
              <p className="text-xs text-stone-500 leading-relaxed">
                日々のモヤモヤ（フラストレーション）や理想の情景（アスピレーション）を記録し、AIがあなたの本当の価値観を抽出・言語化します。
              </p>
            </div>

            {/* Journal */}
            <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-sm">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="p-1.5 rounded-xl bg-teal-100 text-teal-800">
                  <BookOpen className="w-4 h-4" />
                </div>
                <h4 className="font-black text-xs text-stone-800">⑤ 冒険録（ジャーナル）</h4>
              </div>
              <p className="text-xs text-stone-500 leading-relaxed">
                これまで達成したクエスト、レベルアップ、日々の進捗記録などのタイムラインが刻まれ、自分の積み上げをいつでも振り返ることができます。
              </p>
            </div>
          </div>
        )}

        {/* TAB 4: FAQ */}
        {activeTab === "faq" && (
          <div className="space-y-2">
            <h3 className="text-[11px] font-black text-stone-400 uppercase tracking-widest px-1 mb-2">
              よくある質問 (FAQ)
            </h3>

            {[
              {
                q: "MP（エネルギー）とXP（経験値）の違いは何ですか？",
                a: "MPは「その日の行動力」です。毎朝のチェックインで回復し、クエストに取り組む際に消費します。XPは「これまでの努力の積み上げ」です。クエストを完了すると獲得でき、一定値たまるとレベルアップします。"
              },
              {
                q: "目標（メインストーリー）を変更したくなったら？",
                a: "ストーリー画面の「方針転換（ピボット）」ボタンを押すか、「クエスト作成工房」の「＋目標を新規作成」からいつでも新しい目標を立ち上げることができます。過去の挑戦ログは冒険録に残るため無駄にはなりません。"
              },
              {
                q: "AIを使わずに自分で全部目標やクエストを作れますか？",
                a: "はい、完全に手動で作成可能です。「クエスト作成工房」の「目標を新規作成」や「黄金の初期クエストを自動生成」、クエスト掲示板の「＋クエスト追加」から手動で自由に作成できます。"
              },
              {
                q: "数値目標の単位は変更できますか？",
                a: "はい、「ページ」「円」「km」「回」「分」など、ご自身の目標に合わせて自由な単位を設定できます。"
              },
              {
                q: "データはどこに保存されますか？",
                a: "お使いの端末（ブラウザのローカルストレージ）に安全に保存されます。外部サーバーに個人情報が勝手に送信されることはありません。"
              }
            ].map((faq, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-white border border-stone-200 shadow-sm transition-all">
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full flex justify-between items-center text-left gap-2"
                >
                  <span className="font-black text-xs text-stone-800 flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    {faq.q}
                  </span>
                  {openFaq === idx ? (
                    <ChevronUp className="w-4 h-4 text-stone-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-stone-400 shrink-0" />
                  )}
                </button>
                {openFaq === idx && (
                  <p className="mt-2.5 pt-2.5 border-t border-stone-100 text-xs text-stone-600 leading-relaxed">
                    {faq.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* CTA Bottom Card */}
        <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg text-center">
          <Sparkles className="w-8 h-8 mx-auto mb-2 text-emerald-200" />
          <h3 className="font-black text-base mb-1">準備は整いましたか？</h3>
          <p className="text-xs text-emerald-100 mb-4 leading-relaxed">
            まずは「クエスト作成工房」で最初の目標を立てて、今日できる1歩を踏み出しましょう！
          </p>
          <div className="flex flex-col gap-2">
            <Button
              onClick={() => router.push("/quest-builder")}
              className="bg-white text-emerald-800 hover:bg-emerald-50 rounded-2xl py-5 font-bold text-xs shadow-md"
            >
              クエスト作成工房を開く <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
            <Button
              onClick={() => router.push("/")}
              variant="ghost"
              className="text-emerald-100 hover:text-white text-xs font-bold"
            >
              ホーム画面へ戻る
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
