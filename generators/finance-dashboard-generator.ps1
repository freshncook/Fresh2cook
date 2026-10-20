Write-Host "FINANCE DASHBOARD GENERATOR STARTED" -ForegroundColor Yellow

$pages = @(

@{
Path="app/finance/page.tsx"
Title="Finance Command Center"
},

@{
Path="app/finance/pnl/page.tsx"
Title="Profit & Loss Dashboard"
},

@{
Path="app/finance/cashflow/page.tsx"
Title="Cash Flow Dashboard"
},

@{
Path="app/finance/expenses/page.tsx"
Title="Expense Analytics"
},

@{
Path="app/finance/gst/page.tsx"
Title="GST Dashboard"
},

@{
Path="app/finance/vendor-payments/page.tsx"
Title="Vendor Payments"
},

@{
Path="app/finance/collections/page.tsx"
Title="Collections Dashboard"
},

@{
Path="app/finance/profitability/page.tsx"
Title="Profitability Analytics"
},

@{
Path="app/finance/reports/page.tsx"
Title="Financial Reports"
},

@{
Path="app/finance/forecast/page.tsx"
Title="Finance Forecast"
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
          <p className="text-2xl font-bold">₹12,50,000</p>
        </div>

        <div className="bg-white border rounded-xl p-5">
          <h3 className="font-semibold">Expenses</h3>
          <p className="text-2xl font-bold">₹7,80,000</p>
        </div>

        <div className="bg-white border rounded-xl p-5">
          <h3 className="font-semibold">Profit</h3>
          <p className="text-2xl font-bold">₹4,70,000</p>
        </div>

        <div className="bg-white border rounded-xl p-5">
          <h3 className="font-semibold">Margin</h3>
          <p className="text-2xl font-bold">37.6%</p>
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
Write-Host "FINANCE DASHBOARD GENERATED" -ForegroundColor Cyan
Write-Host "Total Pages Generated: $($pages.Count)" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan