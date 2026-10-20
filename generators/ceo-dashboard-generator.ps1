Write-Host "CEO DASHBOARD GENERATOR STARTED" -ForegroundColor Yellow

$pages = @(

@{
Path="app/ceo/page.tsx"
Title="CEO Command Center"
},

@{
Path="app/ceo/revenue/page.tsx"
Title="Revenue Dashboard"
},

@{
Path="app/ceo/profit/page.tsx"
Title="Profit Dashboard"
},

@{
Path="app/ceo/growth/page.tsx"
Title="Growth Dashboard"
},

@{
Path="app/ceo/customers/page.tsx"
Title="Customer Analytics"
},

@{
Path="app/ceo/products/page.tsx"
Title="Product Analytics"
},

@{
Path="app/ceo/orders/page.tsx"
Title="Order Analytics"
},

@{
Path="app/ceo/operations/page.tsx"
Title="Operations Dashboard"
},

@{
Path="app/ceo/forecast/page.tsx"
Title="Business Forecast"
},

@{
Path="app/ceo/ai-insights/page.tsx"
Title="AI Insights"
}

)

foreach($page in $pages){

$folder = Split-Path $page.Path

if(!(Test-Path $folder)){
New-Item -ItemType Directory -Force -Path $folder | Out-Null
}

$code = @"
export default function Page() {
  return (
    <div className="p-6">

      <h1 className="text-3xl font-bold mb-6">
        $($page.Title)
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

        <div className="bg-white border rounded-xl p-5">
          <h3 className="font-semibold">Revenue</h3>
          <p className="text-2xl font-bold">₹1,25,000</p>
        </div>

        <div className="bg-white border rounded-xl p-5">
          <h3 className="font-semibold">Orders</h3>
          <p className="text-2xl font-bold">845</p>
        </div>

        <div className="bg-white border rounded-xl p-5">
          <h3 className="font-semibold">Customers</h3>
          <p className="text-2xl font-bold">15,240</p>
        </div>

        <div className="bg-white border rounded-xl p-5">
          <h3 className="font-semibold">Growth</h3>
          <p className="text-2xl font-bold">18.5%</p>
        </div>

      </div>

    </div>
  );
}
"@

Set-Content `
-Path $page.Path `
-Value $code `
-Encoding UTF8

Write-Host "Created $($page.Path)" -ForegroundColor Green

}

Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "CEO DASHBOARD GENERATED" -ForegroundColor Cyan
Write-Host "Total Pages Generated: $($pages.Count)" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan