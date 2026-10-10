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
  ChevronLeft,
  Play,
  Square,
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

type ActiveSection = 'prayers' | 'tasks' | 'adhkar' | 'tasbih' | 'kotlin';

export default function App() {
  const [activeSection, setActiveSection] = useState<ActiveSection>('prayers');

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
  const [taskFilter, setTaskFilter] = useState<'all' | 'prayer' | 'quran' | 'adhkar' | 'sunnah'>('all');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState<DailyTaskItem['category']>('sunnah');
  const [newTaskTimeSlot, setNewTaskTimeSlot] = useState('طوال اليوم');

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
    KOTLIN_PROJECT_FILES[0].path
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
      timeSlotAr: newTaskTimeSlot,
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

  const filteredTasks = useMemo(() => {
    if (taskFilter === 'all') return tasks;
    return tasks.filter((t) => t.category === taskFilter);
  }, [tasks, taskFilter]);

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
git commit -m "Initial commit: Noor Al-Muslim Kotlin Android App"
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
              setActiveSection('prayers');
            }}
            className="text-xl font-bold tracking-tight text-emerald-950 font-serif-arabic whitespace-nowrap shrink-0"
          >
            نور المسلم · Muslim Pro Kotlin
          </a>

          {/* Zone 2: 5 clean single-line text navigation links */}
          <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-slate-600">
            <button
              type="button"
              onClick={() => setActiveSection('prayers')}
              className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
                activeSection === 'prayers'
                  ? 'border-emerald-800 text-emerald-950 font-semibold'
                  : 'border-transparent hover:text-slate-900'
              }`}
            >
              الأذان والمواقيت
            </button>
            <button
              type="button"
              onClick={() => setActiveSection('tasks')}
              className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
                activeSection === 'tasks'
                  ? 'border-emerald-800 text-emerald-950 font-semibold'
                  : 'border-transparent hover:text-slate-900'
              }`}
            >
              المهام اليومية
            </button>
            <button
              type="button"
              onClick={() => setActiveSection('adhkar')}
              className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
                activeSection === 'adhkar'
                  ? 'border-emerald-800 text-emerald-950 font-semibold'
                  : 'border-transparent hover:text-slate-900'
              }`}
            >
              حصن المسلم والأذكار
            </button>
            <button
              type="button"
              onClick={() => setActiveSection('tasbih')}
              className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
                activeSection === 'tasbih'
                  ? 'border-emerald-800 text-emerald-950 font-semibold'
                  : 'border-transparent hover:text-slate-900'
              }`}
            >
              التسبيح والقبلة
            </button>
            <button
              type="button"
              onClick={() => setActiveSection('kotlin')}
              className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
                activeSection === 'kotlin'
                  ? 'border-emerald-800 text-emerald-950 font-semibold'
                  : 'border-transparent hover:text-slate-900'
              }`}
            >
              كود Kotlin و GitHub
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
                  ? 'جاري تجهيز ملف المشروع...'
                  : 'تحميل مشروع Android Studio (.zip)'}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Container (1440px desktop baseline with max-w-7xl) */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8 pb-24 lg:pb-12">
        {/* Hero Split Banner: Live Next Prayer Focal Anchor + Architectural Photography */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Dominant Visual Anchor: Next Prayer & Adhan Call Card (7 cols) */}
          <div className="lg:col-span-7 relative rounded-2xl overflow-hidden border border-slate-200/80 min-h-[300px] flex flex-col justify-between p-6 sm:p-8 text-white bg-emerald-950">
            {!heroImageError ? (
              <img
                src={courtyardHeroImg}
                alt="ساحة مسجد إسلامي تقليدي وقت الفجر"
                referrerPolicy="no-referrer"
                onError={() => setHeroImageError(true)}
                className="absolute inset-0 w-full h-full object-cover opacity-55"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-950 via-emerald-900 to-slate-900" />
            )}
            {/* Measured Scrim for 4.5:1 legibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/50 to-black/30" />

            <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
              <div className="text-xs text-emerald-100/90 flex items-center gap-2">
                <span>{activeCity.nameAr}</span>
                <span aria-hidden="true">·</span>
                <span>{hijriDateFormatted}</span>
                <span aria-hidden="true">·</span>
                <span>{activeCity.methodAr}</span>
              </div>

              <button
                type="button"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="px-3 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 backdrop-blur-sm text-xs font-medium text-white flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                {soundEnabled ? (
                  <>
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>الصوت مفعل</span>
                  </>
                ) : (
                  <>
                    <VolumeX className="w-3.5 h-3.5" />
                    <span>الصوت صامت</span>
                  </>
                )}
              </button>
            </div>

            <div className="relative z-10 my-6">
              <p className="text-sm text-amber-200 font-medium mb-1">
                الصلاة القادمة حسب التوقيت المحلي
              </p>
              <div className="flex flex-wrap items-baseline justify-between gap-4">
                <div>
                  <h1 className="text-3xl sm:text-5xl font-bold font-serif-arabic tracking-tight text-white">
                    صلاة {nextPrayerInfo.prayer.nameAr}
                  </h1>
                  <p className="text-sm text-emerald-100 mt-2">
                    {nextPrayerInfo.prayer.sunnahAr}
                  </p>
                </div>

                <div className="text-left">
                  <div className="text-3xl sm:text-4xl font-bold font-mono-code text-amber-300 tabular-nums">
                    {nextPrayerInfo.prayer.time24}
                  </div>
                  <div className="text-xs text-emerald-100 mt-1 font-mono-code tabular-nums">
                    متبقي {nextPrayerInfo.countdownFormatted}
                  </div>
                </div>
              </div>
            </div>

            <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-white/15">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleToggleAdhanAudio}
                  className="px-4 py-2.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  {isPlayingAdhan ? (
                    <>
                      <Square className="w-3.5 h-3.5 fill-current" />
                      <span>إيقاف معاينة الأذان</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>تشغيل نداء الأذان</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleLocateGPS}
                  className="px-3.5 py-2.5 rounded-lg bg-white/15 hover:bg-white/25 text-white text-xs font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>تحديد موقعي (GPS)</span>
                </button>
              </div>

              <div className="text-xs text-emerald-100/90 font-mono-code tabular-nums">
                اتجاه القبلة: {qiblaData.bearingDeg}° ({qiblaData.directionAr}) ·{' '}
                {qiblaData.distanceKm} كم لمكة
              </div>
            </div>
          </div>

          {/* Right Column: Kotlin Android Studio & Daily Summary Card (5 cols) */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/90 p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 text-xs text-slate-500 mb-3">
                <span>مشروع أندرويد أصيل · Kotlin & Jetpack Compose</span>
                <span className="font-mono-code tabular-nums">API 34 · Material 3</span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 leading-snug">
                تطبيق مسلم برو متكامل جاهز للفتح في Android Studio والرفع على GitHub
              </h2>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                يمكنك تجربة كافة مميزات التطبيق مباشرة هنا (مواقيت الصلاة، الأذان، المهام اليومية، الأذكار، السبحة، وبوصلة القبلة) أو تحميل ملف المشروع الكامل بصيغة{' '}
                <span className="font-mono-code text-xs text-emerald-900 font-semibold">
                  Kotlin (.kt)
                </span>{' '}
                لتشغيله فوراً على محاكي أندرويد.
              </p>

              {/* Daily Worship Mini Metrics */}
              <div className="grid grid-cols-3 gap-3 mt-5 pt-5 border-t border-slate-100">
                <div>
                  <div className="text-xs text-slate-500">إنجاز المهام</div>
                  <div className="text-xl font-bold text-emerald-900 font-mono-code tabular-nums mt-0.5">
                    {completedTasksCount}/{tasks.length}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-500">مجموع التسبيح</div>
                  <div className="text-xl font-bold text-emerald-900 font-mono-code tabular-nums mt-0.5">
                    {tasbihTotal}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-500">ملفات Kotlin</div>
                  <div className="text-xl font-bold text-emerald-900 font-mono-code tabular-nums mt-0.5">
                    {KOTLIN_PROJECT_FILES.length} ملفات
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => setActiveSection('kotlin')}
                className="flex-1 py-2.5 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <FileCode className="w-4 h-4" />
                <span>تصفح كود Kotlin وخطوات المحاكي</span>
              </button>
              <button
                type="button"
                onClick={handleDownloadKotlinZip}
                className="py-2.5 px-4 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Download className="w-4 h-4 text-emerald-800" />
                <span>تنزيل .ZIP</span>
              </button>
            </div>
          </div>
        </section>

        {/* Interactive Mode Selector Bar */}
        <section className="flex flex-wrap items-center justify-between gap-4 bg-white p-2 rounded-xl border border-slate-200/80">
          <div className="flex flex-wrap items-center gap-1">
            {[
              { id: 'prayers', label: '01. مواقيت الصلاة والأذان' },
              { id: 'tasks', label: '02. المهام اليومية والسنن' },
              { id: 'adhkar', label: '03. الأذكار وحصن المسلم' },
              { id: 'tasbih', label: '04. المسبحة وبوصلة القبلة' },
              { id: 'kotlin', label: '05. كود Kotlin و GitHub والمحاكي' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveSection(tab.id as ActiveSection)}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  activeSection === tab.id
                    ? 'bg-emerald-900 text-white'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* City Selector Dropdown */}
          <div className="flex items-center gap-2 px-2">
            <label htmlFor="city-select" className="text-xs text-slate-500 whitespace-nowrap">
              المدينة:
            </label>
            <select
              id="city-select"
              value={selectedCityId}
              onChange={(e) => {
                setCustomCoords(null);
                setSelectedCityId(e.target.value);
                setGeoStatus('');
              }}
              className="text-xs font-semibold bg-slate-100 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-800"
            >
              {CITIES.map((city) => (
                <option key={city.id} value={city.id}>
                  {city.nameAr} — {city.countryAr}
                </option>
              ))}
            </select>
          </div>
        </section>

        {geoStatus && (
          <div className="text-xs text-emerald-900 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5 flex items-center justify-between">
            <span>{geoStatus}</span>
            <button
              type="button"
              onClick={() => setGeoStatus('')}
              className="text-emerald-800 hover:underline font-medium"
            >
              إغلاق
            </button>
          </div>
        )}

        {/* SECTION 1: PRAYER TIMES & ADHAN */}
        {activeSection === 'prayers' && (
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/90 p-6">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-slate-100">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    جدول مواقيت الصلاة والأذان في {activeCity.nameAr}
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    الإحداثيات: {activeCity.lat}° شمالاً · {activeCity.lng}° شرقاً ·{' '}
                    {activeCity.methodAr}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleToggleAdhanAudio}
                  className="px-3.5 py-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-xs font-semibold flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>
                    {isPlayingAdhan ? 'إيقاف صوت الأذان' : 'اختبار صوت الأذان'}
                  </span>
                </button>
              </div>

              <div className="divide-y divide-slate-100 mt-2">
                {prayerTimes.map((prayer) => {
                  const isNext = nextPrayerInfo.prayer.id === prayer.id;
                  return (
                    <div
                      key={prayer.id}
                      className={`py-4 px-3 rounded-xl flex items-center justify-between gap-4 transition-colors ${
                        isNext ? 'bg-emerald-50/70' : 'hover:bg-slate-50/80'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-base font-bold text-slate-900">
                            {prayer.nameAr}
                          </span>
                          {isNext && (
                            <span className="text-xs font-semibold text-emerald-800">
                              · الصلاة القادمة
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {prayer.sunnahAr}
                        </p>
                      </div>

                      <div className="flex items-center gap-4 shrink-0">
                        <span className="text-lg font-bold font-mono-code text-slate-900 tabular-nums">
                          {prayer.time24}
                        </span>

                        <button
                          type="button"
                          onClick={() => handleTogglePrayerAlarm(prayer.id)}
                          aria-label={`تبديل منبه أذان ${prayer.nameAr}`}
                          className={`min-h-[44px] px-3 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                            prayer.adhanEnabled
                              ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                              : 'border-slate-200 bg-white text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          {prayer.adhanEnabled ? (
                            <>
                              <Bell className="w-4 h-4 text-emerald-800" />
                              <span>الأذان مفعل</span>
                            </>
                          ) : (
                            <>
                              <BellOff className="w-4 h-4 text-slate-400" />
                              <span>صامت</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Side Companion: Quick Daily Tasks & Qibla Card */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200/90 p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-bold text-slate-900">
                    ملخص الورد والمهام اليومية
                  </h3>
                  <span className="text-xs font-mono-code font-semibold text-emerald-900 tabular-nums">
                    {tasksProgressPct}%
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-4">
                  <div
                    className="h-full bg-emerald-800 transition-all duration-200"
                    style={{ width: `${tasksProgressPct}%` }}
                  />
                </div>
                <div className="space-y-2.5">
                  {tasks.slice(0, 4).map((task) => (
                    <button
                      key={task.id}
                      type="button"
                      onClick={() => handleToggleTask(task.id)}
                      className="w-full text-right py-2 px-3 rounded-xl hover:bg-slate-50 flex items-center gap-3 transition-colors cursor-pointer"
                    >
                      <span
                        className={`w-5 h-5 rounded-md flex items-center justify-center border shrink-0 ${
                          task.completed
                            ? 'bg-emerald-800 border-emerald-800 text-white'
                            : 'border-slate-300 bg-white'
                        }`}
                      >
                        {task.completed && <Check className="w-3.5 h-3.5" />}
                      </span>
                      <span
                        className={`text-xs font-medium truncate ${
                          task.completed
                            ? 'line-through text-slate-400'
                            : 'text-slate-800'
                        }`}
                      >
                        {task.titleAr}
                      </span>
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setActiveSection('tasks')}
                  className="mt-4 w-full py-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                >
                  <span>عرض جميع المهام اليومية ({tasks.length})</span>
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200/90 p-6">
                <h3 className="text-base font-bold text-slate-900">
                  كيف يعمل الأذان في كود Kotlin؟
                </h3>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  في ملف{' '}
                  <span className="font-mono-code text-emerald-900">
                    AdhanAlarmReceiver.kt
                  </span>{' '}
                  يتم استخدام{' '}
                  <span className="font-mono-code text-slate-800">
                    BroadcastReceiver
                  </span>{' '}
                  و{' '}
                  <span className="font-mono-code text-slate-800">
                    NotificationChannel
                  </span>{' '}
                  لإطلاق تنبيه الأذان في أندرويد بالوقت المحدد لكل صلاة.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedKotlinPath(
                      'app/src/main/java/com/nooralmuslim/app/service/AdhanAlarmReceiver.kt'
                    );
                    setActiveSection('kotlin');
                  }}
                  className="mt-4 text-xs font-semibold text-emerald-900 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>فتح ملف AdhanAlarmReceiver.kt</span>
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </section>
        )}

        {/* SECTION 2: DAILY WORSHIP TASKS */}
        {activeSection === 'tasks' && (
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/90 p-6 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    المهام الإيمانية اليومية والسنن الرواتب
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    تم إنجاز {completedTasksCount} من أصل {tasks.length} مهام اليوم ·{' '}
                    نسبة الإنجاز {tasksProgressPct}%
                  </p>
                </div>

                {/* Interactive Filter Controls */}
                <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-lg">
                  {[
                    { id: 'all', label: 'الكل' },
                    { id: 'prayer', label: 'الصلوات' },
                    { id: 'sunnah', label: 'السنن' },
                    { id: 'adhkar', label: 'الأذكار' },
                    { id: 'quran', label: 'القرآن' },
                  ].map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() =>
                        setTaskFilter(f.id as typeof taskFilter)
                      }
                      className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        taskFilter === f.id
                          ? 'bg-white text-slate-900 shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Add New Daily Task Form */}
              <form
                onSubmit={handleAddTask}
                className="grid grid-cols-1 sm:grid-cols-12 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200/70"
              >
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="أضف مهمة جديدة (مثال: قراءة سورة الملك قبل النوم)..."
                  className="sm:col-span-6 bg-white border border-slate-200 rounded-lg px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-800"
                />
                <select
                  value={newTaskCategory}
                  onChange={(e) =>
                    setNewTaskCategory(
                      e.target.value as DailyTaskItem['category']
                    )
                  }
                  className="sm:col-span-3 bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-xs text-slate-700"
                >
                  <option value="prayer">الصلوات المفروضة</option>
                  <option value="sunnah">السنن والنوافل</option>
                  <option value="adhkar">الأذكار اليومية</option>
                  <option value="quran">القرآن الكريم</option>
                </select>
                <button
                  type="submit"
                  className="sm:col-span-3 bg-emerald-900 hover:bg-emerald-800 text-white rounded-lg px-4 py-2.5 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>إضافة المهمة</span>
                </button>
              </form>

              {/* Tasks List */}
              <div className="divide-y divide-slate-100">
                {filteredTasks.map((task) => (
                  <div
                    key={task.id}
                    className="py-4 flex items-center justify-between gap-4 hover:bg-slate-50/70 px-3 rounded-xl transition-colors"
                  >
                    <button
                      type="button"
                      onClick={() => handleToggleTask(task.id)}
                      className="flex items-start gap-3.5 text-right flex-1 min-w-0 cursor-pointer"
                    >
                      <span
                        className={`mt-0.5 w-6 h-6 rounded-lg flex items-center justify-center border transition-colors shrink-0 ${
                          task.completed
                            ? 'bg-emerald-800 border-emerald-800 text-white'
                            : 'border-slate-300 bg-white'
                        }`}
                      >
                        {task.completed && <Check className="w-4 h-4" />}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div
                          className={`text-sm font-bold ${
                            task.completed
                              ? 'line-through text-slate-400'
                              : 'text-slate-900'
                          }`}
                        >
                          {task.titleAr}
                        </div>
                        {/* Zero-pill metadata */}
                        <div className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-1.5">
                          <span>{task.categoryLabelAr}</span>
                          <span aria-hidden="true">·</span>
                          <span>الوقت: {task.timeSlotAr}</span>
                          <span aria-hidden="true">·</span>
                          <span>{task.subtitleAr}</span>
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteTask(task.id)}
                      aria-label="حذف المهمة"
                      className="min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/90 p-6 space-y-4">
              <h3 className="text-base font-bold text-slate-900">
                إحصائيات المواظبة اليومية
              </h3>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span>المهام المنجزة</span>
                  <span className="font-mono-code font-bold text-emerald-900 tabular-nums">
                    {completedTasksCount} / {tasks.length}
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-800 transition-all duration-200"
                    style={{ width: `${tasksProgressPct}%` }}
                  />
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                قال رسول الله ﷺ: «أَحَبُّ الأَعْمَالِ إِلَى اللَّهِ تَعَالَى أَدْوَمُهَا وَإِنْ قَلَّ». يمكنك تخصيص قائمة مهامك اليومية لتشمل السنن الرواتب، ورد التلاوة، وأذكار الصباح والمساء.
              </p>
              <button
                type="button"
                onClick={() => {
                  setTasks(INITIAL_DAILY_TASKS.map((t) => ({ ...t, completed: false })));
                }}
                className="w-full py-2.5 px-4 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>بدء يوم جديد (تصفير الإنجاز)</span>
              </button>
            </div>
          </section>
        )}

        {/* SECTION 3: HISN AL-MUSLIM ADHKAR */}
        {activeSection === 'adhkar' && (
          <section className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200/90 p-6">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-slate-100">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    حصن المسلم والأذكار النبوية الصحيحة
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    اضغط على بطاقة الذكر لحساب التكرار تلقائياً مع التنبيه الصوتي عند اكتمال العدد
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
                    {[
                      { id: 'morning', label: 'أذكار الصباح' },
                      { id: 'evening', label: 'أذكار المساء' },
                      { id: 'prayer', label: 'بعد الصلاة' },
                      { id: 'sleep', label: 'أذكار النوم' },
                    ].map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() =>
                          setAdhkarCategory(cat.id as typeof adhkarCategory)
                        }
                        className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                          adhkarCategory === cat.id
                            ? 'bg-white text-emerald-950 shadow-sm'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={handleResetAdhkarCategory}
                    className="px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-medium text-slate-700 flex items-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>إعادة ضبط</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                {filteredAdhkar.map((dhikr) => {
                  const currentCount = adhkarCounts[dhikr.id] || 0;
                  const isCompleted = currentCount >= dhikr.targetCount;
                  return (
                    <div
                      key={dhikr.id}
                      onClick={() =>
                        handleIncrementDhikr(dhikr.id, dhikr.targetCount)
                      }
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleIncrementDhikr(dhikr.id, dhikr.targetCount);
                        }
                      }}
                      className={`p-6 rounded-2xl border transition-all flex flex-col justify-between text-right cursor-pointer select-none ${
                        isCompleted
                          ? 'bg-emerald-50/50 border-emerald-300'
                          : 'bg-[#FCFBF9] border-slate-200 hover:border-emerald-700/50'
                      }`}
                    >
                      <div>
                        <div className="text-xs text-slate-500 flex items-center justify-between gap-2 mb-3">
                          <span>{dhikr.sourceAr}</span>
                          <span className="font-mono-code tabular-nums">
                            العدد المطلوب: {dhikr.targetCount}
                          </span>
                        </div>

                        <p className="text-xl sm:text-2xl font-serif-arabic leading-loose text-slate-900">
                          {dhikr.arabicText}
                        </p>

                        <p className="text-xs text-slate-600 mt-4 leading-relaxed">
                          الفضل: {dhikr.virtueAr}
                        </p>
                      </div>

                      <div className="mt-6 pt-4 border-t border-slate-200/70 flex items-center justify-between">
                        <span
                          className={`text-xs font-semibold ${
                            isCompleted ? 'text-emerald-800' : 'text-slate-600'
                          }`}
                        >
                          {isCompleted
                            ? 'اكتمل الذكر بحمد الله'
                            : 'اضغط هنا للتكرار والعد'}
                        </span>

                        <div className="flex items-center gap-2 font-mono-code tabular-nums">
                          <span className="text-lg font-bold text-emerald-950">
                            {currentCount}
                          </span>
                          <span className="text-xs text-slate-400">/</span>
                          <span className="text-sm text-slate-600">
                            {dhikr.targetCount}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* SECTION 4: ELECTRONIC TASBIH & QIBLA COMPASS */}
        {activeSection === 'tasbih' && (
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Electronic Misbaha (7 cols) */}
            <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 flex flex-col justify-between">
              <div>
                <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">
                      المسبحة الإلكترونية والذكر المفتوح
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      اختر صيغة التسبيح وحدد هدف الدورة الواحدة (٣٣، ٩٩، ١٠٠)
                    </p>
                  </div>

                  <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg font-mono-code">
                    {[33, 99, 100].map((targetNum) => (
                      <button
                        key={targetNum}
                        type="button"
                        onClick={() => {
                          setTasbihTarget(targetNum);
                          setTasbihCount(0);
                        }}
                        className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                          tasbihTarget === targetNum
                            ? 'bg-white text-emerald-950 shadow-sm'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {targetNum}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Phrase Selector */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-4">
                  {TASBIH_PHRASES.map((phrase) => (
                    <button
                      key={phrase.id}
                      type="button"
                      onClick={() => {
                        setSelectedPhraseId(phrase.id);
                        setTasbihTarget(phrase.recommendedTarget);
                        setTasbihCount(0);
                      }}
                      className={`p-3 rounded-xl border text-right transition-colors cursor-pointer ${
                        selectedPhraseId === phrase.id
                          ? 'bg-emerald-50/70 border-emerald-800 text-emerald-950'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="text-sm font-bold font-serif-arabic truncate">
                        {phrase.arabic}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate mt-0.5">
                        {phrase.virtueAr}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Interactive Tactile Tasbih Ring */}
              <div className="my-8 flex flex-col items-center justify-center">
                <p className="text-xl sm:text-2xl font-serif-arabic font-bold text-center text-emerald-950 max-w-lg mb-6 leading-relaxed">
                  {activeTasbihPhrase.arabic}
                </p>

                <button
                  type="button"
                  onClick={handleTasbihTap}
                  className="w-52 h-52 rounded-full bg-emerald-950 hover:bg-emerald-900 active:scale-95 transition-transform text-white flex flex-col items-center justify-center shadow-md cursor-pointer select-none border-8 border-emerald-100"
                >
                  <span className="text-5xl font-bold font-mono-code tabular-nums text-amber-300">
                    {tasbihCount}
                  </span>
                  <span className="text-xs text-emerald-100 mt-2 font-mono-code tabular-nums">
                    من {tasbihTarget} · اضغط للتسبيح
                  </span>
                </button>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                <div className="font-mono-code tabular-nums">
                  المجموع الكلي للتسبيحات: <strong className="text-slate-900">{tasbihTotal}</strong>
                </div>
                <button
                  type="button"
                  onClick={() => setTasbihCount(0)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>تصفير الدورة</span>
                </button>
              </div>
            </div>

            {/* Qibla Compass & Direction Calculator (5 cols) */}
            <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 flex flex-col justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  بوصلة اتجاه القبلة الدقيقة
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  حساب الزاوية الدائرية العظمى نحو الكعبة المشرفة بمكة المكرمة من{' '}
                  {activeCity.nameAr}
                </p>
              </div>

              <div className="my-8 flex flex-col items-center justify-center">
                <div className="relative w-56 h-56 rounded-full border-2 border-slate-200 bg-slate-50 flex items-center justify-center">
                  {/* Cardinal directions */}
                  <span className="absolute top-2 text-xs font-bold text-slate-500">
                    N شمال
                  </span>
                  <span className="absolute bottom-2 text-xs font-bold text-slate-400">
                    S جنوب
                  </span>
                  <span className="absolute right-3 text-xs font-bold text-slate-400">
                    E شرق
                  </span>
                  <span className="absolute left-3 text-xs font-bold text-slate-400">
                    W غرب
                  </span>

                  {/* Rotating Qibla Pointer */}
                  <div
                    className="w-40 h-40 flex items-center justify-center transition-transform duration-200"
                    style={{ transform: `rotate(${qiblaData.bearingDeg}deg)` }}
                  >
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 rounded-full bg-amber-600 mb-1" />
                      <Compass className="w-16 h-16 text-emerald-900" />
                    </div>
                  </div>
                </div>

                <div className="text-center mt-5 space-y-1">
                  <div className="text-2xl font-bold font-mono-code text-emerald-950 tabular-nums">
                    {qiblaData.bearingDeg}° من الشمال الحقيقي
                  </div>
                  <p className="text-xs text-slate-600">
                    الاتجاه: {qiblaData.directionAr} · المسافة للكعبة المشرفة:{' '}
                    <span className="font-mono-code tabular-nums font-semibold">
                      {qiblaData.distanceKm} كم
                    </span>
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={handleLocateGPS}
                  className="w-full py-2.5 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <MapPin className="w-4 h-4" />
                  <span>معايرة القبلة عبر GPS موقعي الحالي</span>
                </button>
              </div>
            </div>
          </section>
        )}

        {/* SECTION 5: KOTLIN ANDROID STUDIO CODE & GITHUB / EMULATOR GUIDE */}
        {activeSection === 'kotlin' && (
          <section className="space-y-8">
            {/* Step-by-Step GitHub & Android Studio Emulator Guide */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-100">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                    دليل تحميل مشروع Kotlin ورفعه على GitHub وتشغيله على محاكي Android Studio
                  </h2>
                  <p className="text-xs text-slate-600 mt-1">
                    المشروع مكتوب بالكامل بلغة كوتلن (Kotlin 1.9 + Jetpack Compose + Material 3) ومقسم حسب معمارية أندرويد القياسية
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleDownloadKotlinZip}
                  disabled={isDownloadingZip}
                  className="px-5 py-2.5 rounded-lg bg-emerald-900 hover:bg-emerald-800 text-white text-xs font-semibold flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>تحميل ملف المشروع الكامل (.ZIP)</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                <div className="p-5 rounded-xl bg-slate-50 border border-slate-200/70 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
                    <Download className="w-4 h-4" />
                    <span>01. تحميل وفك ضغط المشروع</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    اضغط على زر <strong>تحميل مشروع Android Studio (.zip)</strong> أعلى الصفحة للحصول على مجلد المشروع كاملاً شاملاً ملفات{' '}
                    <span className="font-mono-code">build.gradle.kts</span> و{' '}
                    <span className="font-mono-code">AndroidManifest.xml</span> وكافة شاشات{' '}
                    <span className="font-mono-code">.kt</span>.
                  </p>
                </div>

                <div className="p-5 rounded-xl bg-slate-50 border border-slate-200/70 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
                    <FolderGit2 className="w-4 h-4" />
                    <span>02. الرفع على GitHub</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    افتح Terminal داخل مجلد المشروع بعد فك الضغط، وانسخ أوامر Git الجاهزة بالأسفل لربط المشروع بحسابك على GitHub ورفعه بأمر واحد.
                  </p>
                </div>

                <div className="p-5 rounded-xl bg-slate-50 border border-slate-200/70 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
                    <Smartphone className="w-4 h-4" />
                    <span>03. التشغيل على محاكي Android Studio</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    افتح <strong>Android Studio</strong> واختر <strong>Open</strong> لتحديد المجلد، انتظر انتهاء <strong>Gradle Sync</strong>، ثم اختر محاكي <strong>Pixel API 34</strong> واضغط <strong>Run &apos;app&apos;</strong>.
                  </p>
                </div>
              </div>

              {/* Interactive GitHub Commands Customizer */}
              <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                <div className="lg:col-span-5 space-y-3">
                  <h3 className="text-sm font-bold text-slate-900">
                    تخصيص أوامر الرفع على GitHub
                  </h3>
                  <p className="text-xs text-slate-500">
                    أدخل اسم المستخدم واسم المستودع على GitHub لتوليد أوامر الرفع المباشرة:
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-slate-500 mb-1">
                        اسم حساب GitHub
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
                        اسم المستودع (Repository)
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

                <div className="lg:col-span-7 bg-slate-900 text-slate-100 rounded-xl p-4 font-mono-code text-xs relative" dir="ltr">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-slate-400">
                    <span>Git Bash / Terminal</span>
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
            </div>

            {/* Kotlin Source Code Explorer */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Hierarchical Folder Tree View (4 cols) */}
              <div className="lg:col-span-4">
                <KotlinFileTree
                  files={KOTLIN_PROJECT_FILES}
                  selectedPath={selectedKotlinPath}
                  onSelectFile={(path) => setSelectedKotlinPath(path)}
                />
              </div>

              {/* Code Viewer (8 cols) */}
              <div className="lg:col-span-8 bg-slate-950 text-slate-100 rounded-2xl border border-slate-800 overflow-hidden">
                <div className="px-5 py-4 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <div
                      className="text-xs font-mono-code text-emerald-400 font-semibold"
                      dir="ltr"
                    >
                      {activeKotlinFile.path}
                    </div>
                    <p className="text-xs text-slate-300 mt-1">
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
                    className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>
                      {copiedFile === activeKotlinFile.path
                        ? 'تم نسخ الكود!'
                        : 'نسخ ملف الكود'}
                    </span>
                  </button>
                </div>

                <div className="p-5 overflow-x-auto max-h-[640px]" dir="ltr">
                  <pre className="text-xs font-mono-code leading-relaxed text-slate-100">
                    <code>{activeKotlinFile.content}</code>
                  </pre>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Mobile Bottom Navigation Bar (Thumb-Zone Ergonomics, <=15% height cap) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 grid grid-cols-5 items-center h-16 px-2">
        {[
          { id: 'prayers', label: 'الأذان', icon: Bell },
          { id: 'tasks', label: 'مهامي', icon: Check },
          { id: 'adhkar', label: 'الأذكار', icon: Volume2 },
          { id: 'tasbih', label: 'التسبيح', icon: Compass },
          { id: 'kotlin', label: 'كوتلن', icon: FileCode },
        ].map((item) => {
          const IconComponent = item.icon;
          const active = activeSection === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveSection(item.id as ActiveSection)}
              className={`min-h-[44px] flex flex-col items-center justify-center transition-colors cursor-pointer ${
                active ? 'text-emerald-900 font-bold' : 'text-slate-500'
              }`}
            >
              <IconComponent className="w-5 h-5" />
              <span className="text-[10px] mt-1 whitespace-nowrap">
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
