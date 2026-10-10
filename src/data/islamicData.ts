export interface CityOption {
  id: string;
  nameAr: string;
  countryAr: string;
  lat: number;
  lng: number;
  tzOffset: number; // hours from UTC
  methodAr: string;
}

export interface PrayerTimeItem {
  id: 'fajr' | 'sunrise' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';
  nameAr: string;
  time24: string;
  minutesFromMidnight: number;
  sunnahAr: string;
  adhanEnabled: boolean;
}

export interface DailyTaskItem {
  id: string;
  titleAr: string;
  subtitleAr: string;
  category: 'prayer' | 'quran' | 'adhkar' | 'sunnah';
  categoryLabelAr: string;
  completed: boolean;
  timeSlotAr: string;
}

export interface DhikrItem {
  id: string;
  category: 'morning' | 'evening' | 'prayer' | 'sleep';
  arabicText: string;
  virtueAr: string;
  sourceAr: string;
  targetCount: number;
}

export interface TasbihPhrase {
  id: string;
  arabic: string;
  virtueAr: string;
  recommendedTarget: number;
}

export const CITIES: CityOption[] = [
  {
    id: 'makkah',
    nameAr: 'مكة المكرمة',
    countryAr: 'المملكة العربية السعودية',
    lat: 21.4225,
    lng: 39.8262,
    tzOffset: 3,
    methodAr: 'تقويم أم القرى',
  },
  {
    id: 'madinah',
    nameAr: 'المدينة المنورة',
    countryAr: 'المملكة العربية السعودية',
    lat: 24.4672,
    lng: 39.6112,
    tzOffset: 3,
    methodAr: 'تقويم أم القرى',
  },
  {
    id: 'riyadh',
    nameAr: 'الرياض',
    countryAr: 'المملكة العربية السعودية',
    lat: 24.7136,
    lng: 46.6753,
    tzOffset: 3,
    methodAr: 'تقويم أم القرى',
  },
  {
    id: 'cairo',
    nameAr: 'القاهرة',
    countryAr: 'مصر',
    lat: 30.0444,
    lng: 31.2357,
    tzOffset: 2,
    methodAr: 'الهيئة المصرية العامة للمساحة',
  },
  {
    id: 'algiers',
    nameAr: 'الجزائر العاصمة',
    countryAr: 'الجزائر',
    lat: 36.7538,
    lng: 3.0588,
    tzOffset: 1,
    methodAr: 'وزارة الشؤون الدينية والأوقاف',
  },
  {
    id: 'casablanca',
    nameAr: 'الدار البيضاء',
    countryAr: 'المغرب',
    lat: 33.5731,
    lng: -7.5898,
    tzOffset: 1,
    methodAr: 'وزارة الأوقاف والشؤون الإسلامية',
  },
  {
    id: 'amman',
    nameAr: 'عمّان',
    countryAr: 'الأردن',
    lat: 31.9454,
    lng: 35.9284,
    tzOffset: 3,
    methodAr: 'وزارة الأوقاف الأردنية',
  },
  {
    id: 'dubai',
    nameAr: 'دبي',
    countryAr: 'الإمارات العربية المتحدة',
    lat: 25.2048,
    lng: 55.2708,
    tzOffset: 4,
    methodAr: 'الهيئة العامة للشؤون الإسلامية',
  },
  {
    id: 'istanbul',
    nameAr: 'إسطنبول',
    countryAr: 'تركيا',
    lat: 41.0082,
    lng: 28.9784,
    tzOffset: 3,
    methodAr: 'رئاسة الشؤون الدينية التركية',
  },
];

