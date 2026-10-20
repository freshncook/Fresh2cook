Write-Host "DELIVERY OS GENERATOR STARTED" -ForegroundColor Yellow

$routeTemplate = {
    param($Module)

@"
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    success: true,
    module: "$Module",
    timestamp: new Date().toISOString(),
    metrics: {
      totalOrders: 2540,
      activeOrders: 186,
      deliveredToday: 425,
      deliverySuccessRate: 97.8
    }
  });
}
"@
}

$apis = @(

    @{
        Path = "app/api/delivery-command-center/route.ts"
        Module = "Delivery Command Center"
    },

    @{
        Path = "app/api/delivery-war-room/route.ts"
        Module = "Delivery War Room"
    },

    @{
        Path = "app/api/delivery-mission-control/route.ts"
        Module = "Delivery Mission Control"
    },

    @{
        Path = "app/api/delivery-kpi-engine/route.ts"
        Module = "Delivery KPI Engine"
    },

    @{
        Path = "app/api/delivery-profit-engine/route.ts"
        Module = "Delivery Profit Engine"
    },

    @{
        Path = "app/api/delivery-smart-routing/route.ts"
        Module = "Delivery Smart Routing"
    },

    @{
        Path = "app/api/delivery-analytics/route.ts"
        Module = "Delivery Analytics"
    },

    @{
        Path = "app/api/delivery-revenue-engine/route.ts"
        Module = "Delivery Revenue Engine"
    },

    @{
        Path = "app/api/delivery-performance-iq/route.ts"
        Module = "Delivery Performance IQ"
    },

    @{
        Path = "app/api/delivery-control-tower/route.ts"
        Module = "Delivery Control Tower"
    }

)

foreach ($api in $apis) {

    $folder = Split-Path $api.Path

    if (!(Test-Path $folder)) {
        New-Item -ItemType Directory -Force -Path $folder | Out-Null
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
Write-Host "DELIVERY OS GENERATOR COMPLETED" -ForegroundColor Cyan
Write-Host "Total APIs Generated: $($apis.Count)" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan