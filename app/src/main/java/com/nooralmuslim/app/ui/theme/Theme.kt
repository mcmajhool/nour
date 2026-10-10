package com.nooralmuslim.app.ui.theme

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
