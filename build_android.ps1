$env:JAVA_HOME = "C:\Program Files\Java\jdk-17"
$env:Path = "C:\Program Files\Java\jdk-17\bin;" + $env:Path
$env:ANDROID_SDK_ROOT = "$env:LOCALAPPDATA\Android\Sdk"
$env:GRADLE_OPTS = "-Dorg.gradle.daemon=false -Dorg.gradle.internal.http.socketTimeout=300000 -Dorg.gradle.internal.http.connectionTimeout=300000"
$ErrorActionPreference = "Continue"
$output = & "e:\ceaserzhao\github projects\Thothapp\android\gradlew.bat" "-p" "e:\ceaserzhao\github projects\Thothapp\android" "assembleDebug" "--no-daemon" "--info" 2>&1
$output | Out-File -FilePath "e:\ceaserzhao\github projects\Thothapp\android\build_log.txt" -Encoding UTF8
exit $LASTEXITCODE
