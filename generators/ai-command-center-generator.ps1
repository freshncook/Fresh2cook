Write-Host "AI COMMAND CENTER GENERATOR STARTED" -ForegroundColor Yellow

$pages = @(

@{
Path="app/ai/page.tsx"
Title="AI Command Center"
},

@{
Path="app/ai/revenue-predictor/page.tsx"
Title="AI Revenue Predictor"
},

@{
Path="app/ai/demand-forecast/page.tsx"
Title="AI Demand Forecast"
},

@{
Path="app/ai/churn-predictor/page.tsx"
Title="AI Churn Predictor"
},

@{
Path="app/ai/sales-coach/page.tsx"
Title="AI Sales Coach"
},

@{
Path="app/ai/customer-insights/page.tsx"
Title="AI Customer Insights"
},

@{
Path="app/ai/product-insights/page.tsx"
Title="AI Product Insights"
},

@{
Path="app/ai/recommendations/page.tsx"
Title="AI Recommendations Engine"
},

@{
Path="app/ai/executive-dashboard/page.tsx"
Title="AI Executive Dashboard"
},

@{
Path="app/ai/business-intelligence/page.tsx"
Title="AI Business Intelligence"
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
          <h3 className="font-semibold">
            Forecast Revenue
          </h3>
          <p className="text-2xl font-bold">
            ₹18,50,000
          </p>
        </div>

        <div className="bg-white border rounded-xl p-5">
          <h3 className="font-semibold">
            Demand Score
          </h3>
          <p className="text-2xl font-bold">
            92%
          </p>
        </div>

        <div className="bg-white border rounded-xl p-5">
          <h3 className="font-semibold">
            Churn Risk
          </h3>
          <p className="text-2xl font-bold">
            4.2%
          </p>
        </div>

        <div className="bg-white border rounded-xl p-5">
          <h3 className="font-semibold">
            AI Confidence
          </h3>
          <p className="text-2xl font-bold">
            96%
          </p>
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
Write-Host "AI COMMAND CENTER GENERATED" -ForegroundColor Cyan
Write-Host "Total Pages Generated: $($pages.Count)" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan