package com.thoth.dreamarchive.wear.viewmodel

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.thoth.dreamarchive.common.di.ServiceLocator
import com.thoth.dreamarchive.common.model.Dream
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

sealed class DreamListState {
    object Loading : DreamListState()
    data class Success(val dreams: List<Dream>) : DreamListState()
    data class Error(val message: String) : DreamListState()
}

data class DreamListUiState(
    val state: DreamListState = DreamListState.Loading
)

class DreamListViewModel(application: Application) : AndroidViewModel(application) {

    private val _uiState = MutableStateFlow(DreamListUiState())
    val uiState: StateFlow<DreamListUiState> = _uiState.asStateFlow()

    private val repository = ServiceLocator.firebaseRepository

    init {
        loadDreams()
    }

    fun loadDreams() {
        val userId = repository.getCurrentUserId()
        if (userId == null) {
            // Attempt anonymous sign-in then load
            viewModelScope.launch {
                val result = repository.signInAnonymously()
                if (result.isSuccess) {
                    fetchDreams(result.getOrDefault(""))
                } else {
                    _uiState.value = DreamListUiState(
                        state = DreamListState.Error("Not signed in")
                    )
                }
            }
            return
        }
        fetchDreams(userId)
    }

    private fun fetchDreams(userId: String) {
        viewModelScope.launch {
            _uiState.value = DreamListUiState(state = DreamListState.Loading)
            try {
                repository.getDreams(userId).collect { dreams ->
                    // getDreams is ordered by createdAt ascending — reverse for newest-first
                    _uiState.value = DreamListUiState(
                        state = DreamListState.Success(dreams.sortedByDescending { it.createdAt })
                    )
                }
            } catch (e: Exception) {
                _uiState.value = DreamListUiState(
                    state = DreamListState.Error(e.message ?: "Failed to load dreams")
                )
            }
        }
    }
}
