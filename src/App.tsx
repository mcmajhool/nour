import React, { useState, useEffect, useMemo } from 'react';
import {
  Volume2,
  VolumeX,
  Bell,
  BellOff,
  Check,
  Plus,
  RotateCcw,
  Compass,
  Download,
  Copy,
  FileCode,
  FolderGit2,
  Smartphone,
  MapPin,
  Trash2,
  Play,
  Square,
  BookOpen,
} from 'lucide-react';
import courtyardHeroImg from './assets/images/islamic_courtyard_dawn_1791647224268.jpg';
import {
  CITIES,
  CityOption,
  INITIAL_DAILY_TASKS,
  DailyTaskItem,
  ADHKAR_LIST,
  TASBIH_PHRASES,
  calculatePrayerTimesForCity,
  calculateQibla,
  playTasbihClick,
  playAdhanPreviewChime,
} from './data/islamicData';
import {
  KOTLIN_PROJECT_FILES,
  downloadKotlinAndroidProjectZip,
} from './data/kotlinProjectFiles';
import { KotlinFileTree } from './components/KotlinFileTree';

type EmulatorTab = 'prayers' | 'tasks' | 'adhkar' | 'tasbih' | 'qibla';
type WorkspaceMode = 'studio' | 'full_app' | 'github_guide';

const TAB_TO_KOTLIN_FILE: Record<EmulatorTab, string> = {
  prayers: 'app/src/main/java/com/nooralmuslim/app/ui/screens/PrayerTimesScreen.kt',
  tasks: 'app/src/main/java/com/nooralmuslim/app/ui/screens/DailyTasksScreen.kt',
  adhkar: 'app/src/main/java/com/nooralmuslim/app/ui/screens/AdhkarScreen.kt',
  tasbih: 'app/src/main/java/com/nooralmuslim/app/ui/screens/TasbihScreen.kt',
  qibla: 'app/src/main/java/com/nooralmuslim/app/util/PrayerTimeCalculator.java',
};

export default function App() {
  const [workspaceMode, setWorkspaceMode] = useState<WorkspaceMode>('studio');
  const [emulatorTab, setEmulatorTab] = useState<EmulatorTab>('prayers');

  // City & Location State
  const [selectedCityId, setSelectedCityId] = useState<string>(() => {
    return localStorage.getItem('noor_city_id') || 'makkah';
  });
  const [customCoords, setCustomCoords] = useState<{
    lat: number;
    lng: number;
    label: string;
  } | null>(null);
  const [geoStatus, setGeoStatus] = useState<string>('');

  // Adhan Notification Toggles per prayer
  const [adhanEnabledMap, setAdhanEnabledMap] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem('noor_adhan_map');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return {
      fajr: true,
      sunrise: false,
      dhuhr: true,
      asr: true,
      maghrib: true,
      isha: true,
    };
  });

  // Adhan Audio Preview State
  const [isPlayingAdhan, setIsPlayingAdhan] = useState(false);
  const [stopAdhanFn, setStopAdhanFn] = useState<(() => void) | null>(null);

  // Live Clock for Next Prayer Countdown
  const [now, setNow] = useState<Date>(() => new Date());

  // Daily Worship Tasks State
  const [tasks, setTasks] = useState<DailyTaskItem[]>(() => {
    const saved = localStorage.getItem('noor_daily_tasks');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return INITIAL_DAILY_TASKS;
  });
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState<DailyTaskItem['category']>('sunnah');

  // Adhkar State
  const [adhkarCategory, setAdhkarCategory] = useState<'morning' | 'evening' | 'prayer' | 'sleep'>('morning');
  const [adhkarCounts, setAdhkarCounts] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('noor_adhkar_counts');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return {};
  });

  // Tasbih State
  const [selectedPhraseId, setSelectedPhraseId] = useState<string>(TASBIH_PHRASES[0].id);
  const [tasbihCount, setTasbihCount] = useState<number>(0);
  const [tasbihTotal, setTasbihTotal] = useState<number>(() => {
    return Number(localStorage.getItem('noor_tasbih_total') || '142');
  });
  const [tasbihTarget, setTasbihTarget] = useState<number>(33);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Kotlin Project Studio State
  const [selectedKotlinPath, setSelectedKotlinPath] = useState<string>(
    'app/src/main/java/com/nooralmuslim/app/MainActivity.kt'
  );
  const [copiedFile, setCopiedFile] = useState<string | null>(null);
  const [githubUsername, setGithubUsername] = useState<string>('username');
  const [githubRepoName, setGithubRepoName] = useState<string>('noor-al-muslim-kotlin');
  const [isDownloadingZip, setIsDownloadingZip] = useState<boolean>(false);
  const [heroImageError, setHeroImageError] = useState<boolean>(false);

  // Sync clock every second
  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  // Persist states
  useEffect(() => {
    localStorage.setItem('noor_city_id', selectedCityId);
  }, [selectedCityId]);

  useEffect(() => {
    localStorage.setItem('noor_adhan_map', JSON.stringify(adhanEnabledMap));
  }, [adhanEnabledMap]);

  useEffect(() => {
    localStorage.setItem('noor_daily_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('noor_adhkar_counts', JSON.stringify(adhkarCounts));
  }, [adhkarCounts]);

  useEffect(() => {
    localStorage.setItem('noor_tasbih_total', String(tasbihTotal));
  }, [tasbihTotal]);

  const activeCity: CityOption = useMemo(() => {
    const found = CITIES.find((c) => c.id === selectedCityId) || CITIES[0];
    if (customCoords) {
      return {
        ...found,
        nameAr: customCoords.label,
        lat: customCoords.lat,
        lng: customCoords.lng,
      };
    }
    return found;
  }, [selectedCityId, customCoords]);

  const prayerTimes = useMemo(() => {
    return calculatePrayerTimesForCity(activeCity, now, adhanEnabledMap);
  }, [activeCity, now, adhanEnabledMap]);

  const nextPrayerInfo = useMemo(() => {
    const currentMinutes =
      now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;
    const upcoming =
      prayerTimes.find((p) => p.minutesFromMidnight > currentMinutes) ||
      prayerTimes[0];

    let diffSeconds = Math.round((upcoming.minutesFromMidnight - currentMinutes) * 60);
    if (diffSeconds < 0) {
      diffSeconds += 24 * 3600;
    }

    const hrs = Math.floor(diffSeconds / 3600);
    const mins = Math.floor((diffSeconds % 3600) / 60);
    const secs = diffSeconds % 60;

    return {
      prayer: upcoming,
      countdownFormatted: `${String(hrs).padStart(2, '0')}:${String(mins).padStart(
        2,
        '0'
      )}:${String(secs).padStart(2, '0')}`,
    };
  }, [prayerTimes, now]);

  const hijriDateFormatted = useMemo(() => {
    try {
      return new Intl.DateTimeFormat('ar-SA-u-ca-islamic', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(now);
    } catch {
      return '١٤٤٨ هـ';
    }
  }, [now]);

  const qiblaData = useMemo(() => {
    return calculateQibla(activeCity.lat, activeCity.lng);
  }, [activeCity]);

  const handleSelectEmulatorTab = (tab: EmulatorTab) => {
    setEmulatorTab(tab);
    setSelectedKotlinPath(TAB_TO_KOTLIN_FILE[tab]);
  };

  const handleLocateGPS = () => {
    if (!navigator.geolocation) {
      setGeoStatus('المتصفح لا يدعم تحديد الموقع الجغرافي');
      return;
    }
    setGeoStatus('جاري تحديد الإحداثيات...');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCustomCoords({
          lat: Number(pos.coords.latitude.toFixed(4)),
          lng: Number(pos.coords.longitude.toFixed(4)),
          label: 'موقعي الحالي (GPS)',
        });
        setGeoStatus('تم تحديث المواقيت والقبلة حسب موقعك الجغرافي الدقيق');
      },
      () => {
        setGeoStatus('تعذر الوصول للموقع، يرجى اختيار المدينة من القائمة');
      }
    );
  };

  const handleToggleAdhanAudio = () => {
    if (isPlayingAdhan && stopAdhanFn) {
      stopAdhanFn();
      setIsPlayingAdhan(false);
      setStopAdhanFn(null);
      return;
    }
    setIsPlayingAdhan(true);
    const stop = playAdhanPreviewChime(() => {
      setIsPlayingAdhan(false);
      setStopAdhanFn(null);
    });
    setStopAdhanFn(() => stop);
  };

  const handleTogglePrayerAlarm = (prayerId: string) => {
    setAdhanEnabledMap((prev) => ({
      ...prev,
      [prayerId]: !prev[prayerId],
    }));
    if (soundEnabled) {
      playTasbihClick(false);
    }
  };

  const handleToggleTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t))
    );
    if (soundEnabled) {
      playTasbihClick(true);
    }
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    const categoryLabels: Record<DailyTaskItem['category'], string> = {
      prayer: 'الصلوات المفروضة',
      quran: 'القرآن الكريم',
      adhkar: 'الأذكار اليومية',
      sunnah: 'السنن والنوافل',
    };
    const newItem: DailyTaskItem = {
      id: `task-${Date.now()}`,
      titleAr: newTaskTitle.trim(),
      subtitleAr: 'ورد يومي مضاف في جدول الطاعات',
      category: newTaskCategory,
      categoryLabelAr: categoryLabels[newTaskCategory],
      completed: false,
      timeSlotAr: 'طوال اليوم',
    };
    setTasks((prev) => [newItem, ...prev]);
    setNewTaskTitle('');
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  const handleIncrementDhikr = (dhikrId: string, target: number) => {
    const current = adhkarCounts[dhikrId] || 0;
    if (current >= target) return;
    const next = current + 1;
    setAdhkarCounts((prev) => ({
      ...prev,
      [dhikrId]: next,
    }));
    if (soundEnabled) {
      playTasbihClick(next === target);
    }
  };

  const handleResetAdhkarCategory = () => {
    const updated = { ...adhkarCounts };
    ADHKAR_LIST.filter((d) => d.category === adhkarCategory).forEach((d) => {
      delete updated[d.id];
    });
    setAdhkarCounts(updated);
  };

  const handleTasbihTap = () => {
    const nextCount = tasbihCount + 1;
    const reachedTarget = nextCount >= tasbihTarget;
    if (soundEnabled) {
      playTasbihClick(reachedTarget);
    }
    setTasbihCount(nextCount > tasbihTarget ? 1 : nextCount);
    setTasbihTotal((prev) => prev + 1);
  };

  const handleDownloadKotlinZip = async () => {
    setIsDownloadingZip(true);
    try {
      await downloadKotlinAndroidProjectZip();
    } finally {
      setIsDownloadingZip(false);
    }
  };

  const handleCopyCode = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFile(label);
    window.setTimeout(() => setCopiedFile(null), 2000);
  };

  const completedTasksCount = tasks.filter((t) => t.completed).length;
  const tasksProgressPct =
    tasks.length > 0 ? Math.round((completedTasksCount / tasks.length) * 100) : 0;

  const filteredAdhkar = useMemo(() => {
    return ADHKAR_LIST.filter((d) => d.category === adhkarCategory);
  }, [adhkarCategory]);

  const activeTasbihPhrase = useMemo(() => {
    return (
      TASBIH_PHRASES.find((p) => p.id === selectedPhraseId) || TASBIH_PHRASES[0]
    );
  }, [selectedPhraseId]);

  const activeKotlinFile = useMemo(() => {
    return (
      KOTLIN_PROJECT_FILES.find((f) => f.path === selectedKotlinPath) ||
      KOTLIN_PROJECT_FILES[0]
    );
  }, [selectedKotlinPath]);

  const gitCommandsText = `git init
git add .
git commit -m "Initial commit: Noor Al-Muslim Kotlin & Java Android App"
git branch -M main
git remote add origin https://github.com/${githubUsername || 'username'}/${
    githubRepoName || 'noor-al-muslim-kotlin'
  }.git
git push -u origin main`;

  return (
    <div className="min-h-screen bg-[#F8F7F4] text-slate-900 flex flex-col">
      {/* Top Bar Contract: 1-row, 3-zone header separated by gap-8 */}
      <header className="sticky top-0 z-30 bg-[#F8F7F4]/95 backdrop-blur-md border-b border-slate-200/80 px-6 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-8">
          {/* Zone 1: Single text element wordmark */}
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              setWorkspaceMode('studio');
            }}
            className="text-xl font-bold tracking-tight text-emerald-950 font-serif-arabic whitespace-nowrap shrink-0"
          >
            نور المسلم · Kotlin & Java Android Project
          </a>

          {/* Zone 2: Clean single-line text navigation links */}
          <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-slate-600">
            <button
              type="button"
              onClick={() => setWorkspaceMode('studio')}
              className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 cursor-pointer ${
                workspaceMode === 'studio'
                  ? 'border-emerald-800 text-emerald-950 font-semibold'
                  : 'border-transparent hover:text-slate-900'
              }`}
            >
              بيئة كوتلن وجافا + محاكي أندرويد
            </button>
            <button
              type="button"
              onClick={() => setWorkspaceMode('full_app')}
              className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 cursor-pointer ${
                workspaceMode === 'full_app'
                  ? 'border-emerald-800 text-emerald-950 font-semibold'
                  : 'border-transparent hover:text-slate-900'
              }`}
            >
              معاينة الشاشات الكاملة
            </button>
            <button
              type="button"
              onClick={() => setWorkspaceMode('github_guide')}
              className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 cursor-pointer ${
                workspaceMode === 'github_guide'
                  ? 'border-emerald-800 text-emerald-950 font-semibold'
                  : 'border-transparent hover:text-slate-900'
              }`}
            >
              الرفع على GitHub وفتح Android Studio
            </button>
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={handleDownloadKotlinZip}
              disabled={isDownloadingZip}
              className="px-4 py-2 text-xs font-semibold text-white bg-emerald-900 rounded-lg hover:bg-emerald-800 transition-colors whitespace-nowrap shrink-0 flex items-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>
                {isDownloadingZip
                  ? 'جاري ضغط ملفات Kotlin/Java...'
                  : 'تنزيل مشروع Android Studio خالص (.zip)'}
              </span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Important Clarification Banner about Native Kotlin/Java Files in Root */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1 max-w-3xl">
            <div className="flex items-center gap-2 text-xs text-emerald-900 font-semibold">
              <FileCode className="w-4 h-4" />
              <span>
                تم إنشاء ملفات الأندرويد الأصلية (Kotlin .kt + Java .java + XML + Gradle) في جذر المشروع مباشرة
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              توجد ملفات <span className="font-mono-code text-slate-900">app/src/main/java/com/nooralmuslim/app/...</span> و{' '}
              <span className="font-mono-code text-slate-900">app/src/main/res/layout/activity_main.xml</span> و{' '}
              <span className="font-mono-code text-slate-900">build.gradle.kts</span> و{' '}
              <span className="font-mono-code text-slate-900">settings.gradle.kts</span>{' '}
              كملفات حقيقية داخل شجرة المشروع. كما يمكنك الضغط على <strong>«تنزيل مشروع Android Studio خالص (.zip)»</strong> للحصول على مجلد يحتوي <strong>فقط</strong> على ملفات Kotlin و Java و XML و Gradle بدون أي ملفات متصفح.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <label htmlFor="city-select" className="text-xs text-slate-500">
              مدينة المحاكي:
            </label>
            <select
              id="city-select"
              value={selectedCityId}
              onChange={(e) => {
                setCustomCoords(null);
                setSelectedCityId(e.target.value);
              }}
              className="text-xs font-semibold bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 text-slate-800"
            >
              {CITIES.map((city) => (
                <option key={city.id} value={city.id}>
                  {city.nameAr}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* WORKSPACE MODE 1: ANDROID STUDIO TREE + CODE EDITOR + LIVE PIXEL 8 EMULATOR */}
        {workspaceMode === 'studio' && (
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Column 1: Hierarchical Android Project Tree View (3 cols) */}
            <div className="lg:col-span-3">
              <KotlinFileTree
                files={KOTLIN_PROJECT_FILES}
                selectedPath={selectedKotlinPath}
                onSelectFile={(path) => setSelectedKotlinPath(path)}
              />
            </div>

            {/* Column 2: Kotlin / Java / XML Source Code Viewer (5 cols) */}
            <div className="lg:col-span-5 bg-slate-950 text-slate-100 rounded-2xl border border-slate-800 overflow-hidden flex flex-col">
              <div className="px-4 py-3.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div
                    className="text-xs font-mono-code text-emerald-400 font-semibold truncate"
                    dir="ltr"
                  >
                    {activeKotlinFile.path}
                  </div>
                  <p className="text-[11px] text-slate-300 mt-0.5 truncate">
                    {activeKotlinFile.descriptionAr}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    handleCopyCode(
                      activeKotlinFile.content,
                      activeKotlinFile.path
                    )
                  }
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>
                    {copiedFile === activeKotlinFile.path ? 'تم النسخ!' : 'نسخ الكود'}
                  </span>
                </button>
              </div>

              <div className="p-4 overflow-x-auto max-h-[680px] flex-1" dir="ltr">
                <pre className="text-xs font-mono-code leading-relaxed text-slate-100">
                  <code>{activeKotlinFile.content}</code>
                </pre>
              </div>
            </div>

            {/* Column 3: Interactive Android Emulator (Pixel 8 API 34) (4 cols) */}
            <div className="lg:col-span-4 flex flex-col items-center">
              <div className="w-full max-w-[380px] bg-slate-900 rounded-[36px] p-3 shadow-xl border-4 border-slate-800">
                {/* Android Emulator Top Status Bar */}
                <div
                  dir="ltr"
                  className="px-4 py-1.5 text-[11px] font-mono-code text-slate-300 flex items-center justify-between"
                >
                  <span>Pixel 8 API 34</span>
                  <span className="tabular-nums">
                    {now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span>Kotlin · RTL</span>
                </div>

                {/* Android App Screen Viewport */}
                <div className="bg-[#F8F7F4] rounded-[26px] overflow-hidden flex flex-col h-[620px] text-slate-900">
                  {/* Android Material 3 Top Bar */}
                  <div className="bg-emerald-950 text-white px-4 py-3 flex items-center justify-between">
                    <div>
                      <div className="text-sm font-bold font-serif-arabic">
                        نور المسلم · {activeCity.nameAr}
                      </div>
                      <div className="text-[10px] text-emerald-200">
                        {hijriDateFormatted}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSoundEnabled(!soundEnabled)}
                      className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer"
                      title="تبديل الصوت"
                    >
                      {soundEnabled ? (
                        <Volume2 className="w-4 h-4" />
                      ) : (
                        <VolumeX className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {/* Emulator Scrollable Screen Body */}
                  <div className="flex-1 overflow-y-auto p-3.5 space-y-3">
                    {/* EMULATOR SCREEN 1: PRAYER TIMES & ADHAN */}
                    {emulatorTab === 'prayers' && (
                      <>
                        <div className="relative rounded-2xl overflow-hidden bg-emerald-900 text-white p-4">
                          {!heroImageError && (
                            <img
                              src={courtyardHeroImg}
                              alt="مسجد"
                              referrerPolicy="no-referrer"
                              onError={() => setHeroImageError(true)}
                              className="absolute inset-0 w-full h-full object-cover opacity-35"
                            />
                          )}
                          <div className="relative z-10 space-y-2">
                            <div className="text-[11px] text-amber-200">
                              الصلاة القادمة · {activeCity.methodAr}
                            </div>
                            <div className="flex items-baseline justify-between">
                              <div className="text-2xl font-bold font-serif-arabic">
                                صلاة {nextPrayerInfo.prayer.nameAr}
                              </div>
                              <div className="text-2xl font-bold font-mono-code text-amber-300 tabular-nums">
                                {nextPrayerInfo.prayer.time24}
                              </div>
                            </div>
                            <div className="text-[11px] text-emerald-100 font-mono-code tabular-nums">
                              متبقي {nextPrayerInfo.countdownFormatted} على الأذان
                            </div>
                            <button
                              type="button"
                              onClick={handleToggleAdhanAudio}
                              className="mt-2 w-full py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              {isPlayingAdhan ? (
                                <>
                                  <Square className="w-3.5 h-3.5 fill-current" />
                                  <span>إيقاف صوت الأذان</span>
                                </>
                              ) : (
                                <>
                                  <Play className="w-3.5 h-3.5 fill-current" />
                                  <span>تجربة صوت الأذان الآن</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          {prayerTimes.map((p) => (
                            <div
                              key={p.id}
                              className="bg-white rounded-xl p-3 border border-slate-200/80 flex items-center justify-between"
                            >
                              <div>
                                <div className="text-sm font-bold text-slate-900">
                                  {p.nameAr}
                                </div>
                                <div className="text-[11px] text-slate-500">
                                  {p.sunnahAr}
                                </div>
                              </div>
                              <div className="flex items-center gap-2.5">
                                <span className="text-sm font-bold font-mono-code tabular-nums">
                                  {p.time24}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleTogglePrayerAlarm(p.id)}
                                  className={`p-2 rounded-lg cursor-pointer ${
                                    p.adhanEnabled
                                      ? 'bg-emerald-50 text-emerald-800'
                                      : 'bg-slate-100 text-slate-400'
                                  }`}
                                >
                                  {p.adhanEnabled ? (
                                    <Bell className="w-4 h-4" />
                                  ) : (
                                    <BellOff className="w-4 h-4" />
                                  )}
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    )}

                    {/* EMULATOR SCREEN 2: DAILY TASKS */}
                    {emulatorTab === 'tasks' && (
                      <div className="space-y-3">
                        <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80">
                          <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-1.5">
                            <span>المهام اليومية والسنن</span>
                            <span className="font-mono-code text-emerald-800 tabular-nums">
                              {completedTasksCount}/{tasks.length}
                            </span>
                          </div>
                          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-emerald-800 transition-all"
                              style={{ width: `${tasksProgressPct}%` }}
                            />
                          </div>
                        </div>

                        <form onSubmit={handleAddTask} className="flex gap-1.5">
                          <input
                            type="text"
                            value={newTaskTitle}
                            onChange={(e) => setNewTaskTitle(e.target.value)}
                            placeholder="أضف مهمة إيمانية جديدة..."
                            className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs"
                          />
                          <button
                            type="submit"
                            className="px-3 py-2 bg-emerald-900 text-white rounded-xl text-xs font-semibold cursor-pointer"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </form>

                        <div className="space-y-2">
                          {tasks.map((t) => (
                            <div
                              key={t.id}
                              className="bg-white rounded-xl p-3 border border-slate-200/80 flex items-center justify-between gap-2"
                            >
                              <button
                                type="button"
                                onClick={() => handleToggleTask(t.id)}
                                className="flex items-center gap-2.5 text-right flex-1 min-w-0 cursor-pointer"
                              >
                                <span
                                  className={`w-5 h-5 rounded-md flex items-center justify-center border shrink-0 ${
                                    t.completed
                                      ? 'bg-emerald-800 border-emerald-800 text-white'
                                      : 'border-slate-300'
                                  }`}
                                >
                                  {t.completed && <Check className="w-3.5 h-3.5" />}
                                </span>
                                <div className="min-w-0 flex-1">
                                  <div
                                    className={`text-xs font-bold truncate ${
                                      t.completed
                                        ? 'line-through text-slate-400'
                                        : 'text-slate-900'
                                    }`}
                                  >
                                    {t.titleAr}
                                  </div>
                                  <div className="text-[10px] text-slate-500 truncate">
                                    {t.categoryLabelAr} · {t.subtitleAr}
                                  </div>
                                </div>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteTask(t.id)}
                                className="p-1.5 text-slate-400 hover:text-red-600 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* EMULATOR SCREEN 3: ADHKAR */}
                    {emulatorTab === 'adhkar' && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-1 bg-slate-200/70 p-1 rounded-xl">
                          {[
                            { id: 'morning', label: 'الصباح' },
                            { id: 'evening', label: 'المساء' },
                            { id: 'prayer', label: 'الصلاة' },
                            { id: 'sleep', label: 'النوم' },
                          ].map((cat) => (
                            <button
                              key={cat.id}
                              type="button"
                              onClick={() =>
                                setAdhkarCategory(cat.id as typeof adhkarCategory)
                              }
                              className={`flex-1 py-1.5 text-[11px] font-semibold rounded-lg cursor-pointer ${
                                adhkarCategory === cat.id
                                  ? 'bg-white text-emerald-950 shadow-xs'
                                  : 'text-slate-600'
                              }`}
                            >
                              {cat.label}
                            </button>
                          ))}
                        </div>

                        {filteredAdhkar.map((dhikr) => {
                          const count = adhkarCounts[dhikr.id] || 0;
                          const done = count >= dhikr.targetCount;
                          return (
                            <div
                              key={dhikr.id}
                              onClick={() =>
                                handleIncrementDhikr(dhikr.id, dhikr.targetCount)
                              }
                              className={`p-3.5 rounded-2xl border cursor-pointer transition-colors ${
                                done
                                  ? 'bg-emerald-50/70 border-emerald-300'
                                  : 'bg-white border-slate-200'
                              }`}
                            >
                              <div className="text-[10px] text-emerald-800 mb-1">
                                {dhikr.sourceAr}
                              </div>
                              <p className="text-base font-serif-arabic leading-relaxed text-slate-900">
                                {dhikr.arabicText}
                              </p>
                              <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                                <span className="text-[11px] text-slate-600">
                                  {done ? 'اكتمل الذكر' : 'اضغط للتكرار'}
                                </span>
                                <span className="font-mono-code font-bold text-emerald-900 tabular-nums">
                                  {count} / {dhikr.targetCount}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* EMULATOR SCREEN 4: TASBIH */}
                    {emulatorTab === 'tasbih' && (
                      <div className="flex flex-col items-center justify-between h-full py-3 space-y-4">
                        <div className="text-center space-y-2">
                          <div className="text-xs text-slate-500">المسبحة الإلكترونية</div>
                          <div className="text-lg font-bold font-serif-arabic text-emerald-950 px-2">
                            {activeTasbihPhrase.arabic}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={handleTasbihTap}
                          className="w-44 h-44 rounded-full bg-emerald-950 active:scale-95 transition-transform text-white flex flex-col items-center justify-center shadow-md border-8 border-emerald-100 cursor-pointer"
                        >
                          <span className="text-4xl font-bold font-mono-code text-amber-300 tabular-nums">
                            {tasbihCount}
                          </span>
                          <span className="text-[11px] text-emerald-100 mt-1 font-mono-code">
                            من {tasbihTarget} · اضغط
                          </span>
                        </button>

                        <div className="w-full flex items-center justify-between text-xs pt-2 border-t border-slate-200">
                          <span className="font-mono-code">
                            الإجمالي: <strong>{tasbihTotal}</strong>
                          </span>
                          <div className="flex gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                const idx = TASBIH_PHRASES.findIndex(
                                  (p) => p.id === selectedPhraseId
                                );
                                const next =
                                  TASBIH_PHRASES[(idx + 1) % TASBIH_PHRASES.length];
                                setSelectedPhraseId(next.id);
                                setTasbihCount(0);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 cursor-pointer"
                            >
                              تغيير الذكر
                            </button>
                            <button
                              type="button"
                              onClick={() => setTasbihCount(0)}
                              className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 cursor-pointer"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* EMULATOR SCREEN 5: QIBLA */}
                    {emulatorTab === 'qibla' && (
                      <div className="flex flex-col items-center justify-center h-full py-4 space-y-4 text-center">
                        <div>
                          <div className="text-base font-bold text-slate-900">
                            بوصلة اتجاه القبلة (Java + Kotlin)
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5">
                            من {activeCity.nameAr} إلى الكعبة المشرفة
                          </div>
                        </div>

                        <div className="relative w-44 h-44 rounded-full border-2 border-slate-200 bg-white flex items-center justify-center">
                          <span className="absolute top-1.5 text-[10px] font-bold text-slate-500">
                            N
                          </span>
                          <div
                            className="transition-transform duration-200"
                            style={{ transform: `rotate(${qiblaData.bearingDeg}deg)` }}
                          >
                            <Compass className="w-16 h-16 text-emerald-900" />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <div className="text-xl font-bold font-mono-code text-emerald-950 tabular-nums">
                            {qiblaData.bearingDeg}° ({qiblaData.directionAr})
                          </div>
                          <div className="text-xs text-slate-600 font-mono-code tabular-nums">
                            المسافة إلى مكة: {qiblaData.distanceKm} كم
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Android Jetpack Compose NavigationBar */}
                  <div className="bg-white border-t border-slate-200 grid grid-cols-5 items-center py-2 px-1">
                    {[
                      { id: 'prayers', label: 'الأذان', icon: Bell },
                      { id: 'tasks', label: 'مهامي', icon: Check },
                      { id: 'adhkar', label: 'الأذكار', icon: BookOpen },
                      { id: 'tasbih', label: 'التسبيح', icon: RotateCcw },
                      { id: 'qibla', label: 'القبلة', icon: Compass },
                    ].map((nav) => {
                      const IconComp = nav.icon;
                      const isSelected = emulatorTab === nav.id;
                      return (
                        <button
                          key={nav.id}
                          type="button"
                          onClick={() => handleSelectEmulatorTab(nav.id as EmulatorTab)}
                          className={`flex flex-col items-center justify-center py-1 rounded-xl transition-colors cursor-pointer ${
                            isSelected
                              ? 'text-emerald-900 font-bold bg-emerald-50/80'
                              : 'text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          <IconComp className="w-4 h-4" />
                          <span className="text-[10px] mt-0.5">{nav.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 mt-2 text-center">
                اضغط على أي تبويب في المحاكي لعرض كود الـ Kotlin / Java المقابل له تلقائياً
              </p>
            </div>
          </section>
        )}

        {/* WORKSPACE MODE 2: FULL SCREEN INTERACTIVE VIEW */}
        {workspaceMode === 'full_app' && (
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200/90 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900">
                  مواقيت الصلاة والأذان في {activeCity.nameAr}
                </h2>
                <button
                  type="button"
                  onClick={handleLocateGPS}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>GPS</span>
                </button>
              </div>
              {geoStatus && (
                <p className="text-xs text-emerald-800 bg-emerald-50 p-2 rounded-lg">
                  {geoStatus}
                </p>
              )}
              <div className="divide-y divide-slate-100">
                {prayerTimes.map((p) => (
                  <div
                    key={p.id}
                    className="py-3 flex items-center justify-between"
                  >
                    <div>
                      <div className="text-sm font-bold text-slate-900">
                        {p.nameAr}
                      </div>
                      <div className="text-xs text-slate-500">{p.sunnahAr}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono-code font-bold text-base tabular-nums">
                        {p.time24}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleTogglePrayerAlarm(p.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer ${
                          p.adhanEnabled
                            ? 'bg-emerald-50 text-emerald-900'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {p.adhanEnabled ? 'الأذان مفعل' : 'صامت'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200/90 p-6 space-y-4">
              <h2 className="text-lg font-bold text-slate-900">
                المهام الإيمانية اليومية ({completedTasksCount}/{tasks.length})
              </h2>
              <form onSubmit={handleAddTask} className="flex gap-2">
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="أضف مهمة إيمانية..."
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs"
                />
                <select
                  value={newTaskCategory}
                  onChange={(e) =>
                    setNewTaskCategory(e.target.value as DailyTaskItem['category'])
                  }
                  className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-2 text-xs"
                >
                  <option value="prayer">الصلوات</option>
                  <option value="sunnah">السنن</option>
                  <option value="adhkar">الأذكار</option>
                  <option value="quran">القرآن</option>
                </select>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-900 text-white rounded-lg text-xs font-semibold cursor-pointer"
                >
                  إضافة
                </button>
              </form>
              <div className="divide-y divide-slate-100">
                {tasks.map((t) => (
                  <div
                    key={t.id}
                    className="py-3 flex items-center justify-between gap-2"
                  >
                    <button
                      type="button"
                      onClick={() => handleToggleTask(t.id)}
                      className="flex items-center gap-3 text-right flex-1 cursor-pointer"
                    >
                      <span
                        className={`w-5 h-5 rounded flex items-center justify-center border ${
                          t.completed
                            ? 'bg-emerald-800 border-emerald-800 text-white'
                            : 'border-slate-300'
                        }`}
                      >
                        {t.completed && <Check className="w-3.5 h-3.5" />}
                      </span>
                      <span
                        className={`text-xs font-bold ${
                          t.completed
                            ? 'line-through text-slate-400'
                            : 'text-slate-900'
                        }`}
                      >
                        {t.titleAr}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteTask(t.id)}
                      className="text-slate-400 hover:text-red-600 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* WORKSPACE MODE 3: GITHUB & ANDROID STUDIO STEP-BY-STEP GUIDE */}
        {workspaceMode === 'github_guide' && (
          <section className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-slate-100">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  خطوات رفع مشروع Kotlin & Java على GitHub وتشغيله على محاكي Android Studio
                </h2>
                <p className="text-xs text-slate-600 mt-1">
                  احصل على ملفات الأندرويد الصافية بدون أي ملفات ويب وافتحها مباشرة في Android Studio
                </p>
              </div>
              <button
                type="button"
                onClick={handleDownloadKotlinZip}
                className="px-5 py-2.5 rounded-lg bg-emerald-900 hover:bg-emerald-800 text-white text-xs font-semibold flex items-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>تنزيل NoorAlMuslim-Kotlin-AndroidStudio.zip</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-5 rounded-xl bg-slate-50 border border-slate-200/70 space-y-2">
                <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
                  <Download className="w-4 h-4" />
                  <span>01. تنزيل مشروع Android الخالص</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  اضغط على زر التنزيل بالأعلى لتحميل ملف{' '}
                  <span className="font-mono-code">NoorAlMuslim-Kotlin-AndroidStudio.zip</span>{' '}
                  الذي يحتوي حصرياً على ملفات Kotlin (`.kt`) و Java (`.java`) و XML و Gradle بدون أي ملف HTML.
                </p>
              </div>

              <div className="p-5 rounded-xl bg-slate-50 border border-slate-200/70 space-y-2">
                <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
                  <FolderGit2 className="w-4 h-4" />
                  <span>02. الرفع على GitHub</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  قم بفك ضغط الملف على جهازك، ثم افتح Terminal داخل المجلد ونفذ أوامر Git بالأسفل لرفعه إلى مستودعك على GitHub.
                </p>
              </div>

              <div className="p-5 rounded-xl bg-slate-50 border border-slate-200/70 space-y-2">
                <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
                  <Smartphone className="w-4 h-4" />
                  <span>03. الفتح في Android Studio والمحاكي</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  افتح برنامج <strong>Android Studio</strong>، اختر <strong>Open</strong> وحدد المجلد، انتظر انتهاء <strong>Gradle Sync</strong> ثم شغّله على محاكي <strong>Pixel API 34</strong>.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center pt-4 border-t border-slate-100">
              <div className="lg:col-span-5 space-y-3">
                <h3 className="text-sm font-bold text-slate-900">
                  توليد أوامر الرفع إلى GitHub
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">
                      اسم مستخدم GitHub
                    </label>
                    <input
                      type="text"
                      dir="ltr"
                      value={githubUsername}
                      onChange={(e) => setGithubUsername(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono-code"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">
                      اسم المستودع
                    </label>
                    <input
                      type="text"
                      dir="ltr"
                      value={githubRepoName}
                      onChange={(e) => setGithubRepoName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono-code"
                    />
                  </div>
                </div>
              </div>

              <div
                className="lg:col-span-7 bg-slate-900 text-slate-100 rounded-xl p-4 font-mono-code text-xs"
                dir="ltr"
              >
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-slate-400">
                  <span>Terminal</span>
                  <button
                    type="button"
                    onClick={() => handleCopyCode(gitCommandsText, 'git-cmds')}
                    className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1.5 text-[11px] cursor-pointer"
                  >
                    <Copy className="w-3 h-3" />
                    <span>
                      {copiedFile === 'git-cmds' ? 'تم النسخ!' : 'نسخ الأوامر'}
                    </span>
                  </button>
                </div>
                <pre className="overflow-x-auto leading-relaxed text-emerald-300">
                  {gitCommandsText}
                </pre>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
