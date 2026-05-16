package com.thoth.dreamarchive.wear.ui.recording

import android.content.Context
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import android.os.Build
import androidx.compose.animation.animateColorAsState
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.wear.compose.material3.Button
import androidx.wear.compose.material3.ButtonDefaults
import androidx.wear.compose.material3.CircularProgressIndicator
import androidx.wear.compose.material3.MaterialTheme
import androidx.wear.compose.material3.Text
import com.thoth.dreamarchive.wear.theme.WearTheme
import com.thoth.dreamarchive.wear.viewmodel.RecordingState
import com.thoth.dreamarchive.wear.viewmodel.RecordingViewModel

@Composable
fun RecordingScreen(
    onViewDreams: () -> Unit,
    viewModel: RecordingViewModel = viewModel()
) {
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()
    val context = LocalContext.current

    WearTheme {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(MaterialTheme.colorScheme.background),
            contentAlignment = Alignment.Center
        ) {
            when (val state = uiState.state) {
                is RecordingState.Idle -> IdleContent(
                    onRecord = {
                        haptic(context, HapticType.Start)
                        viewModel.toggleRecording()
                    }
                )

                is RecordingState.Recording -> RecordingContent(
                    elapsedSeconds = uiState.elapsedSeconds,
                    onStop = {
                        haptic(context, HapticType.Stop)
                        viewModel.stopAndUpload()
                    }
                )

                is RecordingState.Uploading -> UploadingContent()

                is RecordingState.Success -> SuccessContent(
                    onViewDreams = onViewDreams,
                    onNewRecording = {
                        haptic(context, HapticType.Start)
                        viewModel.resetToIdle()
                    }
                )

                is RecordingState.Error -> ErrorContent(
                    message = state.message,
                    onRetry = {
                        haptic(context, HapticType.Start)
                        viewModel.resetToIdle()
                    }
                )
            }
        }
    }
}

// ── Idle ──────────────────────────────────────────────────────────────────────

@Composable
private fun IdleContent(onRecord: () -> Unit) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center,
        modifier = Modifier.padding(8.dp)
    ) {
        // Large record button — fills most of the round screen
        Button(
            onClick = onRecord,
            modifier = Modifier.size(96.dp),
            shape = CircleShape,
            colors = ButtonDefaults.buttonColors(
                containerColor = Color(0xFF6C63FF)
            )
        ) {
            Text(
                text = "●",
                fontSize = 40.sp,
                color = Color.White
            )
        }

        Spacer(modifier = Modifier.height(10.dp))

        Text(
            text = "Tap to Record",
            fontSize = 13.sp,
            color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.8f),
            textAlign = TextAlign.Center
        )
    }
}

// ── Recording ─────────────────────────────────────────────────────────────────

@Composable
private fun RecordingContent(elapsedSeconds: Int, onStop: () -> Unit) {
    // Pulsing animation on the recording indicator
    val infiniteTransition = rememberInfiniteTransition(label = "pulse")
    val scale by infiniteTransition.animateFloat(
        initialValue = 1f,
        targetValue = 1.15f,
        animationSpec = infiniteRepeatable(
            animation = tween(600),
            repeatMode = RepeatMode.Reverse
        ),
        label = "pulseScale"
    )

    val buttonColor by animateColorAsState(
        targetValue = Color(0xFFFF4444),
        label = "recColor"
    )

    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center,
        modifier = Modifier.padding(8.dp)
    ) {
        // Timer display
        Text(
            text = formatTime(elapsedSeconds),
            fontSize = 18.sp,
            fontWeight = FontWeight.Bold,
            color = Color(0xFFFF4444)
        )

        Spacer(modifier = Modifier.height(6.dp))

        // Pulsing stop button
        Button(
            onClick = onStop,
            modifier = Modifier
                .size(96.dp)
                .scale(scale),
            shape = CircleShape,
            colors = ButtonDefaults.buttonColors(
                containerColor = buttonColor
            )
        ) {
            Text(
                text = "■",
                fontSize = 36.sp,
                color = Color.White
            )
        }

        Spacer(modifier = Modifier.height(10.dp))

        Text(
            text = "Recording…",
            fontSize = 12.sp,
            color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.7f)
        )
    }
}

