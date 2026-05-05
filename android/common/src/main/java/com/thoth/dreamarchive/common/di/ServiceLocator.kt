package com.thoth.dreamarchive.common.di

import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.storage.FirebaseStorage
import com.thoth.dreamarchive.common.data.FirebaseRepository

object ServiceLocator {
    val auth: FirebaseAuth by lazy { FirebaseAuth.getInstance() }
    val firestore: FirebaseFirestore by lazy { FirebaseFirestore.getInstance() }
    val storage: FirebaseStorage by lazy { FirebaseStorage.getInstance() }
    val repository: FirebaseRepository by lazy { FirebaseRepository(auth, firestore, storage) }
}
