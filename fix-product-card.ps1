$File = "components\product-card.tsx"

$Code = Get-Content $File -Raw

# Add New Pack Options
$Code = $Code.Replace(
@"          <option>
            1kg
          </option>"@,
@"          <option>
            1kg
          </option>

          <option>
            1 Bunch
          </option>

          <option>
            1 Pkt
          </option>"@
)

# Pack -> Pack Size
$Code = $Code.Replace(
"Pack",
"Pack Size"
)

# Small Buttons
$Code = $Code.Replace(
'className="w-8 h-8 text-sm"',
'className="w-7 h-7 text-xs"'
)

$Code = $Code.Replace(
'className="w-8 h-8 text-green-600 font-bold text-sm"',
'className="w-7 h-7 text-green-600 font-bold text-xs"'
)

Set-Content $File $Code -Encoding UTF8

Write-Host "PRODUCT CARD UPDATED"
