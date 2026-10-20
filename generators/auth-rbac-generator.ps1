Write-Host "AUTH RBAC GENERATOR STARTED" -ForegroundColor Yellow

$routeTemplate = {
param($Module)

@"
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    success: true,
    module: "$Module",
    timestamp: new Date().toISOString()
  });
}
"@
}

$apis = @(

@{
Path="app/api/auth/login/route.ts"
Module="Login API"
},

@{
Path="app/api/auth/logout/route.ts"
Module="Logout API"
},

@{
Path="app/api/auth/register/route.ts"
Module="Register API"
},

@{
Path="app/api/auth/refresh-token/route.ts"
Module="Refresh Token API"
},

@{
Path="app/api/auth/profile/route.ts"
Module="Profile API"
},

@{
Path="app/api/rbac/roles/route.ts"
Module="RBAC Roles"
},

@{
Path="app/api/rbac/permissions/route.ts"
Module="RBAC Permissions"
},

@{
Path="app/api/admin/users/route.ts"
Module="User Management"
},

@{
Path="app/api/admin/audit-logs/route.ts"
Module="Audit Logs"
},

@{
Path="app/api/security/session-manager/route.ts"
Module="Session Manager"
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
Write-Host "AUTH RBAC GENERATED" -ForegroundColor Cyan
Write-Host "Total APIs Generated: $($apis.Count)" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan