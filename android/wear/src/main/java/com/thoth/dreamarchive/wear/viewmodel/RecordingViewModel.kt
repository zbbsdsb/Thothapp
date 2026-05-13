package com.thoth.dreamarchive.wear.viewmodel

import android.app.Application
import android.os.CountDownTimer
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.thoth.dreamarchive.common.data.FirebaseRepository
import com.thoth.dreamarchive.common.di.ServiceLocator
import com.thoth.dreamarchive.common.model.DreamCreateRequest
import com.thoth.dreamarchive.wear.service.AudioRecorderService
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

sealed class RecordingState {
    object Idle : RecordingState()
    object Recording : RecordingState()
    object Uploading : RecordingState()
    data class Success(val dreamId: String) : RecordingState()
    data class Error(val message: String) : RecordingState()
}

data class RecordingUiState(
    val state: RecordingState = RecordingState.Idle,
    val elapsedSeconds: Int = 0,
)

class RecordingViewModel(application: Application) : AndroidViewModel(application) {

    private val _uiState = MutableStateFlow(RecordingUiState())
    val uiState: StateFlow<RecordingUiState> = _uiState.asStateFlow()

    private val audioService = AudioRecorderService(application)
    private val repository: FirebaseRepository = ServiceLocator.firebaseRepository

    private var timer: CountDownTimer? = null

    // Max recording: 5 minutes
    private val maxRecordingMs = 5 * 60 * 1000L

    fun toggleRecording() {
        when (_uiState.value.state) {
            is RecordingState.Idle, is RecordingState.Error -> startRecording()
            is RecordingState.Recording -> stopAndUpload()
            else -> Unit // Uploading — ignore taps
        }
    }

    private fun startRecording() {
        try {
            audioService.startRecording()
            _uiState.value = RecordingUiState(state = RecordingState.Recording, elapsedSeconds = 0)

            timer = object : CountDownTimer(maxRecordingMs, 1000L) {
                override fun onTick(millisUntilFinished: Long) {
                    val elapsed = ((maxRecordingMs - millisUntilFinished) / 1000).toInt()
                    _uiState.value = _uiState.value.copy(elapsedSeconds = elapsed)
                }
                override fun onFinish() {
                    // Auto-stop at max length
                    stopAndUpload()
                }
            }.start()
        } catch (e: Exception) {
            _uiState.value = RecordingUiState(state = RecordingState.Error("Failed to start: ${e.message}"))
        }
    }

    fun stopAndUpload() {
        timer?.cancel()
        timer = null

        val elapsedSeconds = _uiState.value.elapsedSeconds
        _uiState.value = _uiState.value.copy(state = RecordingState.Uploading)

        viewModelScope.launch {
            try {
                // 1. Ensure user is signed in (anonymous if not)
                ensureSignedIn()
                val userId = repository.getCurrentUserId()
                    ?: throw Exception("Not signed in")

                // 2. Stop recorder and get audio bytes
                val audioBytes = audioService.stopRecording()
                if (audioBytes.isEmpty()) {
                    throw Exception("No audio recorded")
                }

                // 3. Upload audio to Firebase Storage
                val filename = "wear_dream_${System.currentTimeMillis()}.aac"
                val audioUrlResult = repository.uploadAudio(audioBytes, filename)
                val audioUrl = audioUrlResult.getOrNull()

                // 4. Save dream metadata to Firestore
                val dreamRequest = DreamCreateRequest(
                    userId = userId,
                    transcript = "",             // No transcription on watch — filled in later by phone
                    audioUrl = audioUrl,
                    duration = elapsedSeconds.toLong(),
                    tags = listOf("wear-recorded"),
                    insight = null,
                    sentiment = null,
                    country = null,
                    isPublic = false
                )
                val result = repository.createDream(dreamRequest)

                if (result.isSuccess) {
                    _uiState.value = RecordingUiState(
                        state = RecordingState.Success(result.getOrDefault(""))
                    )
                } else {
                    throw result.exceptionOrNull() ?: Exception("Upload failed")
                }
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    state = RecordingState.Error(e.message ?: "Unknown error")
                )
            }
        }
    }

    fun resetToIdle() {
        _uiState.value = RecordingUiState()
    }

    private suspend fun ensureSignedIn() {
        if (repository.getCurrentUserId() == null) {
            val result = repository.signInAnonymously()
            if (result.isFailure) {
                throw result.exceptionOrNull() ?: Exception("Sign-in failed")
            }
        }
    }

    override fun onCleared() {
        super.onCleared()
        timer?.cancel()
        audioService.release()
    }
}
