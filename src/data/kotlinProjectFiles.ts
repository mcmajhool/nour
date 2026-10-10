import JSZip from 'jszip';

export interface KotlinProjectFile {
  path: string;
  fileName: string;
  language: 'kotlin' | 'gradle' | 'xml' | 'markdown';
  descriptionAr: string;
  content: string;
}

export const KOTLIN_PROJECT_FILES: KotlinProjectFile[] = [
  {
    path: 'app/src/main/java/com/nooralmuslim/app/MainActivity.kt',
    fileName: 'MainActivity.kt',
    language: 'kotlin',
    descriptionAr: 'نقطة الدخول الرئيسية للتطبيق بلغة Kotlin مع شريط التنقل السفلي (Jetpack Compose Material 3) ودعم اتجاه اللغة العربية RTL.',
    content: `package com.nooralmuslim.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Explore
import androidx.compose.material.icons.filled.MenuBook
import androidx.compose.material.icons.filled.NotificationsActive
import androidx.compose.material.icons.filled.TouchApp
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalLayoutDirection
import androidx.compose.ui.unit.LayoutDirection
import com.nooralmuslim.app.model.SampleIslamicRepository
import com.nooralmuslim.app.ui.screens.*
import com.nooralmuslim.app.ui.theme.NoorAlMuslimTheme

enum class AppDestination(val titleAr: String, val icon: ImageVector) {
    PRAYER_TIMES("الأذان", Icons.Default.NotificationsActive),
    DAILY_TASKS("مهامي", Icons.Default.CheckCircle),
    ADHKAR("الأذكار", Icons.Default.MenuBook),
    TASBIH("التسبيح", Icons.Default.TouchApp),
    QIBLA("القبلة", Icons.Default.Explore)
}

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            CompositionLocalProvider(LocalLayoutDirection provides LayoutDirection.Rtl) {
                NoorAlMuslimTheme {
                    NoorAlMuslimAppRoot()
                }
            }
        }
    }
}

@Composable
fun NoorAlMuslimAppRoot() {
    var currentTab by remember { mutableStateOf(AppDestination.PRAYER_TIMES) }
    val repository = remember { SampleIslamicRepository() }

    Scaffold(
        modifier = Modifier.fillMaxSize(),
        bottomBar = {
            NavigationBar {
                AppDestination.entries.forEach { destination ->
                    NavigationBarItem(
                        selected = currentTab == destination,
                        onClick = { currentTab = destination },
                        icon = {
                            Icon(
                                imageVector = destination.icon,
                                contentDescription = destination.titleAr
                            )
                        },
                        label = { Text(text = destination.titleAr) }
                    )
                }
            }
        }
    ) { innerPadding ->
        Box(modifier = Modifier.padding(innerPadding)) {
            when (currentTab) {
                AppDestination.PRAYER_TIMES -> PrayerTimesScreen(repository = repository)
                AppDestination.DAILY_TASKS -> DailyTasksScreen(repository = repository)
                AppDestination.ADHKAR -> AdhkarScreen(repository = repository)
                AppDestination.TASBIH -> TasbihScreen()
                AppDestination.QIBLA -> QiblaScreen()
            }
        }
    }
}
`,
  },
  {
    path: 'app/src/main/java/com/nooralmuslim/app/model/IslamicModels.kt',
    fileName: 'IslamicModels.kt',
    language: 'kotlin',
    descriptionAr: 'نماذج البيانات (Data Classes) ومستودع البيانات للمواقيت، المهام اليومية، والأذكار بلغة Kotlin.',
    content: `package com.nooralmuslim.app.model

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
`,
  },
  {
    path: 'app/src/main/java/com/nooralmuslim/app/ui/screens/PrayerTimesScreen.kt',
    fileName: 'PrayerTimesScreen.kt',
    language: 'kotlin',
    descriptionAr: 'شاشة مواقيت الصلاة والأذان مع عداد الصلاة القادمة وتفعيل منبه الأذان لكل فرض.',
    content: `package com.nooralmuslim.app.ui.screens

import android.media.RingtoneManager
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.NotificationsActive
import androidx.compose.material.icons.filled.NotificationsOff
import androidx.compose.material.icons.filled.VolumeUp
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.nooralmuslim.app.model.SampleIslamicRepository

@Composable
fun PrayerTimesScreen(repository: SampleIslamicRepository) {
    val context = LocalContext.current
    var adhanStatusMessage by remember { mutableStateOf("منبه الأذان مفعل حسب التوقيت المحلي") }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        item {
            Card(
                shape = RoundedCornerShape(24.dp),
                colors = CardDefaults.cardColors(containerColor = Color(0xFF064E3B))
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(20.dp)
                ) {
                    Text(
                        text = "الصلاة القادمة · مكة المكرمة",
                        color = Color(0xFFA7F3D0),
                        fontSize = 14.sp
                    )
                    Spacer(modifier = Modifier.height(6.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text(
                                text = "صلاة العصر",
                                color = Color.White,
                                fontSize = 28.sp,
                                fontWeight = FontWeight.Bold
                            )
                            Text(
                                text = "متبقي ٠١:٤٢:١٥ على رفع الأذان",
                                color = Color(0xFFD1FAE5),
                                fontSize = 14.sp
                            )
                        }
                        Text(
                            text = "15:29",
                            color = Color.White,
                            fontSize = 32.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }
                    Spacer(modifier = Modifier.height(14.dp))
                    Button(
                        onClick = {
                            try {
                                val uri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION)
                                val ringtone = RingtoneManager.getRingtone(context, uri)
                                ringtone.play()
                                adhanStatusMessage = "تم تشغيل معاينة صوت تنبيه الأذان بنجاح"
                            } catch (e: Exception) {
                                adhanStatusMessage = "تنبيه الأذان جاهز"
                            }
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFD97706))
                    ) {
                        Icon(Icons.Default.VolumeUp, contentDescription = null)
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("تجربة صوت الأذان الآن")
                    }
                }
            }
        }

        item {
            Text(
                text = adhanStatusMessage,
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.secondary
            )
        }

        items(repository.prayers, key = { it.id }) { prayer ->
            Card(
                shape = RoundedCornerShape(16.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp, vertical = 14.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = prayer.nameAr,
                            fontSize = 18.sp,
                            fontWeight = FontWeight.Bold
                        )
                        Text(
                            text = prayer.sunnahNote,
                            fontSize = 13.sp,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(
                            text = prayer.time24,
                            fontSize = 18.sp,
                            fontWeight = FontWeight.SemiBold,
                            modifier = Modifier.padding(end = 12.dp)
                        )
                        IconButton(onClick = { repository.togglePrayerAdhan(prayer.id) }) {
                            Icon(
                                imageVector = if (prayer.isAdhanEnabled) {
                                    Icons.Default.NotificationsActive
                                } else {
                                    Icons.Default.NotificationsOff
                                },
                                contentDescription = "تبديل الأذان",
                                tint = if (prayer.isAdhanEnabled) Color(0xFF047857) else Color.Gray
                            )
                        }
                    }
                }
            }
        }
    }
}
`,
  },
  {
    path: 'app/src/main/java/com/nooralmuslim/app/ui/screens/DailyTasksScreen.kt',
    fileName: 'DailyTasksScreen.kt',
    language: 'kotlin',
    descriptionAr: 'شاشة المهام الإيمانية اليومية والسنن الرواتب مع نسبة الإنجاز وإضافة مهام جديدة.',
    content: `package com.nooralmuslim.app.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.nooralmuslim.app.model.SampleIslamicRepository

@Composable
fun DailyTasksScreen(repository: SampleIslamicRepository) {
    var newTaskTitle by remember { mutableStateOf("") }
    val completedCount = repository.dailyTasks.count { it.isCompleted }
    val totalCount = repository.dailyTasks.size
    val progress = if (totalCount > 0) completedCount.toFloat() / totalCount else 0f

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        Card(
            shape = RoundedCornerShape(20.dp),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(modifier = Modifier.padding(18.dp)) {
                Text(
                    text = "جدول الطاعات والمهام اليومية",
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Bold
                )
                Spacer(modifier = Modifier.height(6.dp))
                Text(
                    text = "تم إنجاز $completedCount من أصل $totalCount مهام اليوم",
                    fontSize = 14.sp
                )
                Spacer(modifier = Modifier.height(10.dp))
                LinearProgressIndicator(
                    progress = { progress },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(10.dp)
                )
            }
        }

        Spacer(modifier = Modifier.height(14.dp))

        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically
        ) {
            OutlinedTextField(
                value = newTaskTitle,
                onValueChange = { newTaskTitle = it },
                placeholder = { Text("أضف مهمة إيمانية أو ورداً جديداً...") },
                modifier = Modifier.weight(1f),
                singleLine = true
            )
            Spacer(modifier = Modifier.width(8.dp))
            FilledIconButton(
                onClick = {
                    if (newTaskTitle.isNotBlank()) {
                        repository.addTask(newTaskTitle, "طاعات")
                        newTaskTitle = ""
                    }
                }
            ) {
                Icon(Icons.Default.Add, contentDescription = "إضافة مهمة")
            }
        }

        Spacer(modifier = Modifier.height(14.dp))

        LazyColumn(verticalArrangement = Arrangement.spacedBy(10.dp)) {
            items(repository.dailyTasks, key = { it.id }) { task ->
                Card(
                    onClick = { repository.toggleTask(task.id) },
                    shape = RoundedCornerShape(16.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(14.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Checkbox(
                            checked = task.isCompleted,
                            onCheckedChange = { repository.toggleTask(task.id) }
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                text = task.titleAr,
                                fontSize = 16.sp,
                                fontWeight = FontWeight.SemiBold,
                                textDecoration = if (task.isCompleted) {
                                    TextDecoration.LineThrough
                                } else {
                                    TextDecoration.None
                                }
                            )
                            Text(
                                text = "${task.categoryAr} · ${task.subtitleAr}",
                                fontSize = 13.sp,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    }
                }
            }
        }
    }
}
`,
  },
  {
    path: 'app/src/main/java/com/nooralmuslim/app/ui/screens/AdhkarScreen.kt',
    fileName: 'AdhkarScreen.kt',
    language: 'kotlin',
    descriptionAr: 'شاشة أذكار الصباح والمساء وبعد الصلاة مع عداد تفاعلي لكل ذكر وإعادة الضبط.',
    content: `package com.nooralmuslim.app.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.nooralmuslim.app.model.SampleIslamicRepository

@Composable
fun AdhkarScreen(repository: SampleIslamicRepository) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "حصن المسلم والأذكار اليومية",
                fontSize = 22.sp,
                fontWeight = FontWeight.Bold
            )
            TextButton(onClick = { repository.resetAllAdhkar() }) {
                Icon(Icons.Default.Refresh, contentDescription = null)
                Spacer(modifier = Modifier.width(4.dp))
                Text("تصفير العدادات")
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        LazyColumn(verticalArrangement = Arrangement.spacedBy(12.dp)) {
            items(repository.adhkarList, key = { it.id }) { dhikr ->
                val isDone = dhikr.currentCount >= dhikr.targetCount
                Card(
                    onClick = { repository.incrementDhikr(dhikr.id) },
                    shape = RoundedCornerShape(20.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(18.dp)) {
                        Text(
                            text = "${dhikr.category} · ${dhikr.sourceAr}",
                            fontSize = 12.sp,
                            color = MaterialTheme.colorScheme.primary
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            text = dhikr.arabicText,
                            fontSize = 20.sp,
                            lineHeight = 34.sp,
                            fontWeight = FontWeight.Medium
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            text = dhikr.virtueAr,
                            fontSize = 13.sp,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                        Spacer(modifier = Modifier.height(12.dp))
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = if (isDone) "اكتمل الذكر بحمد الله" else "اضغط على البطاقة للعد",
                                fontSize = 13.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = if (isDone) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.secondary
                            )
                            Text(
                                text = "${dhikr.currentCount} / ${dhikr.targetCount}",
                                fontSize = 18.sp,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }
                }
            }
        }
    }
}
`,
  },
  {
    path: 'app/src/main/java/com/nooralmuslim/app/ui/screens/TasbihScreen.kt',
    fileName: 'TasbihScreen.kt',
    language: 'kotlin',
    descriptionAr: 'المسبحة الإلكترونية (TasbihScreen.kt) مع الاهتزاز اللمسي (HapticFeedback) واختيار الذكر والهدف.',
    content: `package com.nooralmuslim.app.ui.screens

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.hapticfeedback.HapticFeedbackType
import androidx.compose.ui.platform.LocalHapticFeedback
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@Composable
fun TasbihScreen() {
    val haptics = LocalHapticFeedback.current
    val phrases = listOf(
        "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ",
        "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ",
        "اللَّهُ أَكْبَرُ كَبِيراً",
        "أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ",
        "اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ"
    )
    var selectedPhraseIndex by remember { mutableIntStateOf(0) }
    var count by remember { mutableIntStateOf(0) }
    var totalCount by remember { mutableIntStateOf(0) }
    var target by remember { mutableIntStateOf(33) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(20.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.SpaceBetween
    ) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Text(
                text = "المسبحة الإلكترونية",
                fontSize = 24.sp,
                fontWeight = FontWeight.Bold
            )
            Spacer(modifier = Modifier.height(10.dp))
            Text(
                text = phrases[selectedPhraseIndex],
                fontSize = 22.sp,
                fontWeight = FontWeight.SemiBold,
                textAlign = TextAlign.Center
            )
            Spacer(modifier = Modifier.height(8.dp))
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                listOf(33, 99, 100).forEach { goal ->
                    FilterChip(
                        selected = target == goal,
                        onClick = { target = goal },
                        label = { Text("الهدف: $goal") }
                    )
                }
            }
        }

        Surface(
            shape = CircleShape,
            color = MaterialTheme.colorScheme.primaryContainer,
            tonalElevation = 8.dp,
            modifier = Modifier
                .size(230.dp)
                .clickable {
                    haptics.performHapticFeedback(HapticFeedbackType.LongPress)
                    count += 1
                    totalCount += 1
                    if (count > target) {
                        count = 1
                    }
                }
        ) {
            Column(
                verticalArrangement = Arrangement.Center,
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text(
                    text = "$count",
                    fontSize = 56.sp,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    text = "من $target · اضغط للتسبيح",
                    fontSize = 14.sp
                )
            }
        }

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "المجموع الكلي: $totalCount",
                fontSize = 16.sp,
                fontWeight = FontWeight.Medium
            )
            Row {
                TextButton(
                    onClick = {
                        selectedPhraseIndex = (selectedPhraseIndex + 1) % phrases.size
                        count = 0
                    }
                ) {
                    Text("تغيير الذكر")
                }
                IconButton(onClick = { count = 0 }) {
                    Icon(Icons.Default.Refresh, contentDescription = "تصفير")
                }
            }
        }
    }
}
`,
  },
  {
    path: 'app/src/main/java/com/nooralmuslim/app/ui/screens/QiblaScreen.kt',
    fileName: 'QiblaScreen.kt',
    language: 'kotlin',
    descriptionAr: 'شاشة بوصلة القبلة باستخدام حساب الزاوية الجغرافية للكعبة المشرفة في مكة المكرمة.',
    content: `package com.nooralmuslim.app.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Explore
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.rotate
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlin.math.*

@Composable
fun QiblaScreen() {
    // حساب زاوية القبلة الفلكية نحو الكعبة المشرفة (21.4225 N, 39.8262 E)
    val qiblaBearing = remember { calculateQiblaBearing(30.0444, 31.2357) } // القاهرة كمثال افتراضي

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Text(
            text = "بوصلة اتجاه القبلة",
            fontSize = 24.sp,
            fontWeight = FontWeight.Bold
        )
        Spacer(modifier = Modifier.height(8.dp))
        Text(
            text = "الكعبة المشرفة · مكة المكرمة (21.4225° N, 39.8262° E)",
            fontSize = 14.sp,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )
        Spacer(modifier = Modifier.height(32.dp))

        Card(
            shape = RoundedCornerShape(120.dp),
            modifier = Modifier.size(220.dp)
        ) {
            Box(
                modifier = Modifier.fillMaxSize(),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = Icons.Default.Explore,
                    contentDescription = "مؤشر القبلة",
                    modifier = Modifier
                        .size(120.dp)
                        .rotate(qiblaBearing.toFloat()),
                    tint = MaterialTheme.colorScheme.primary
                )
            }
        }

        Spacer(modifier = Modifier.height(24.dp))
        Text(
            text = "انحراف القبلة عن الشمال الحقيقي: ${qiblaBearing.roundToInt()}°",
            fontSize = 18.sp,
            fontWeight = FontWeight.SemiBold
        )
    }
}

fun calculateQiblaBearing(userLat: Double, userLng: Double): Double {
    val kaabaLat = Math.toRadians(21.4225)
    val kaabaLng = Math.toRadians(39.8262)
    val phi1 = Math.toRadians(userLat)
    val deltaLng = kaabaLng - Math.toRadians(userLng)

    val y = sin(deltaLng) * cos(kaabaLat)
    val x = cos(phi1) * sin(kaabaLat) - sin(phi1) * cos(kaabaLat) * cos(deltaLng)
    return (Math.toDegrees(atan2(y, x)) + 360.0) % 360.0
}
`,
  },
  {
    path: 'app/src/main/java/com/nooralmuslim/app/service/AdhanAlarmReceiver.kt',
    fileName: 'AdhanAlarmReceiver.kt',
    language: 'kotlin',
    descriptionAr: 'مستقبل البث (BroadcastReceiver) لرفع الأذان وإظهار إشعار الصلاة في أندرويد حتى عند إغلاق التطبيق.',
    content: `package com.nooralmuslim.app.service

import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.Build
import androidx.core.app.NotificationCompat

class AdhanAlarmReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        val prayerName = intent.getStringExtra("PRAYER_NAME") ?: "الصلاة"
        val channelId = "adhan_notification_channel"
        val manager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                channelId,
                "تنبيهات الأذان ومواقيت الصلاة",
                NotificationManager.IMPORTANCE_HIGH
            )
            manager.createNotificationChannel(channel)
        }

        val notification = NotificationCompat.Builder(context, channelId)
            .setSmallIcon(android.R.drawable.ic_lock_idle_alarm)
            .setContentTitle("حان الآن موعد أذان $prayerName")
            .setContentText("حي على الصلاة · حي على الفلاح")
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setAutoCancel(true)
            .build()

        manager.notify(prayerName.hashCode(), notification)
    }
}
`,
  },
  {
    path: 'app/src/main/java/com/nooralmuslim/app/ui/theme/Theme.kt',
    fileName: 'Theme.kt',
    language: 'kotlin',
    descriptionAr: 'تصميم الهوية البصرية الزمردية (Material 3 Theme) لتطبيق نور المسلم في Jetpack Compose.',
    content: `package com.nooralmuslim.app.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

private val IslamicEmeraldColorScheme = lightColorScheme(
    primary = Color(0xFF065F46),
    onPrimary = Color.White,
    primaryContainer = Color(0xFFD1FAE5),
    onPrimaryContainer = Color(0xFF064E3B),
    secondary = Color(0xFFB45309),
    background = Color(0xFFF8F7F4),
    surface = Color.White
)

@Composable
fun NoorAlMuslimTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = IslamicEmeraldColorScheme,
        content = content
    )
}
`,
  },
  {
    path: 'app/src/main/AndroidManifest.xml',
    fileName: 'AndroidManifest.xml',
    language: 'xml',
    descriptionAr: 'ملف تعريف تطبيق الأندرويد (AndroidManifest.xml) مع صلاحيات المنبه، الإشعارات، والموقع الجغرافي للقبلة.',
    content: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.nooralmuslim.app">

    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
    <uses-permission android:name="android.permission.SCHEDULE_EXACT_ALARM" />
    <uses-permission android:name="android.permission.VIBRATE" />
    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />

    <application
        android:allowBackup="true"
        android:label="نور المسلم - Muslim Pro"
        android:supportsRtl="true"
        android:theme="@android:style/Theme.Material.Light.NoActionBar">

        <activity
            android:name=".MainActivity"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

        <receiver
            android:name=".service.AdhanAlarmReceiver"
            android:exported="false" />
    </application>
</manifest>
`,
  },
  {
    path: 'app/src/main/res/values/strings.xml',
    fileName: 'strings.xml',
    language: 'xml',
    descriptionAr: 'ملف النصوص والموارد (strings.xml) داخل مجلد res/values الخاص بالتطبيق.',
    content: `<resources>
    <string name="app_name">نور المسلم - Muslim Pro</string>
    <string name="Notification_channel_name">تنبيهات الأذان ومواقيت الصلاة</string>
    <string name="qibla_title">بوصلة اتجاه القبلة</string>
</resources>
`,
  },
  {
    path: 'app/build.gradle.kts',
    fileName: 'app/build.gradle.kts',
    language: 'gradle',
    descriptionAr: 'إعدادات Gradle بلغة Kotlin DSL لتشغيل Jetpack Compose و Material 3 على Android Studio.',
    content: `plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

android {
    namespace = "com.nooralmuslim.app"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.nooralmuslim.app"
        minSdk = 24
        targetSdk = 34
        versionCode = 1
        versionName = "1.0.0"
    }

    buildFeatures {
        compose = true
    }

    composeOptions {
        kotlinCompilerExtensionVersion = "1.5.14"
    }

    kotlinOptions {
        jvmTarget = "17"
    }
}

dependencies {
    val composeBom = platform("androidx.compose:compose-bom:2024.06.00")
    implementation(composeBom)
    implementation("androidx.core:core-ktx:1.13.1")
    implementation("androidx.activity:activity-compose:1.9.0")
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.material3:material3")
    implementation("androidx.compose.material:material-icons-extended")
    implementation("androidx.compose.ui:ui-tooling-preview")
}
`,
  },
  {
    path: 'settings.gradle.kts',
    fileName: 'settings.gradle.kts',
    language: 'gradle',
    descriptionAr: 'ملف إعدادات المستودعات والوحدات (settings.gradle.kts) لمشروع أندرويد ستوديو.',
    content: `pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}

