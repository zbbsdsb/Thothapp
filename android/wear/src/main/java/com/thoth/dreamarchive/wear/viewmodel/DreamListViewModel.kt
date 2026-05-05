package com.thoth.dreamarchive.wear.viewmodel

import androidx.lifecycle.ViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

data class DreamListUiState(
    val dreams: List<Any> = emptyList(), // TODO: Use Dream type from common/
    val isLoading: Boolean = false
)

class DreamListViewModel : ViewModel() {
    private val _uiState = MutableStateFlow(DreamListUiState())
    val uiState: StateFlow<DreamListUiState> = _uiState.asStateFlow()

    fun loadDreams() {
        _uiState.value = _uiState.value.copy(isLoading = true)
        // TODO: Load from FirebaseRepository
        _uiState.value = _uiState.value.copy(isLoading = false)
    }
}
