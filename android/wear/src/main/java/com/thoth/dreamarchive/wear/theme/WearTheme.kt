package com.thoth.dreamarchive.wear.theme

import androidx.compose.runtime.Composable
import androidx.wear.compose.material3.MaterialTheme
import androidx.wear.compose.material3.Typography
import androidx.wear.compose.material3.ColorScheme

private val WearColorScheme = ColorScheme(
    primary = /* primary */ 0xFF6C63FF,
    onPrimary = /* onPrimary */ 0xFFFFFFFF,
    background = /* background */ 0xFF0a0a0f,
    onBackground = /* onBackground */ 0xFFFFFFFF,
    surface = /* surface */ 0xFF1a1a2e,
    onSurface = /* onSurface */ 0xFFFFFFFF,
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
