package com.thoth.dreamarchive.wear.ui.dreams

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.wear.compose.material3.MaterialTheme
import androidx.wear.compose.material3.Text
import com.thoth.dreamarchive.wear.theme.WearTheme

@Composable
fun DreamListScreen(
    onBack: () -> Unit
) {
    WearTheme {
        Box(
            modifier = Modifier.fillMaxSize(),
            contentAlignment = Alignment.Center
        ) {
            Text(
                text = "Recent Dreams (TODO)",
                color = MaterialTheme.colorScheme.onBackground
            )
        }
    }
}
