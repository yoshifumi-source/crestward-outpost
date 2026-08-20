"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { storage } from "@/services/storage";
import { UserSettings, Value, Skill, Tension, FutureScene } from "@/types";
import { 
  Compass, 
  Heart, 
  Sparkles, 
  Target, 
  Star, 
  ArrowRight, 
  User, 
  Award, 
  Coins, 
  Shield, 
  RefreshCw,
  Download,
  Upload,
  Copy,
  Check,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default function CompassPage() {
  const router = useRouter();
  const [isLoaded, setIsLoaded] = useState(false);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [values, setValues] = useState<Value[]>([]);
  const [tensions, setTensions] = useState<Tension[]>([]);
  const [futureScenes, setFutureScenes] = useState<FutureScene[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);

  // Backup & Restore Dialogs
  const [isBackupOpen, setIsBackupOpen] = useState(false);
  const [isRestoreOpen, setIsRestoreOpen] = useState(false);
  const [backupJson, setBackupJson] = useState("");
  const [restoreJson, setRestoreJson] = useState("");
  const [copied, setCopied] = useState(false);
  const [restoreStatus, setRestoreStatus] = useState<string | null>(null);

  const loadData = () => {
    setSettings(storage.getSettings());
    setValues(storage.getValues());
    setTensions(storage.getTensions());
    setFutureScenes(storage.getFutureScenes());
    setSkills(storage.getSkills());
    setIsLoaded(true);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenBackup = () => {
    const exported = storage.exportAllData();
    setBackupJson(exported);
    setIsBackupOpen(true);
  };

  const handleCopyBackup = () => {
    navigator.clipboard.writeText(backupJson);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExecuteRestore = () => {
    if (!restoreJson.trim()) return;
    const result = storage.importAllData(restoreJson.trim());
    if (result.success) {
      alert("✅ データを正常に復元しました！");
      setIsRestoreOpen(false);
      setRestoreJson("");
      loadData();
    } else {
      setRestoreStatus(result.message);
    }
  };

  const handleResetSample = () => {
    if (confirm("⚠️ 注意: サンプル冒険者データを再読み込みしますか？\n（現在のカスタム目標や記録は初期サンプルに置き換わります）")) {
      storage.loadSamplePreset();
      loadData();
      alert("サンプル冒険者データを読み込みました！");
    }
  };

  if (!isLoaded || !settings) {
    return <div className="p-6 text-stone-500 font-bold">コンパスを調整中...</div>;
  }

  return (
    <main className="w-full max-w-6xl mx-auto p-4 md:p-8 pb-28 md:pb-12">
      {/* Header */}
      <header className="mb-6 pt-1">
        <div className="flex items-center justify-between mb-4 px-1">
          <div className="flex items-center gap-2">
            <Compass className="w-6 h-6 text-emerald-600 animate-spin-slow" />
            <h1 className="text-xl md:text-2xl font-black text-stone-800 tracking-tight">
              自己の羅針盤（コンパス）
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenBackup}
              className="flex items-center gap-1.5 text-xs font-bold text-stone-700 hover:text-stone-900 bg-white border border-stone-200/80 px-3.5 py-1.5 rounded-full shadow-2xs transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" /> バックアップ
            </button>
            <button
              onClick={() => setIsRestoreOpen(true)}
              className="flex items-center gap-1.5 text-xs font-bold text-stone-700 hover:text-stone-900 bg-white border border-stone-200/80 px-3.5 py-1.5 rounded-full shadow-2xs transition-colors"
            >
              <Upload className="w-3.5 h-3.5 text-indigo-600" /> 復元
            </button>
          </div>
        </div>
      </header>

      {/* Responsive 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Identity, Guided Discovery, Controls */}
        <div className="space-y-6">
          {/* Adventurer Identity Card */}
          <div className="glass-panel p-5 md:p-6 rounded-3xl border border-stone-200 shadow-sm relative overflow-hidden">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 p-0.5 shadow-md flex items-center justify-center">
                <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
                  <User className="w-8 h-8 text-emerald-600" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-mono">
                    Lv.{settings.level}
                  </span>
                  <span className="text-xs font-bold text-stone-500">{settings.title}</span>
                </div>
                <h2 className="text-xl font-black text-stone-800 tracking-tight">{settings.name}</h2>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-3 rounded-2xl bg-stone-50 border border-stone-100">
                <span className="text-[10px] font-bold text-stone-400 block uppercase">所持ゴールド</span>
                <span className="text-base font-black text-amber-600 font-mono flex items-center justify-center gap-1 mt-0.5">
                  <Coins className="w-4 h-4 text-amber-500" /> {settings.gold} G
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-stone-50 border border-stone-100">
                <span className="text-[10px] font-bold text-stone-400 block uppercase">習得スキル数</span>
                <span className="text-base font-black text-indigo-600 font-mono flex items-center justify-center gap-1 mt-0.5">
                  <Shield className="w-4 h-4 text-indigo-500" /> {skills.length} スキル
                </span>
              </div>
            </div>
          </div>

          {/* Guided Discovery Entry Banner */}
          <section>
            <div 
              onClick={() => router.push("/onboarding")}
              className="cursor-pointer p-5 rounded-3xl bg-gradient-to-r from-stone-900 to-stone-800 text-white shadow-lg hover:shadow-xl transition-all border border-stone-700 relative overflow-hidden group"
            >
              <div className="absolute right-0 top-0 w-40 h-40 bg-emerald-500/10 rounded-full blur-xl group-hover:scale-110 transition-transform" />
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center">
                    <Compass className="w-6 h-6 text-emerald-400 group-hover:rotate-45 transition-transform duration-500" />
                  </div>
                  <div>
                    <h3 className="text-sm md:text-base font-black text-stone-100">自己探索ガイド（AI分析）</h3>
                    <p className="text-xs text-stone-400">AIと一緒に新しい価値観と物語を深掘りする</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-stone-400 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          </section>

          {/* Danger Zone: Sample Reset */}
          <section className="p-4 rounded-2xl border border-dashed border-stone-300 text-center">
            <button
              onClick={handleResetSample}
              className="text-xs font-bold text-stone-400 hover:text-stone-700 flex items-center justify-center gap-1.5 mx-auto py-1 px-3 rounded-full hover:bg-stone-100 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" /> 初期サンプルデータに戻す
            </button>
          </section>
        </div>

        {/* Right Column: Values, Tensions, Future Scenes */}
        <div className="space-y-6">
          {/* Core Values */}
          <section>
            <div className="flex items-center justify-between mb-3 px-1">
              <h3 className="text-xs font-black text-stone-500 uppercase tracking-widest flex items-center gap-1.5">
                <Heart className="w-4 h-4 text-rose-500" />
                大切にしたい価値観
              </h3>
            </div>

            {values.length === 0 ? (
              <div className="p-5 rounded-2xl bg-stone-100/60 text-center text-xs font-bold text-stone-500">
                まだ価値観が登録されていません。自己探索ガイドで抽出しましょう。
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2.5">
                {values.map((v) => (
                  <div key={v.id} className="glass-panel p-3.5 rounded-2xl border border-stone-200 shadow-2xs flex items-center justify-between">
                    <span className="text-xs font-black text-stone-800">{v.name}</span>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star 
                          key={i}
                          className={`w-3.5 h-3.5 ${i < v.level ? 'text-amber-400 fill-amber-400' : 'text-stone-200'}`}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Tensions (Gaps: Current vs Desired State) */}
          {tensions.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-3 px-1">
                <h3 className="text-xs font-black text-stone-500 uppercase tracking-widest flex items-center gap-1.5">
                  <Target className="w-4 h-4 text-indigo-600" />
                  現状と理想のギャップ
                </h3>
              </div>
              <div className="space-y-3">
                {tensions.map((t) => (
                  <div key={t.id} className="glass-panel p-4 rounded-2xl border border-stone-200 shadow-2xs">
                    <h4 className="text-xs font-black text-stone-800 mb-2">{t.title}</h4>
                    <div className="space-y-2 text-xs">
                      <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200/80 text-stone-700">
                        <span className="text-[10px] font-black text-stone-400 block uppercase mb-0.5">現在（現状の課題）</span>
                        {t.currentState}
                      </div>
                      <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-900 font-medium">
                        <span className="text-[10px] font-black text-emerald-600 block uppercase mb-0.5">理想（目指す状態）</span>
                        {t.desiredState}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Future Scenes */}
          {futureScenes.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-3 px-1">
                <h3 className="text-xs font-black text-stone-500 uppercase tracking-widest flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  目指す未来の情景
                </h3>
              </div>
              <div className="space-y-3">
                {futureScenes.map((f) => (
                  <div key={f.id} className="glass-panel p-4 rounded-2xl border border-amber-200/80 bg-gradient-to-br from-white to-amber-50/30 shadow-2xs">
                    <h4 className="text-xs font-black text-stone-800 mb-1">{f.title}</h4>
                    <p className="text-xs font-medium text-stone-600 leading-relaxed">{f.description}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>

      {/* Backup Dialog */}
      <Dialog open={isBackupOpen} onOpenChange={setIsBackupOpen}>
        <DialogContent className="max-w-md mx-auto rounded-3xl p-6 bg-white/95 backdrop-blur-xl border border-stone-100 shadow-2xl">
          <DialogHeader className="text-center">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 mx-auto flex items-center justify-center mb-2 shadow-sm">
              <Download className="w-6 h-6" />
            </div>
            <DialogTitle className="text-lg font-black text-stone-800">
              データのバックアップ
            </DialogTitle>
            <DialogDescription className="text-xs font-medium text-stone-500">
              作成した目標・クエスト・進捗ログなどの全データを保存できます。
            </DialogDescription>
          </DialogHeader>

          <div className="py-2 text-left">
            <label className="block text-xs font-bold text-stone-700 mb-1">バックアップJSON</label>
            <Textarea
              readOnly
              value={backupJson}
              className="text-xs font-mono min-h-[180px] resize-none rounded-2xl bg-stone-50 border-stone-200 p-3 leading-relaxed"
            />
          </div>

          <DialogFooter className="flex flex-col gap-2 mt-2">
            <Button
              onClick={handleCopyBackup}
              className="w-full bg-stone-900 hover:bg-black text-white rounded-2xl py-5 font-bold text-xs shadow-md flex items-center justify-center gap-1.5"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  クリップボードにコピーしました！
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  バックアップJSONをコピー
                </>
              )}
            </Button>
            <Button
              onClick={() => setIsBackupOpen(false)}
              variant="ghost"
              className="w-full text-stone-400 text-xs font-bold"
            >
              閉じる
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Restore Dialog */}
      <Dialog open={isRestoreOpen} onOpenChange={setIsRestoreOpen}>
        <DialogContent className="max-w-md mx-auto rounded-3xl p-6 bg-white/95 backdrop-blur-xl border border-stone-100 shadow-2xl">
          <DialogHeader className="text-center">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-200 mx-auto flex items-center justify-center mb-2 shadow-sm">
              <Upload className="w-6 h-6" />
            </div>
            <DialogTitle className="text-lg font-black text-stone-800">
              データの復元（インポート）
            </DialogTitle>
            <DialogDescription className="text-xs font-medium text-stone-500">
              以前保存したバックアップJSONを貼り付けて復元します。
            </DialogDescription>
          </DialogHeader>

          {restoreStatus && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 font-bold">
              {restoreStatus}
            </div>
          )}

          <div className="py-2 text-left">
            <label className="block text-xs font-bold text-stone-700 mb-1">バックアップJSONを貼り付け</label>
            <Textarea
              value={restoreJson}
              onChange={(e) => setRestoreJson(e.target.value)}
              placeholder="ここにバックアップJSONを貼り付けてください..."
              className="text-xs font-mono min-h-[180px] resize-none rounded-2xl bg-stone-50 border-stone-200 p-3 leading-relaxed"
            />
          </div>

          <DialogFooter className="flex flex-col gap-2 mt-2">
            <Button
              onClick={handleExecuteRestore}
              disabled={!restoreJson.trim()}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl py-5 font-bold text-xs shadow-md"
            >
              このデータで復元する
            </Button>
            <Button
              onClick={() => {
                setIsRestoreOpen(false);
                setRestoreStatus(null);
              }}
              variant="ghost"
              className="w-full text-stone-400 text-xs font-bold"
            >
              キャンセル
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
