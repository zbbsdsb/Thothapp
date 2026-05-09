# Add project specific ProGuard rules here.
# You can control the set of applied configuration files using the
# proguardFiles setting in build.gradle.

# ==================== Firebase ====================
-keep class com.google.firebase.** { *; }
-keep class com.google.android.gms.** { *; }
-keepattributes Signature, InnerClasses, EnclosingMethod
-keepannotations com.google.firebase.** | com.google.android.gms.common.annotation.** | com.google.android.gms.**

# Firebase BoM - keep version info
-keep class com.google.firebase.auth.** { *; }
-keep class com.google.firebase.storage.** { *; }
-keep class com.google.firebase.analytics.** { *; }

# ==================== Capacitor ====================
-keep class com.getcapacitor.** { *; }
-keep interface com.getcapacitor.** { *; }

# ==================== WebView ====================
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# ==================== Gson (if used) ====================
-keepattributes Signature
-keepattributes *Annotation*
-dontwarn sun.misc.**
-keep class com.google.gson.** { *; }

# ==================== OkHttp (Firebase networking) ====================
-dontwarn okhttp3.**
-dontwarn okio.**
-keep class okhttp3.** { *; }
-keep interface okhttp3.** { *; }

# ==================== Crashlytics (if added later) ====================
-keepattributes *Annotation*

# ==================== General ====================
# Preserve line numbers for debugging
-keepattributes SourceFile,LineNumberTable
-renamesourcefileattribute SourceFile
