$File = "app\admin\products-manage\page.tsx"

$Code = Get-Content $File -Raw

# Corporate Container
$Code = $Code.Replace(
'Add New Product',
'🛍️ Add New Product'
)

# Single Pack Dropdown
$Code = $Code -replace '(?s)<select.*?250g.*?</select>\s*</div>\s*<div.*?Product Image','<div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-3xl border border-green-100"><label className="block text-sm font-semibold mb-2">Pack Size</label><select className="w-full h-12 rounded-xl border border-green-200 px-4"><option>250g</option><option>500g</option><option>1kg</option><option>1 Bunch</option><option>1 Pkt</option></select></div><div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 rounded-3xl border border-blue-100"><label className="block text-sm font-semibold mb-2">Product Image</label>'

# AI Description
if($Code -notmatch "AI Description"){
$Code = $Code.Replace(
'Description',
'AI Description'
)
}

# Fancy Inputs
$Code = $Code.Replace(
'rounded-xl',
'rounded-2xl'
)

# Fancy Cards
$Code = $Code.Replace(
'bg-white',
'bg-gradient-to-br from-white to-green-50'
)

Set-Content $File $Code

Write-Host ""
Write-Host "==========================="
Write-Host "ADMIN CORPORATE STYLE DONE"
Write-Host "==========================="
Write-Host ""