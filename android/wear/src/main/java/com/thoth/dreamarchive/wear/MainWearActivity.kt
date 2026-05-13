package com.thoth.dreamarchive.wear

import android.Manifest
import android.content.pm.PackageManager
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.content.ContextCompat
import androidx.wear.compose.material3.Button
import androidx.wear.compose.material3.ButtonDefaults
import androidx.wear.compose.material3.MaterialTheme
import androidx.wear.compose.material3.Text
import androidx.wear.compose.navigation.SwipeDismissableNavHost
import androidx.wear.compose.navigation.composable
import androidx.wear.compose.navigation.rememberSwipeDismissableNavController
import com.thoth.dreamarchive.wear.theme.WearTheme
import com.thoth.dreamarchive.wear.ui.dreams.DreamListScreen
import com.thoth.dreamarchive.wear.ui.recording.RecordingScreen

class MainWearActivity : ComponentActivity() {

    private var micPermissionGranted by mutableStateOf(false)

    private val requestMicPermission =
        registerForActivityResult(ActivityResultContracts.RequestPermission()) { granted ->
            micPermissionGranted = granted
        }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Check mic permission immediately
        micPermissionGranted = ContextCompat.checkSelfPermission(
            this, Manifest.permission.RECORD_AUDIO
        ) == PackageManager.PERMISSION_GRANTED

        // Request if not granted
        if (!micPermissionGranted) {
            requestMicPermission.launch(Manifest.permission.RECORD_AUDIO)
        }

        setContent {
            if (micPermissionGranted) {
                WearApp()
            } else {
                PermissionScreen(
                    onRequest = { requestMicPermission.launch(Manifest.permission.RECORD_AUDIO) }
                )
            }
        }
    }
}

@Composable
fun WearApp() {
    WearTheme {
        val navController = rememberSwipeDismissableNavController()

        SwipeDismissableNavHost(
            navController = navController,
            startDestination = "recording"
        ) {
            composable("recording") {
                RecordingScreen(
                    onViewDreams = { navController.navigate("dreams") }
                )
            }
            composable("dreams") {
                DreamListScreen(
                    onBack = { navController.popBackStack() }
                )
            }
        }
    }
}

@Composable
private fun PermissionScreen(onRequest: () -> Unit) {
    WearTheme {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(MaterialTheme.colorScheme.background),
            contentAlignment = Alignment.Center
        ) {
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                modifier = Modifier.padding(12.dp)
            ) {
                Text(
                    text = "🎙",
                    fontSize = 28.sp
                )
                Spacer(Modifier.height(6.dp))
                Text(
                    text = "Mic access needed",
                    fontSize = 13.sp,
                    textAlign = TextAlign.Center,
                    color = MaterialTheme.colorScheme.onBackground
                )
                Spacer(Modifier.height(10.dp))
                Button(
                    onClick = onRequest,
                    colors = ButtonDefaults.buttonColors(
                        containerColor = Color(0xFF6C63FF)
                    )
                ) {
                    Text("Allow", fontSize = 12.sp, color = Color.White)
                }
            }
        }
    }
}
