# --- CONFIGURATION ---
$SourcePath = "C:\Users\Trinity\Desktop\accra-academy-website"
$BackupPath = "E:\MyBackups\AccraAcademy"

Write-Host "[STARTING BACKUP]" -ForegroundColor Cyan

# --- STEP 1: GIT ---
Write-Host "1. Pushing to GitHub..." -ForegroundColor Yellow
if (Test-Path "$SourcePath\.git") {
    Set-Location $SourcePath
    git add .
    git commit -m "Auto-backup"
    git push origin main
} else {
    Write-Host "Git folder not found." -ForegroundColor Red
}

# --- STEP 2: HARD DRIVE ---
Write-Host "2. Mirroring to Hard Drive..." -ForegroundColor Yellow

if (!(Test-Path $BackupPath)) {
    New-Item -ItemType Directory -Force -Path $BackupPath | Out-Null
}

# Run Robocopy (Mirror Mode)
robocopy $SourcePath $BackupPath /MIR /XO /FFT /R:1 /W:1 /XD node_modules .git server\node_modules

Write-Host "[DONE]" -ForegroundColor Green
Read-Host "Press Enter to close"
