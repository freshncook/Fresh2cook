Write-Host ""
Write-Host "====================================="
Write-Host " FRESH2COOK CUSTOMER SIDE AUDIT"
Write-Host "====================================="
Write-Host ""

$Pages = @(
"app\customer",
"app\wallet",
"app\orders",
"app\checkout",
"app\track-order",
"app\address-book",
"app\cart",
"components\user-chrome.tsx",
"components\sticky-mobile-nav.tsx"
)

foreach($p in $Pages){

    if(Test-Path $p){
        Write-Host "[OK] $p" -ForegroundColor Green
    }
    else{
        Write-Host "[MISSING] $p" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Creating ZIP..."
Write-Host ""

if(Test-Path "CUSTOMER-100.zip"){
    Remove-Item "CUSTOMER-100.zip" -Force
}

Compress-Archive `
app\customer,`
app\wallet,`
app\orders,`
app\checkout,`
app\track-order,`
app\address-book,`
app\cart,`
components\user-chrome.tsx,`
components\sticky-mobile-nav.tsx `
-DestinationPath CUSTOMER-100.zip `
-Force

Write-Host ""
Write-Host "ZIP Created Successfully"
Write-Host ""

Write-Host "Running Build..."
Write-Host ""

npm run build

Write-Host ""
Write-Host "====================================="
Write-Host " CUSTOMER SIDE COMPLETE"
Write-Host "====================================="