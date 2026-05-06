@echo off
set JAVA_HOME=C:\Program Files\Java\jdk-17
cd /d e:\ceaserzhao\github projects\Thothapp\android
call gradlew.bat :wear:assembleDebug --no-daemon > build_output.txt 2>&1
echo Exit code: %ERRORLEVEL% >> build_output.txt
