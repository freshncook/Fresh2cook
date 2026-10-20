# Fresh2Cook - open the website on your phone (same Wi-Fi)
# Right-click PowerShell > "Run as Administrator" the first time, so the firewall can allow port 3000.
# Then:   powershell -ExecutionPolicy Bypass -File .\Fresh2Cook-Mobile.ps1

$ErrorActionPreference = "SilentlyContinue"
$Root = $PSScriptRoot
if (-not $Root) { $Root = (Get-Location).Path }
Set-Location $Root

Write-Host ""
Write-Host "=== Fresh2Cook : Mobile testing ===" -ForegroundColor Green

# 1. Firewall: allow port 3000 on this computer (only works as Administrator)
$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if ($isAdmin) {
    if (-not (Get-NetFirewallRule -DisplayName "Fresh2Cook dev 3000" -ErrorAction SilentlyContinue)) {
        New-NetFirewallRule -DisplayName "Fresh2Cook dev 3000" -Direction Inbound -Protocol TCP -LocalPort 3000 -Action Allow -Profile Any | Out-Null
        Write-Host "  OK   Firewall: port 3000 allowed" -ForegroundColor Green
    } else {
        Write-Host "  OK   Firewall rule already there" -ForegroundColor Green
    }
} else {
    Write-Host "  NOTE Not running as Administrator - if the phone cannot open the site, run this once as Administrator." -ForegroundColor Yellow
}

# 2. This computer's Wi-Fi address
$ips = Get-NetIPAddress -AddressFamily IPv4 | Where-Object {
    $_.IPAddress -match '^(192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[01])\.)' -and $_.InterfaceAlias -notmatch 'vEthernet|VirtualBox|VMware|Loopback'
} | Select-Object -ExpandProperty IPAddress
if (-not $ips) {
    Write-Host "  No Wi-Fi address found. Connect the computer to Wi-Fi or a phone hotspot." -ForegroundColor Red
    exit 1
}
$ip = @($ips)[0]
$url = "http://$($ip):3000"

Write-Host ""
Write-Host "  Phone par yeh link kholein (same Wi-Fi):" -ForegroundColor White
Write-Host "     $url" -ForegroundColor Cyan
Write-Host "     $url/rider/login      (Rider app)" -ForegroundColor Cyan
Write-Host "     $url/processing/login (Processing app)" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Ya phone camera se yeh QR scan karein:" -ForegroundColor White
node -e "require('qrcode-terminal').generate(process.argv[1], { small: true })" $url
Write-Host ""
Write-Host "  Website chalu ho rahi hai... (band karne ke liye Ctrl + C)" -ForegroundColor Green
Write-Host ""
npm run dev
