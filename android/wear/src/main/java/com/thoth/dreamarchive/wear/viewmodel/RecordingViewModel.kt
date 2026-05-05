package com.thoth.dreamarchive.wear.viewmodel

import androidx.lifecycle.ViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

data class RecordingUiState(
    val isRecording: Boolean = false,
    val elapsedTimeMs: Long = 0L,
    val transcription: String? = null,
    val isUploading: Boolean = false,
    val uploadSuccess: Boolean? = null
)

class RecordingViewModel : ViewModel() {
    private val _uiState = MutableStateFlow(RecordingUiState())
    val uiState: StateFlow<RecordingUiState> = _uiState.asStateFlow()

    fun startRecording() {
        _uiState.value = RecordingUiState(isRecording = true)
    }

    fun stopRecording() {
        _uiState.value = _uiState.value.copy(isRecording = false)
    }

    fun updateElapsedTime(ms: Long) {
        _uiState.value = _uiState.value.copy(elapsedTimeMs = ms)
    }
}
