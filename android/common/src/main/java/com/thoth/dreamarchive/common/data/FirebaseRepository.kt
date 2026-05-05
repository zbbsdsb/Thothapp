package com.thoth.dreamarchive.common.data

import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.storage.FirebaseStorage
import com.google.firebase.storage.StorageReference
import com.thoth.dreamarchive.common.model.Dream
import com.thoth.dreamarchive.common.model.DreamCreateRequest
import kotlinx.coroutines.tasks.await
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import java.util.UUID

class FirebaseRepository(
    private val auth: FirebaseAuth = FirebaseAuth.getInstance(),
    private val firestore: FirebaseFirestore = FirebaseFirestore.getInstance(),
    private val storage: FirebaseStorage = FirebaseStorage.getInstance()
) {
    private val dreamsCollection = firestore.collection("dreams")

    suspend fun signInAnonymously(): Result<String> {
        return try {
            val result = auth.signInAnonymously().await()
            Result.success(result.user?.uid ?: "")
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    fun getCurrentUserId(): String? = auth.currentUser?.uid

    suspend fun createDream(request: DreamCreateRequest): Result<String> {
        return try {
            val dreamId = UUID.randomUUID().toString()
            val dream = Dream(
                id = dreamId,
                userId = request.userId,
                transcript = request.transcript,
                audioUrl = request.audioUrl,
                duration = request.duration,
                tags = request.tags,
                insight = request.insight,
                sentiment = request.sentiment,
                country = request.country,
                isPublic = request.isPublic
            )
            dreamsCollection.document(dreamId).set(dream).await()
            Result.success(dreamId)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    fun getDreams(userId: String): Flow<List<Dream>> = flow {
        try {
            val snapshot = dreamsCollection
                .whereEqualTo("userId", userId)
                .orderBy("createdAt")
                .get()
                .await()
            val dreams = snapshot.toObjects(Dream::class.java)
            emit(dreams)
        } catch (e: Exception) {
            emit(emptyList())
        }
    }

    suspend fun uploadAudio(audioBytes: ByteArray, filename: String): Result<String> {
        return try {
            val ref: StorageReference = storage.reference.child("audio/$filename")
            ref.putBytes(audioBytes).await()
            val url = ref.downloadUrl.await().toString()
            Result.success(url)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun deleteDream(dreamId: String): Result<Unit> {
        return try {
            dreamsCollection.document(dreamId).delete().await()
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
