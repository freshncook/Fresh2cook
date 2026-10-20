$file = "app\products\page.tsx"

$content = Get-Content $file -Raw

# Remove lower search box
$content = $content -replace '(?s)<input\s+type="text"\s+placeholder="Search products\.\.\.".*?\/>',''

# Smaller heading
$content = $content -replace 'text-5xl font-extrabold','text-3xl font-bold'

# Move search beside subtitle
$content = $content -replace '(?s)<p className="text-gray-600 text-xl mb-10">.*?<\/p>','<div className="flex items-center justify-between mb-8">
<p className="text-gray-600 text-base">
Freshly packed vegetables, ready for your kitchen.
</p>

<input
type="text"
placeholder="Search products..."
value={search}
onChange={(e)=>setSearch(e.target.value)}
className="w-96 border rounded-xl px-4 py-2"
/>
</div>'

# Product grid 6 per row
$content = $content -replace 'lg:grid-cols-5','lg:grid-cols-6'

# Pack dropdown options
$content = $content -replace '<option>250g</option>\s*<option>500g</option>\s*<option>1kg</option>','<option>250g</option>
<option>500g</option>
<option>1kg</option>
<option>1 Bunch</option>
<option>1 Pkt</option>'

# Remove bad minus symbol
$content = $content.Replace("−","")
$content = $content.Replace("âˆ’","")

# MRP / Our Price / Saving block
$content = $content -replace '?\{product\.price\}','MRP ?{Math.round(product.price * 1.2)}
<br/>
<span className="text-green-600">Our Price ?{product.price}</span>
<br/>
<span className="text-red-500">Saving ?{Math.round(product.price * 0.2)}</span>'

# Small qty controls
$content = $content -replace 'w-10 h-10','w-7 h-7 text-xs'
$content = $content -replace 'py-2 rounded-lg text-sm','py-1 rounded text-xs'

Set-Content $file $content

Write-Host ""
Write-Host "SUCCESS - PRODUCTS PAGE UPDATED"
