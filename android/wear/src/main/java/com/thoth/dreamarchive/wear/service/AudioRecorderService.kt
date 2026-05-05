package com.thoth.dreamarchive.wear.service

import android.content.Context
import android.media.MediaRecorder
import java.io.File

class AudioRecorderService(private val context: Context) {
    private var recorder: MediaRecorder? = null
    private var outputFile: File? = null

    fun startRecording(): String {
        outputFile = File(context.cacheDir, "dream_recording_${System.currentTimeMillis()}.aac")
        recorder = MediaRecorder().apply {
            setAudioSource(MediaRecorder.AudioSource.MIC)
            setOutputFormat(MediaRecorder.OutputFormat.AAC_ADTS)
            setAudioEncoder(MediaRecorder.AudioEncoder.AAC)
            setOutputFile(outputFile!!.absolutePath)
            prepare()
            start()
        }
        return outputFile!!.absolutePath
    }

    fun stopRecording(): ByteArray {
        recorder?.apply {
            stop()
            release()
        }
        recorder = null
        return outputFile?.readBytes() ?: byteArrayOf()
    }

    fun release() {
        recorder?.release()
        recorder = null
    }
}
