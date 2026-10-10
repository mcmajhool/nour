package com.nooralmuslim.app.model

import androidx.compose.runtime.mutableStateListOf

data class PrayerTime(
    val id: String,
    val nameAr: String,
    val time24: String,
    val sunnahNote: String,
    val isAdhanEnabled: Boolean = true
)

data class WorshipTask(
    val id: String,
    val titleAr: String,
    val subtitleAr: String,
    val categoryAr: String,
    val isCompleted: Boolean = false
)

data class DhikrEntry(
    val id: String,
    val category: String,
    val arabicText: String,
    val virtueAr: String,
    val sourceAr: String,
    val targetCount: Int,
    val currentCount: Int = 0
)

class SampleIslamicRepository {
    val prayers = mutableStateListOf(
        PrayerTime("fajr", "الفجر", "04:52", "ركعتان قبل الفرض", true),
        PrayerTime("sunrise", "الشروق", "06:14", "صلاة الضحى بعده بـ ١٥ دقيقة", false),
        PrayerTime("dhuhr", "الظهر", "12:08", "٤ ركعات قبلها وركعتان بعدها", true),
        PrayerTime("asr", "العصر", "15:29", "٤ ركعات مستحبة قبل الفرض", true),
        PrayerTime("maghrib", "المغرب", "18:02", "ركعتان بعد الفرض", true),
        PrayerTime("isha", "العشاء", "19:32", "ركعتان بعد الفرض + الوتر", true)
    )

    val dailyTasks = mutableStateListOf(
        WorshipTask("1", "صلاة الفجر في وقتها", "من صلى الصبح فهو في ذمة الله", "الصلوات", true),
        WorshipTask("2", "قراءة أذكار الصباح", "حصن المسلم بعد الفجر", "الأذكار", true),
        WorshipTask("3", "صلاة الضحى (ركعتان)", "صدقة عن كل مفصل", "السنن", false),
        WorshipTask("4", "الورد القرآني اليومي", "قراءة صفحتين بتدبر", "القرآن", false),
        WorshipTask("5", "السنن الرواتب (١٢ ركعة)", "بيت في الجنة لمن واظب عليها", "السنن", false),
        WorshipTask("6", "قراءة أذكار المساء", "بعد العصر حتى الغروب", "الأذكار", false),
        WorshipTask("7", "صلاة الوتر قبل النوم", "اجعلوا آخر صلاتكم بالليل وتراً", "القيام", false)
    )

    val adhkarList = mutableStateListOf(
        DhikrEntry(
            id = "m1",
            category = "أذكار الصباح",
            arabicText = "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ.",
            virtueAr = "إعلان التوحيد وسؤال الله خير هذا اليوم وخير ما بعده.",
            sourceAr = "رواه مسلم",
            targetCount = 1
        ),
        DhikrEntry(
            id = "m2",
            category = "أذكار الصباح",
            arabicText = "بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ.",
            virtueAr = "من قالها ثلاثاً إذا أصبح وثلاثاً إذا أمسى لم يضره شيء.",
            sourceAr = "رواه أبو داود والترمذي",
            targetCount = 3
        ),
        DhikrEntry(
            id = "p1",
            category = "بعد الصلاة",
            arabicText = "سُبْحَانَ اللَّهِ، وَالْحَمْدُ لِلَّهِ، وَاللَّهُ أَكْبَرُ.",
            virtueAr = "ثلاثاً وثلاثين دبر كل صلاة مفروضة غفرت خطاياه وإن كانت مثل زبد البحر.",
            sourceAr = "رواه مسلم",
            targetCount = 33
        )
    )

    fun togglePrayerAdhan(prayerId: String) {
        val index = prayers.indexOfFirst { it.id == prayerId }
        if (index != -1) {
            val current = prayers[index]
            prayers[index] = current.copy(isAdhanEnabled = !current.isAdhanEnabled)
        }
    }

    fun toggleTask(taskId: String) {
        val index = dailyTasks.indexOfFirst { it.id == taskId }
        if (index != -1) {
            val current = dailyTasks[index]
            dailyTasks[index] = current.copy(isCompleted = !current.isCompleted)
        }
    }

    fun addTask(title: String, category: String) {
        if (title.isBlank()) return
        dailyTasks.add(
            0,
            WorshipTask(
                id = System.currentTimeMillis().toString(),
                titleAr = title.trim(),
                subtitleAr = "مهمة إيمانية يومية مضافة",
                categoryAr = category,
                isCompleted = false
            )
        )
    }

    fun incrementDhikr(dhikrId: String) {
        val index = adhkarList.indexOfFirst { it.id == dhikrId }
        if (index != -1) {
            val item = adhkarList[index]
            if (item.currentCount < item.targetCount) {
                adhkarList[index] = item.copy(currentCount = item.currentCount + 1)
            }
        }
    }

    fun resetAllAdhkar() {
        for (i in adhkarList.indices) {
            adhkarList[i] = adhkarList[i].copy(currentCount = 0)
        }
    }
}
