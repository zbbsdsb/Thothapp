package com.thoth.dreamarchive.wear

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.runtime.Composable
import androidx.wear.compose.navigation.SwipeDismissableNavHost
import androidx.wear.compose.navigation.composable
import androidx.wear.compose.navigation.rememberSwipeDismissableNavController
import com.thoth.dreamarchive.wear.ui.recording.RecordingScreen
import com.thoth.dreamarchive.wear.ui.dreams.DreamListScreen
import com.thoth.dreamarchive.wear.theme.WearTheme

class MainWearActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            WearApp()
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