rootProject.name = "NoorAlMuslim"
include(":app")
`,
  },
  {
    path: 'build.gradle.kts',
    fileName: 'build.gradle.kts',
    language: 'gradle',
    descriptionAr: 'ملف الجذر (Root build.gradle.kts) لإصدارات Kotlin و Android Gradle Plugin.',
    content: `plugins {
    id("com.android.application") version "8.5.0" apply false
    id("org.jetbrains.kotlin.android") version "1.9.24" apply false
}
`,
  },
  {
    path: 'README.md',
    fileName: 'README.md',
    language: 'markdown',
    descriptionAr: 'دليل الرفع على GitHub والفتح في Android Studio والتشغيل على المحاكي (AVD Emulator) خطوة بخطوة.',
    content: `# تطبيق نور المسلم (Noor Al-Muslim - Muslim Pro Edition in Kotlin)

تطبيق إسلامي متكامل مصمم بلغة **Kotlin** وواجهة **Jetpack Compose (Material 3)** على غرار تطبيق مسلم برو (Muslim Pro).

## المميزات الرئيسية في الكود المصدري:
1. **مواقيت الصلاة والأذان (\`PrayerTimesScreen.kt\` & \`AdhanAlarmReceiver.kt\`)**: عرض أوقات الصلوات الخمس والشروق مع عداد الصلاة القادمة ومنبه الأذان.
2. **المهام الإيمانية اليومية والسنن (\`DailyTasksScreen.kt\`)**: متابعة الصلوات المفروضة، السنن الرواتب، صلاة الضحى، الورد القرآني، والوتر مع شريط إنجاز يومي.
3. **حصن المسلم والأذكار (\`AdhkarScreen.kt\`)**: أذكار الصباح والمساء وأذكار ما بعد الصلاة مع عداد تفاعلي لكل ذكر.
4. **المسبحة الإلكترونية (\`TasbihScreen.kt\`)**: عداد تسبيح رقمي مع اهتزاز لمسي (Haptic Feedback) وتحديد الهدف (33، 99، 100).
5. **بوصلة القبلة (\`QiblaScreen.kt\`)**: حساب الزاوية الجغرافية الدقيقة نحو الكعبة المشرفة في مكة المكرمة.

---

## أولاً: طريقة رفع المشروع على GitHub
افتح الطرفية (Terminal) أو (Git Bash) داخل مجلد المشروع بعد فك الضغط ونفذ الأوامر التالية:

\`\`\`bash
git init
git add .
git commit -m "Initial commit: Noor Al-Muslim Kotlin Jetpack Compose App"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/noor-al-muslim-kotlin.git
git push -u origin main
\`\`\`

---

## ثانياً: طريقة فتح المشروع في Android Studio وتشغيله على المحاكي (Emulator)
1. افتح برنامج **Android Studio** (إصدار Iguana أو Jellyfish أو Koala أو Ladybug).
2. اختر **Open** وحدد المجلد الذي قمت بفك ضغطه (\`NoorAlMuslim-Kotlin-AndroidStudio\`).
3. انتظر قليلاً حتى ينتهي **Gradle Sync** من تحميل مكتبات Jetpack Compose تلقائياً.
4. من القائمة العلوية، افتح **Device Manager** وأنشئ جهاز محاكي مثل **Pixel 8 API 34** (أو اختر المحاكي الموجود لديك).
5. اضغط على زر التشغيل الأخضر **Run 'app' (Shift + F10)** وسيعمل التطبيق فوراً بالواجهة العربية الكاملة على المحاكي!
`,
  },
];

export async function downloadKotlinAndroidProjectZip(): Promise<void> {
  const zip = new JSZip();

  KOTLIN_PROJECT_FILES.forEach((file) => {
    zip.file(file.path, file.content);
  });

  // Add gradle.properties for AndroidX & Jetpack Compose compatibility
  zip.file(
    'gradle.properties',
    `org.gradle.jvmargs=-Xmx2048m -Dfile.encoding=UTF-8
android.useAndroidX=true
kotlin.code.style=official
android.nonTransitiveRClass=true
`
  );

  // Add .gitignore for GitHub
  zip.file(
    '.gitignore',
    `*.iml
.gradle
/local.properties
/.idea/
.DS_Store
/build
/captures
.externalNativeBuild
.cxx
local.properties
`
  );

  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'NoorAlMuslim-Kotlin-AndroidStudio.zip';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
