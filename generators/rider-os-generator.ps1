Write-Host "RIDER OS GENERATOR STARTED" -ForegroundColor Yellow

$routeTemplate = {
    param($Module)

@"
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    success: true,
    module: "$Module",
    timestamp: new Date().toISOString(),
    data: {
      totalRiders: 125,
      activeRiders: 98,
      completedDeliveries: 4567
    }
  });
}
"@
}

$apis = @(

    @{
        Path = "app/api/rider-command-center/route.ts"
        Module = "Rider Command Center"
    },

    @{
        Path = "app/api/rider-war-room/route.ts"
        Module = "Rider War Room"
    },

    @{
        Path = "app/api/rider-mission-control/route.ts"
        Module = "Rider Mission Control"
    },

    @{
        Path = "app/api/rider-growth-engine/route.ts"
        Module = "Rider Growth Engine"
    },

    @{
        Path = "app/api/rider-profit-engine/route.ts"
        Module = "Rider Profit Engine"
    },

    @{
        Path = "app/api/rider-smart-routing/route.ts"
        Module = "Rider Smart Routing"
    },

    @{
        Path = "app/api/rider-delivery-iq/route.ts"
        Module = "Rider Delivery IQ"
    },

    @{
        Path = "app/api/rider-performance-iq/route.ts"
        Module = "Rider Performance IQ"
    },

    @{
        Path = "app/api/rider-revenue-engine/route.ts"
        Module = "Rider Revenue Engine"
    },

    @{
        Path = "app/api/rider-wealth-builder/route.ts"
        Module = "Rider Wealth Builder"
    }

)

foreach ($api in $apis) {

    $folder = Split-Path $api.Path

    if (!(Test-Path $folder)) {
        New-Item `
            -ItemType Directory `
            -Force `
            -Path $folder | Out-Null
    }

    $code = & $routeTemplate $api.Module

    Set-Content `
        -Path $api.Path `
        -Value $code `
        -Encoding UTF8

    Write-Host "Created $($api.Path)" -ForegroundColor Green
}

Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "RIDER OS GENERATOR COMPLETED" -ForegroundColor Cyan
Write-Host "Total APIs Generated: $($apis.Count)" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan