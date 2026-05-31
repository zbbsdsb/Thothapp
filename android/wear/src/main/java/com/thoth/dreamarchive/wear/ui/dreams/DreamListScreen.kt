package com.thoth.dreamarchive.wear.ui.dreams

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.wear.compose.foundation.lazy.ScalingLazyColumn
import androidx.wear.compose.foundation.lazy.items
import androidx.wear.compose.material3.Button
import androidx.wear.compose.material3.ButtonDefaults
import androidx.wear.compose.material3.CircularProgressIndicator
import androidx.wear.compose.material3.MaterialTheme
import androidx.wear.compose.material3.Text
import com.thoth.dreamarchive.common.model.Dream
import com.thoth.dreamarchive.wear.theme.WearTheme
import com.thoth.dreamarchive.wear.viewmodel.DreamListState
import com.thoth.dreamarchive.wear.viewmodel.DreamListViewModel
import java.text.SimpleDateFormat
import java.util.Locale

@Composable
fun DreamListScreen(
    onBack: () -> Unit,
    viewModel: DreamListViewModel = viewModel()
) {
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()

    WearTheme {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(MaterialTheme.colorScheme.background),
            contentAlignment = Alignment.Center
        ) {
            when (val state = uiState.state) {
                is DreamListState.Loading -> {
                    CircularProgressIndicator(
                        progress = { 0f },
                        modifier = Modifier.size(40.dp)
                    )
                }

                is DreamListState.Error -> {
                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally,
                        modifier = Modifier.padding(12.dp)
                    ) {
                        Text(
                            text = "✕",
                            fontSize = 28.sp,
                            color = Color(0xFFFF5252)
                        )
                        Spacer(Modifier.height(6.dp))
                        Text(
                            text = state.message.take(50),
                            fontSize = 11.sp,
                            color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.6f),
                            textAlign = TextAlign.Center
                        )
                        Spacer(Modifier.height(10.dp))
                        Button(
                            onClick = { viewModel.loadDreams() },
                            modifier = Modifier.height(32.dp),
                            colors = ButtonDefaults.buttonColors(
                                containerColor = Color(0xFF6C63FF)
                            )
                        ) {
                            Text("Retry", fontSize = 11.sp, color = Color.White)
                        }
                    }
                }

                is DreamListState.Success -> {
                    val dreams = state.dreams
                    if (dreams.isEmpty()) {
                        EmptyState()
                    } else {
                        DreamList(dreams = dreams, onBack = onBack)
                    }
                }
            }
        }
    }
}

// ── Empty state ───────────────────────────────────────────────────────────────

@Composable
private fun EmptyState() {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        modifier = Modifier.padding(12.dp)
    ) {
        Text(text = "🌙", fontSize = 28.sp)
        Spacer(Modifier.height(6.dp))
        Text(
            text = "No dreams yet",
            fontSize = 13.sp,
            color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.7f),
            textAlign = TextAlign.Center
        )
    }
}

// ── Dream list ────────────────────────────────────────────────────────────────

@Composable
private fun DreamList(dreams: List<Dream>, onBack: () -> Unit) {
    ScalingLazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(
            start = 8.dp, end = 8.dp,
            top = 32.dp, bottom = 24.dp
        ),
        verticalArrangement = Arrangement.spacedBy(6.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        // Header row
        item {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(bottom = 4.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Dreams (${dreams.size})",
                    fontSize = 13.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = MaterialTheme.colorScheme.onBackground
                )
                // Back button (small)
                Button(
                    onClick = onBack,
                    modifier = Modifier.size(28.dp),
                    shape = CircleShape,
                    colors = ButtonDefaults.buttonColors(
                        containerColor = Color(0xFF2A2A3A)
                    ),
                    contentPadding = PaddingValues(0.dp)
                ) {
                    Text("←", fontSize = 12.sp, color = Color.White)
                }
            }
        }

        // Dream cards
        items(dreams) { dream ->
            DreamCard(dream = dream)
        }
    }
}

// ── Dream card ────────────────────────────────────────────────────────────────

@Composable
private fun DreamCard(dream: Dream) {
    val dateStr = dream.createdAt?.let {
        SimpleDateFormat("MM/dd HH:mm", Locale.getDefault()).format(it)
    } ?: "—"

    val durationStr = formatDuration(dream.duration)

    val preview = when {
        dream.transcript.isNotBlank() -> dream.transcript.take(80)
        dream.tags.isNotEmpty() -> dream.tags.take(3).joinToString(" · ")
        else -> "No transcript yet"
    }

    Box(
        modifier = Modifier
            .fillMaxWidth()
            .background(
                color = Color(0xFF1A1A2E),
                shape = androidx.compose.foundation.shape.RoundedCornerShape(12.dp)
            )
            .padding(horizontal = 10.dp, vertical = 8.dp)
    ) {
        Column {
            // Date + duration row
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = dateStr,
                    fontSize = 10.sp,
                    color = Color(0xFF6C63FF),
                    fontWeight = FontWeight.Medium
                )
                Text(
                    text = durationStr,
                    fontSize = 10.sp,
                    color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.5f)
                )
            }

            Spacer(Modifier.height(4.dp))

            // Transcript preview
            Text(
                text = preview,
                fontSize = 11.sp,
                color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.85f),
                maxLines = 3,
                overflow = TextOverflow.Ellipsis,
                lineHeight = 15.sp
            )

            // Tags (if any)
            if (dream.tags.isNotEmpty()) {
                Spacer(Modifier.height(4.dp))
                Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                    dream.tags.take(3).forEach { tag ->
                        TagChip(tag = tag)
                    }
                }
            }
        }
    }
}

@Composable
private fun TagChip(tag: String) {
    Box(
        modifier = Modifier
            .background(
                color = Color(0xFF6C63FF).copy(alpha = 0.2f),
                shape = CircleShape
            )
            .padding(horizontal = 6.dp, vertical = 2.dp)
    ) {
        Text(
            text = tag,
            fontSize = 9.sp,
            color = Color(0xFF6C63FF)
        )
    }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

private fun formatDuration(seconds: Long): String {
    if (seconds <= 0L) return ""
    val m = seconds / 60
    val s = seconds % 60
    return if (m > 0) "${m}m ${s}s" else "${s}s"
}