// Astronomical Solar Approximation for Prayer Times based on Latitude, Longitude, Day of Year, and Timezone
export function calculatePrayerTimesForCity(
  city: CityOption,
  date: Date,
  adhanSettings: Record<string, boolean>
): PrayerTimeItem[] {
  const startOfYear = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - startOfYear.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));

  const deg2rad = (d: number) => (d * Math.PI) / 180;
  const rad2deg = (r: number) => (r * 180) / Math.PI;

  // Solar declination and equation of time
  const gamma = ((2 * Math.PI) / 365) * (dayOfYear - 1);
  const eqTime =
    229.18 *
    (0.000075 +
      0.001868 * Math.cos(gamma) -
      0.032077 * Math.sin(gamma) -
      0.014615 * Math.cos(2 * gamma) -
      0.040849 * Math.sin(2 * gamma));

  const decl =
    0.006918 -
    0.399912 * Math.cos(gamma) +
    0.070257 * Math.sin(gamma) -
    0.006758 * Math.cos(2 * gamma) +
    0.000907 * Math.sin(2 * gamma) -
    0.002697 * Math.cos(3 * gamma) +
    0.00148 * Math.sin(3 * gamma);

  const latRad = deg2rad(city.lat);

  // Solar noon in minutes from midnight local time
  const solarNoonMin = 720 - 4 * city.lng - eqTime + city.tzOffset * 60;

  const hourAngleForAltitude = (altitudeDeg: number): number => {
    const altRad = deg2rad(altitudeDeg);
    const cosHA =
      (Math.sin(altRad) - Math.sin(latRad) * Math.sin(decl)) /
      (Math.cos(latRad) * Math.cos(decl));
    const clamped = Math.max(-0.99, Math.min(0.99, cosHA));
    return rad2deg(Math.acos(clamped)) * 4; // 4 minutes per degree
  };

  // Asr shadow factor (Shafi'i / Majority = 1)
  const noonZenith = Math.abs(latRad - decl);
  const asrAltRad = Math.atan(1 / (1 + Math.tan(noonZenith)));
  const asrAltDeg = rad2deg(asrAltRad);

  const fajrOffset = hourAngleForAltitude(-18.5);
  const sunriseOffset = hourAngleForAltitude(-0.833);
  const asrOffset = hourAngleForAltitude(asrAltDeg);
  const maghribOffset = hourAngleForAltitude(-0.833);
  const ishaOffset = hourAngleForAltitude(-17.5);

  const formatTime = (mins: number) => {
    const rounded = Math.round(mins);
    const normalized = ((rounded % 1440) + 1440) % 1440;
    const h = Math.floor(normalized / 60);
    const m = normalized % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  };

  const rawTimes: Array<{
    id: PrayerTimeItem['id'];
    nameAr: string;
    mins: number;
    sunnahAr: string;
  }> = [
    {
      id: 'fajr',
      nameAr: 'الفجر',
      mins: Math.round(solarNoonMin - fajrOffset),
      sunnahAr: 'ركعتان قبل الفرض (خير من الدنيا وما فيها)',
    },
    {
      id: 'sunrise',
      nameAr: 'الشروق',
      mins: Math.round(solarNoonMin - sunriseOffset),
      sunnahAr: 'صلاة الضحى بعد الشروق بـ ١٥ دقيقة',
    },
    {
      id: 'dhuhr',
      nameAr: 'الظهر',
      mins: Math.round(solarNoonMin + 2),
      sunnahAr: '٤ ركعات قبلها وركعتان بعدها',
    },
    {
      id: 'asr',
      nameAr: 'العصر',
      mins: Math.round(solarNoonMin + asrOffset),
      sunnahAr: '٤ ركعات مستحبة قبل الفرض',
    },
    {
      id: 'maghrib',
      nameAr: 'المغرب',
      mins: Math.round(solarNoonMin + maghribOffset + 2),
      sunnahAr: 'ركعتان بعد الفرض',
    },
    {
      id: 'isha',
      nameAr: 'العشاء',
      mins: Math.round(solarNoonMin + ishaOffset),
      sunnahAr: 'ركعتان بعد الفرض + صلاة الوتر',
    },
  ];

  return rawTimes.map((item) => ({
    id: item.id,
    nameAr: item.nameAr,
    time24: formatTime(item.mins),
    minutesFromMidnight: item.mins,
    sunnahAr: item.sunnahAr,
    adhanEnabled: adhanSettings[item.id] ?? item.id !== 'sunrise',
  }));
}

