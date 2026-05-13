package com.thoth.dreamarchive.wear.service

import android.content.Context
import android.media.MediaRecorder
import android.os.Build

/**
 * Handles audio recording via MediaRecorder.
 * Usage: startRecording() → stopRecording() → release()
 * Thread-safe for single-session use.
 */
class AudioRecorderService(private val context: Context) {

    private var recorder: MediaRecorder? = null
    private var outputPath: String? = null

    /**
     * Starts recording. Returns the file path being recorded to.
     * Throws if MediaRecorder fails to prepare (e.g., no mic permission).
     */
    fun startRecording(): String {
        release() // Safety: release any previous instance

        val file = java.io.File(context.cacheDir, "dream_${System.currentTimeMillis()}.aac")
        outputPath = file.absolutePath

        recorder = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            MediaRecorder(context)
        } else {
            @Suppress("DEPRECATION")
            MediaRecorder()
        }

        recorder!!.apply {
            setAudioSource(MediaRecorder.AudioSource.MIC)
            setOutputFormat(MediaRecorder.OutputFormat.AAC_ADTS)
            setAudioEncoder(MediaRecorder.AudioEncoder.AAC)
            setAudioSamplingRate(44100)
            setAudioEncodingBitRate(128000)
            setOutputFile(outputPath)
            prepare()
            start()
        }

        return outputPath!!
    }

    /**
     * Stops recording and returns audio as ByteArray.
     * Returns empty array if nothing was recorded.
     */
    fun stopRecording(): ByteArray {
        return try {
            recorder?.apply {
                stop()
                release()
            }
            recorder = null
            val path = outputPath ?: return byteArrayOf()
            val file = java.io.File(path)
            if (file.exists()) {
                val bytes = file.readBytes()
                file.delete() // Clean up cache
                bytes
            } else {
                byteArrayOf()
            }
        } catch (e: Exception) {
            release()
            byteArrayOf()
        }
    }

    /**
     * Releases recorder resources without stopping — call on ViewModel.onCleared()
     * or when recording is interrupted (e.g., phone call).
     */
    fun release() {
        try {
            recorder?.apply {
                reset()
                release()
            }
        } catch (_: Exception) {}
        recorder = null
    }
}
