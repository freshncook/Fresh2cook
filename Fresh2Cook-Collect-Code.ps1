# ==========================================================
#  Fresh2Cook CRM - Code Collector (sirf padhta hai, kuch nahi badalta)
#
#  Kaise chalayein:
#    1. Is file ko project folder me rakhein (jisme package.json hai)
#    2. PowerShell me chalayein:
#         powershell -ExecutionPolicy Bypass -File .\Fresh2Cook-Collect-Code.ps1
#    3. Desktop par bani "Fresh2Cook-code.zip" Claude ko bhejein
#
#  Isme NAHI jaata: .env (passwords/secret), database file, node_modules,
#  .next, images, backup / disabled / temp folders.
# ==========================================================

$ErrorActionPreference = "Stop"
$Root = $PSScriptRoot
if (-not $Root) { $Root = (Get-Location).Path }

if (-not (Test-Path (Join-Path $Root "package.json"))) {
    Write-Host "GALTI: package.json nahi mila. Script ko project folder me rakh kar chalayein." -ForegroundColor Red
    exit 1
}

$includeDirs = @("app", "src", "components", "lib", "hooks", "context", "contexts", "store", "utils", "types", "prisma", "data", "config")
$includeFiles = @("package.json", "tsconfig.json", "middleware.ts", "middleware.js", "next.config.js", "next.config.mjs", "next.config.ts")
$extensions = @(".ts", ".tsx", ".js", ".jsx", ".json", ".prisma", ".css")
$skip = '(?i)\\(node_modules|\.next|_backups|\.git|public|migrations)\\|backup|disabled|[-_]temp|rider-step2-6-fix|live-source|\.env'

$stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$tmpBase = $env:TEMP; if (-not $tmpBase) { $tmpBase = [IO.Path]::GetTempPath() }
$tmp = Join-Path $tmpBase ("f2c-code-" + $stamp)
New-Item -ItemType Directory -Force -Path $tmp | Out-Null

$count = 0
$bytes = 0

function Copy-One($file) {
    $rel = $file.FullName.Substring($Root.Length).TrimStart("\")
    if (("\" + $rel) -match $skip) { return }
    if ($file.Length -gt 400KB) { return }
    $dest = Join-Path $tmp $rel
    New-Item -ItemType Directory -Force -Path (Split-Path $dest) | Out-Null
    Copy-Item -LiteralPath $file.FullName -Destination $dest -Force
    $script:count++
    $script:bytes += $file.Length
}

foreach ($f in $includeFiles) {
    $p = Join-Path $Root $f
    if (Test-Path $p) { Copy-One (Get-Item -LiteralPath $p) }
}

foreach ($d in $includeDirs) {
    $p = Join-Path $Root $d
    if (-not (Test-Path $p)) { continue }
    Get-ChildItem -LiteralPath $p -Recurse -File -ErrorAction SilentlyContinue |
        Where-Object { $extensions -contains $_.Extension.ToLower() } |
        ForEach-Object { Copy-One $_ }
}

$desktop = [Environment]::GetFolderPath("Desktop")
if (-not $desktop -or -not (Test-Path $desktop)) { $desktop = $Root }
$zip = Join-Path $desktop "Fresh2Cook-code.zip"
if (Test-Path $zip) { Remove-Item -LiteralPath $zip -Force }
Compress-Archive -Path (Join-Path $tmp "*") -DestinationPath $zip -Force
Remove-Item -LiteralPath $tmp -Recurse -Force -ErrorAction SilentlyContinue

$sizeMb = [Math]::Round((Get-Item $zip).Length / 1MB, 2)
Write-Host ""
Write-Host "==================== HO GAYA ====================" -ForegroundColor Green
Write-Host ("Files : " + $count) -ForegroundColor Green
Write-Host ("Zip   : " + $zip + "  (" + $sizeMb + " MB)") -ForegroundColor Cyan
Write-Host "Ab yeh zip Claude ko bhejein." -ForegroundColor White
Write-Host "=================================================" -ForegroundColor Green
