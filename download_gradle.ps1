$ErrorActionPreference = "Stop"
$url = "https://services.gradle.org/distributions/gradle-8.14.3-all.zip"
$targetDir = "C:\Users\Name\.gradle\wrapper\dists\gradle-8.14.3-all\10utluxaxniiv4wxiphsi49nj"
$targetFile = Join-Path $targetDir "gradle-8.14.3-all.zip"

# Remove stale files
if (Test-Path (Join-Path $targetDir "gradle-8.14.3-all.zip.lck")) {
    Remove-Item (Join-Path $targetDir "gradle-8.14.3-all.zip.lck") -Force
}
if (Test-Path (Join-Path $targetDir "gradle-8.14.3-all.zip.part")) {
    Remove-Item (Join-Path $targetDir "gradle-8.14.3-all.zip.part") -Force
}

# Download with longer timeout
Write-Host "Downloading Gradle 8.14.3 (this may take a few minutes)..."
$webClient = New-Object System.Net.WebClient
$webClient.Timeout = 600000  # 10 minutes
$webClient.DownloadFile($url, $targetFile)

# Create .ok marker
"" | Out-File -FilePath (Join-Path $targetDir "gradle-8.14.3-all.zip.ok") -Encoding ASCII

# Verify
$size = (Get-Item $targetFile).Length / 1MB
Write-Host "Download complete. Size: $([math]::Round($size, 1)) MB"