// Calculate Great-Circle Qibla bearing & distance to the Holy Kaaba
export function calculateQibla(lat: number, lng: number): {
  bearingDeg: number;
  distanceKm: number;
  directionAr: string;
} {
  const kaabaLat = 21.4225;
  const kaabaLng = 39.8262;

  if (Math.abs(lat - kaabaLat) < 0.01 && Math.abs(lng - kaabaLng) < 0.01) {
    return { bearingDeg: 0, distanceKm: 0, directionAr: 'في رحاب مكة المكرمة' };
  }

  const deg2rad = (d: number) => (d * Math.PI) / 180;
  const rad2deg = (r: number) => (r * 180) / Math.PI;

  const phi1 = deg2rad(lat);
  const phi2 = deg2rad(kaabaLat);
  const deltaLng = deg2rad(kaabaLng - lng);

  const y = Math.sin(deltaLng) * Math.cos(phi2);
  const x =
    Math.cos(phi1) * Math.sin(phi2) -
    Math.sin(phi1) * Math.cos(phi2) * Math.cos(deltaLng);

  const theta = Math.atan2(y, x);
  const bearingDeg = Math.round((rad2deg(theta) + 360) % 360);

  // Haversine distance
  const R = 6371;
  const dLat = deg2rad(kaabaLat - lat);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(phi1) *
      Math.cos(phi2) *
      Math.sin(deltaLng / 2) *
      Math.sin(deltaLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distanceKm = Math.round(R * c);

  const directions = [
    'شمال',
    'شمال شرق',
    'شرق',
    'جنوب شرق',
    'جنوب',
    'جنوب غرب',
    'غرب',
    'شمال غرب',
  ];
  const idx = Math.round(bearingDeg / 45) % 8;

  return {
    bearingDeg,
    distanceKm,
    directionAr: directions[idx],
  };
}

export const INITIAL_DAILY_TASKS: DailyTaskItem[] = [
  {
    id: 'task-fajr',
    titleAr: 'صلاة الفجر في وقتها ومع الجماعة',
    subtitleAr: 'من صلى الصبح فهو في ذمة الله',
    category: 'prayer',
    categoryLabelAr: 'الصلوات المفروضة',
    completed: true,
    timeSlotAr: 'الفجر',
  },
  {
    id: 'task-morning-adhkar',
    titleAr: 'قراءة أذكار الصباح كاملة',
    subtitleAr: 'حصن المسلم بعد صلاة الفجر حتى الشروق',
    category: 'adhkar',
    categoryLabelAr: 'الأذكار اليومية',
    completed: true,
    timeSlotAr: 'الصباح',
  },
  {
    id: 'task-duha',
    titleAr: 'صلاة الضحى (صلاة الأوابين)',
    subtitleAr: 'ركعتان تجزئ عن ٣٦٠ صدقة عن كل مفصل',
    category: 'sunnah',
    categoryLabelAr: 'السنن والنوافل',
    completed: false,
    timeSlotAr: 'الضحى',
  },
  {
    id: 'task-quran-wird',
    titleAr: 'الورد القرآني اليومي (حزب أو صفحتان)',
    subtitleAr: 'قراءة وتدبر مع الاستماع للتلاوة',
    category: 'quran',
    categoryLabelAr: 'القرآن الكريم',
    completed: false,
    timeSlotAr: 'طوال اليوم',
  },
  {
    id: 'task-rawatib',
    titleAr: 'السنن الرواتب (١٢ ركعة في اليوم)',
    subtitleAr: 'يبني الله لمن واظب عليها بيتاً في الجنة',
    category: 'sunnah',
    categoryLabelAr: 'السنن والنوافل',
    completed: false,
    timeSlotAr: 'مع الصلوات',
  },
  {
    id: 'task-evening-adhkar',
    titleAr: 'قراءة أذكار المساء',
    subtitleAr: 'بعد صلاة العصر حتى غروب الشمس',
    category: 'adhkar',
    categoryLabelAr: 'الأذكار اليومية',
    completed: false,
    timeSlotAr: 'المساء',
  },
  {
    id: 'task-witr',
    titleAr: 'صلاة الوتر قبل النوم وأذكار النوم',
    subtitleAr: 'اجعلوا آخر صلاتكم بالليل وتراً',
    category: 'prayer',
    categoryLabelAr: 'الصلوات والقيام',
    completed: false,
    timeSlotAr: 'الليل',
  },
];

export const ADHKAR_LIST: DhikrItem[] = [
  // Morning
  {
    id: 'dhikr-m1',
    category: 'morning',
    arabicText:
      'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَن ذَا الَّذِي يَشْفَعُ عِندَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ.',
    virtueAr: 'من قالها حين يصبح أجير من الجن حتى يمسي، ومن قالها حين يمسي أجير من الجن حتى يصبح.',
    sourceAr: 'آية الكرسي · سورة البقرة ٢٥٥',
    targetCount: 1,
  },
  {
    id: 'dhikr-m2',
    category: 'morning',
    arabicText:
      'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، رَبِّ أَسْأَلُكَ خَيْرَ مَا فِي هَذَا الْيَوْمِ وَخَيْرَ مَا بَعْدَهُ، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِي هَذَا الْيَوْمِ وَشَرِّ مَا بَعْدَهُ.',
    virtueAr: 'سؤال الله خير اليوم والبركة والاستعاذة من الكسل وسوء الكبر.',
    sourceAr: 'رواه مسلم',
    targetCount: 1,
  },
  {
    id: 'dhikr-m3',
    category: 'morning',
    arabicText:
      'بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ.',
    virtueAr: 'من قالها ثلاثاً إذا أصبح وثلاثاً إذا أمسى لم يضره شيء.',
    sourceAr: 'رواه أبو داود والترمذي',
    targetCount: 3,
  },
  {
    id: 'dhikr-m4',
    category: 'morning',
    arabicText:
      'يَا حَيُّ يَا قَيُّومُ بِرَحْمَتِكَ أَسْتَغِيثُ أَصْلِحْ لِي شَأْنِي كُلَّهُ وَلَا تَكِلْنِي إِلَى نَفْسِي طَرْفَةَ عَيْنٍ.',
    virtueAr: 'وصية النبي ﷺ لفاطمة رضي الله عنها في الصباح والمساء.',
    sourceAr: 'رواه النسائي والحاكم',
    targetCount: 3,
  },
  // Evening
  {
    id: 'dhikr-e1',
    category: 'evening',
    arabicText:
      'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ.',
    virtueAr: 'ذكر المساء الجامع للتوحيد والافتقار إلى الله عز وجل.',
    sourceAr: 'رواه مسلم',
    targetCount: 1,
  },
  {
    id: 'dhikr-e2',
    category: 'evening',
    arabicText:
      'أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ.',
    virtueAr: 'من قالها حين يمسي ثلاث مرات لم تضره حُمَة تلك الليلة.',
    sourceAr: 'رواه مسلم',
    targetCount: 3,
  },
  {
    id: 'dhikr-e3',
    category: 'evening',
    arabicText:
      'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ لَكَ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ.',
    virtueAr: 'سيد الاستغفار: من قالها موقناً بها حين يمسي ومات من ليلته دخل الجنة.',
    sourceAr: 'رواه البخاري',
    targetCount: 1,
  },
  // Post-Prayer
  {
    id: 'dhikr-p1',
    category: 'prayer',
    arabicText:
      'أَسْتَغْفِرُ اللَّهَ (ثَلَاثاً) .. اللَّهُمَّ أَنْتَ السَّلَامُ وَمِنْكَ السَّلَامُ، تَبَارَكْتَ ذَا الْجَلَالِ وَالْإِكْرَامِ.',
    virtueAr: 'أول ما يقوله المصلي فور السلام من الصلاة المفروضة.',
    sourceAr: 'رواه مسلم',
    targetCount: 1,
  },
  {
    id: 'dhikr-p2',
    category: 'prayer',
    arabicText: 'سُبْحَانَ اللَّهِ، وَالْحَمْدُ لِلَّهِ، وَاللَّهُ أَكْبَرُ.',
    virtueAr: 'تُسَبِّحُ الله ثلاثاً وثلاثين، وتحمد ثلاثاً وثلاثين، وتكبر ثلاثاً وثلاثين فتلك تسعة وتسعون.',
    sourceAr: 'رواه مسلم',
    targetCount: 33,
  },
  {
    id: 'dhikr-p3',
    category: 'prayer',
    arabicText:
      'اللَّهُمَّ أَعِنِّي عَلَى ذِكْرِكَ، وَشُكْرِكَ، وَحُسْنِ عِبَادَتِكَ.',
    virtueAr: 'وصية النبي ﷺ لمعاذ بن جبل ألا يدعهن دبر كل صلاة.',
    sourceAr: 'رواه أبو داود والنسائي',
    targetCount: 1,
  },
  // Sleep
  {
    id: 'dhikr-s1',
    category: 'sleep',
    arabicText:
      'بِاسْمِكَ رَبِّي وَضَعْتُ جَنْبِي، وَبِكَ أَرْفَعُهُ، فَإِنْ أَمْسَكْتَ نَفْسِي فَارْحَمْهَا، وَإِنْ أَرْسَلْتَهَا فَاحْفَظْهَا بِمَا تَحْفَظُ بِهِ عِبَادَكَ الصَّالِحِينَ.',
    virtueAr: 'يقال عند الاضطجاع على الشق الأيمن قبل النوم.',
    sourceAr: 'متفق عليه',
    targetCount: 1,
  },
  {
    id: 'dhikr-s2',
    category: 'sleep',
    arabicText: 'بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا.',
    virtueAr: 'كان النبي ﷺ إذا أوى إلى فراشه قالها.',
    sourceAr: 'رواه البخاري',
    targetCount: 1,
  },
];

export const TASBIH_PHRASES: TasbihPhrase[] = [
  {
    id: 'subhanallah',
    arabic: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ، سُبْحَانَ اللَّهِ الْعَظِيمِ',
    virtueAr: 'كلمتان خفيفتان على اللسان، ثقيلتان في الميزان، حبيبتان إلى الرحمن',
    recommendedTarget: 33,
  },
  {
    id: 'alhamdulillah',
    arabic: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ',
    virtueAr: 'الحمد لله تملأ الميزان',
    recommendedTarget: 33,
  },
  {
    id: 'allahuakbar',
    arabic: 'اللَّهُ أَكْبَرُ كَبِيراً وَالْحَمْدُ لِلَّهِ كَثِيراً',
    virtueAr: 'فتحت لها أبواب السماء',
    recommendedTarget: 33,
  },
  {
    id: 'tahlil',
    arabic: 'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',
    virtueAr: 'كانت له عدل عشر رقاب وكتبت له مائة حسنة ومحيت عنه مائة سيئة',
    recommendedTarget: 100,
  },
  {
    id: 'istighfar',
    arabic: 'أَسْتَغْفِرُ اللَّهَ الْعَظِيمَ وَأَتُوبُ إِلَيْهِ',
    virtueAr: 'من لزم الاستغفار جعل الله له من كل هم فرجاً ومن كل ضيق مخرجاً',
    recommendedTarget: 100,
  },
  {
    id: 'salawat',
    arabic: 'اللَّهُمَّ صَلِّ وَسَلِّمْ وَبَارِكْ عَلَى نَبِيِّنَا مُحَمَّدٍ',
    virtueAr: 'من صلى عليَّ صلاة صلى الله عليه بها عشراً',
    recommendedTarget: 33,
  },
];

// Web Audio API Synthesized Sound Effects (Adhan Melodic Call & Tasbih Click)
let sharedAudioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtx) return null;
  if (!sharedAudioCtx) {
    sharedAudioCtx = new AudioCtx();
  }
  if (sharedAudioCtx.state === 'suspended') {
    sharedAudioCtx.resume();
  }
  return sharedAudioCtx;
}