// ── Uploading ─────────────────────────────────────────────────────────────────

@Composable
private fun UploadingContent() {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center,
        modifier = Modifier.padding(8.dp)
    ) {
        CircularProgressIndicator(
            progress = { 0f },
            modifier = Modifier.size(48.dp)
        )

        Spacer(modifier = Modifier.height(12.dp))

        Text(
            text = "Saving dream…",
            fontSize = 13.sp,
            color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.8f)
        )
    }
}

// ── Success ───────────────────────────────────────────────────────────────────

@Composable
private fun SuccessContent(onViewDreams: () -> Unit, onNewRecording: () -> Unit) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center,
        modifier = Modifier.padding(8.dp)
    ) {
        Text(
            text = "✓",
            fontSize = 40.sp,
            color = Color(0xFF4CAF50)
        )

        Spacer(modifier = Modifier.height(6.dp))

        Text(
            text = "Dream saved!",
            fontSize = 14.sp,
            fontWeight = FontWeight.SemiBold,
            color = MaterialTheme.colorScheme.onBackground
        )

        Spacer(modifier = Modifier.height(12.dp))

        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            // Record another
            Button(
                onClick = onNewRecording,
                modifier = Modifier.size(44.dp),
                shape = CircleShape,
                colors = ButtonDefaults.buttonColors(
                    containerColor = Color(0xFF6C63FF)
                )
            ) {
                Text(text = "●", fontSize = 18.sp, color = Color.White)
            }

            // View dreams list
            Button(
                onClick = onViewDreams,
                modifier = Modifier.size(44.dp),
                shape = CircleShape,
                colors = ButtonDefaults.buttonColors(
                    containerColor = Color(0xFF2A2A3A)
                )
            ) {
                Text(text = "≡", fontSize = 18.sp, color = Color.White)
            }
        }
    }
}

// ── Error ─────────────────────────────────────────────────────────────────────

@Composable
private fun ErrorContent(message: String, onRetry: () -> Unit) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center,
        modifier = Modifier.padding(12.dp)
    ) {
        Text(
            text = "✕",
            fontSize = 32.sp,
            color = Color(0xFFFF5252)
        )

        Spacer(modifier = Modifier.height(4.dp))

        Text(
            text = message.take(60),
            fontSize = 11.sp,
            color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.6f),
            textAlign = TextAlign.Center,
            lineHeight = 14.sp
        )

        Spacer(modifier = Modifier.height(10.dp))

        Button(
            onClick = onRetry,
            modifier = Modifier
                .fillMaxWidth(0.6f)
                .height(36.dp),
            colors = ButtonDefaults.buttonColors(
                containerColor = Color(0xFF6C63FF)
            )
        ) {
            Text(text = "Try Again", fontSize = 12.sp, color = Color.White)
        }
    }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

private fun formatTime(totalSeconds: Int): String {
    val m = totalSeconds / 60
    val s = totalSeconds % 60
    return "%02d:%02d".format(m, s)
}

private enum class HapticType { Start, Stop }

private fun haptic(context: Context, type: HapticType) {
    val effect = when (type) {
        HapticType.Start -> VibrationEffect.createOneShot(80, VibrationEffect.DEFAULT_AMPLITUDE)
        HapticType.Stop -> VibrationEffect.createWaveform(longArrayOf(0, 60, 60, 60), -1)
    }
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
        val vm = context.getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as? VibratorManager
        vm?.defaultVibrator?.vibrate(effect)
    } else {
        @Suppress("DEPRECATION")
        val v = context.getSystemService(Context.VIBRATOR_SERVICE) as? Vibrator
        v?.vibrate(effect)
    }
}
