package com.thoth.dreamarchive.wear.theme

import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.wear.compose.material3.ColorScheme
import androidx.wear.compose.material3.MaterialTheme
import androidx.wear.compose.material3.Typography

private val WearColorScheme = ColorScheme(
    primary = Color(0xFF6C63FF),
    onPrimary = Color(0xFFFFFFFF),
    background = Color(0xFF0a0a0f),
    onBackground = Color(0xFFFFFFFF),
    onSurface = Color(0xFFFFFFFF),
)

@Composable
fun WearTheme(
    content: @Composable () -> Unit
) {
    MaterialTheme(
        colorScheme = WearColorScheme,
        typography = Typography(),
        content = content
    )
}
