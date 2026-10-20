Write-Host ""
Write-Host "====================================" -ForegroundColor Cyan
Write-Host "FRESHCUT CRM MASTER GENERATOR" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

$generators = @(

    ".\generators\rider-os-generator.ps1",
    ".\generators\delivery-os-generator.ps1",
    ".\generators\delivery-enterprise-generator.ps1"

)

foreach ($generator in $generators) {

    if (Test-Path $generator) {

        Write-Host ""
        Write-Host "Running $generator" -ForegroundColor Yellow

        powershell `
            -ExecutionPolicy Bypass `
            -File $generator

        Write-Host ""
        Write-Host "$generator Completed" -ForegroundColor Green
    }
    else {

        Write-Host ""
        Write-Host "Missing: $generator" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "====================================" -ForegroundColor Cyan
Write-Host "MASTER GENERATOR COMPLETED" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan