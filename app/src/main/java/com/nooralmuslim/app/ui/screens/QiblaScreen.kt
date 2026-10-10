package com.nooralmuslim.app.ui.screens

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
import com.nooralmuslim.app.util.PrayerTimeCalculator
import kotlin.math.roundToInt

@Composable
fun QiblaScreen() {
    // استدعاء كلاس الجافا PrayerTimeCalculator لحساب زاوية القبلة والمسافة
    val qiblaBearing = remember { PrayerTimeCalculator.calculateQiblaBearing(30.0444, 31.2357) }
    val distanceKm = remember { PrayerTimeCalculator.calculateDistanceToMakkahKm(30.0444, 31.2357) }

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
            text = "الكعبة المشرفة · مكة المكرمة ($distanceKm كم)",
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
