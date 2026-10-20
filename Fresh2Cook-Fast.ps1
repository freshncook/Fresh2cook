# Fresh2Cook - run the website in FAST (live / production) mode on this computer.
# This is exactly how fast it will be after publishing.
#   powershell -ExecutionPolicy Bypass -File .\Fresh2Cook-Fast.ps1
# (Stop "npm run dev" first with Ctrl + C.)

$Root = $PSScriptRoot
if (-not $Root) { $Root = (Get-Location).Path }
Set-Location $Root

Write-Host ""
Write-Host "=== Fresh2Cook : FAST mode (live jaisa) ===" -ForegroundColor Green
Write-Host "  1/2  Website taiyar ho rahi hai (build) - 2 se 5 minute lagenge..." -ForegroundColor White
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "  Build me galti aayi. Upar ka error copy karke bhejein." -ForegroundColor Red
    exit 1
}
Write-Host ""
Write-Host "  2/2  Chalu: http://localhost:3000  (band karne ke liye Ctrl + C)" -ForegroundColor Green
Write-Host "  Code badalne ke baad yeh script dobara chalayein (FAST mode apne aap update nahi hota)." -ForegroundColor Yellow
Write-Host ""
npm run start