export function playTasbihClick(isMilestone = false) {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = isMilestone ? 'triangle' : 'sine';
  osc.frequency.setValueAtTime(isMilestone ? 587.33 : 340, now);
  osc.frequency.exponentialRampToValueAtTime(isMilestone ? 880 : 180, now + (isMilestone ? 0.25 : 0.06));

  gain.gain.setValueAtTime(isMilestone ? 0.18 : 0.12, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + (isMilestone ? 0.28 : 0.06));

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + (isMilestone ? 0.3 : 0.07));
}

export function playAdhanPreviewChime(onStop?: () => void): () => void {
  const ctx = getAudioContext();
  if (!ctx) {
    if (onStop) onStop();
    return () => {};
  }

  // Hijaz Maqam resonant spiritual notes (D4, Eb4, F#4, G4, A4, Bb4, G4, F#4, D4)
  const notes = [
    { freq: 293.66, duration: 0.7, delay: 0.0 },   // اللـ
    { freq: 370.00, duration: 0.9, delay: 0.75 },  // ه
    { freq: 392.00, duration: 1.1, delay: 1.7 },   // أكـ
    { freq: 370.00, duration: 0.6, delay: 2.85 },  // بـ
    { freq: 293.66, duration: 1.3, delay: 3.5 },   // ر
    { freq: 392.00, duration: 0.8, delay: 5.0 },   // اللـ
    { freq: 440.00, duration: 1.0, delay: 5.85 },  // ه
    { freq: 392.00, duration: 0.7, delay: 6.9 },   // أكـ
    { freq: 370.00, duration: 0.7, delay: 7.65 },  // بـ
    { freq: 311.13, duration: 0.6, delay: 8.4 },   // ـر
    { freq: 293.66, duration: 1.6, delay: 9.05 },  // ر
  ];

  const oscillators: OscillatorNode[] = [];
  const now = ctx.currentTime;

  notes.forEach((n) => {
    const osc = ctx.createOscillator();
    const subOsc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    subOsc.type = 'triangle';

    osc.frequency.setValueAtTime(n.freq, now + n.delay);
    subOsc.frequency.setValueAtTime(n.freq * 0.5, now + n.delay);

    gain.gain.setValueAtTime(0.001, now + n.delay);
    gain.gain.linearRampToValueAtTime(0.14, now + n.delay + 0.12);
    gain.gain.setValueAtTime(0.14, now + n.delay + n.duration - 0.15);
    gain.gain.exponentialRampToValueAtTime(0.0008, now + n.delay + n.duration);

    osc.connect(gain);
    subOsc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now + n.delay);
    subOsc.start(now + n.delay);
    osc.stop(now + n.delay + n.duration);
    subOsc.stop(now + n.delay + n.duration);

    oscillators.push(osc, subOsc);
  });

  const timeoutId = window.setTimeout(() => {
    if (onStop) onStop();
  }, 10800);

  return () => {
    window.clearTimeout(timeoutId);
    oscillators.forEach((o) => {
      try {
        o.stop();
      } catch {
        // already stopped
      }
    });
    if (onStop) onStop();
  };
}
