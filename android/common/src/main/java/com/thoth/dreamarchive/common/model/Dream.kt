package com.thoth.dreamarchive.common.model

import com.google.firebase.firestore.PropertyName
import com.google.firebase.firestore.ServerTimestamp
import java.util.Date

data class Dream(
    val id: String = "",
    val userId: String = "",
    val transcript: String = "",
    val audioUrl: String? = null,
    val duration: Long = 0L,
    val tags: List<String> = emptyList(),
    val insight: String? = null,
    val sentiment: String? = null,
    val country: String? = null,
    @ServerTimestamp
    val createdAt: Date? = null,
    val isPublic: Boolean = false
)

data class DreamCreateRequest(
    val userId: String,
    val transcript: String,
    val audioUrl: String? = null,
    val duration: Long,
    val tags: List<String>,
    val insight: String? = null,
    val sentiment: String? = null,
    val country: String? = null,
    val isPublic: Boolean = false
)
