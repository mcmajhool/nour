package com.nooralmuslim.app.ui.screens

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
