package com.nooralmuslim.app

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
