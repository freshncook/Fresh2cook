$File = "app\products\page.tsx"

$Code = Get-Content $File -Raw

# Small Heading
$Code = $Code.Replace(
"Fresh2Cook Products",
"Fresh2Cook"
)

# Add Search Box Near Description
$Code = $Code.Replace(
'Freshly packed vegetables, ready for your kitchen.',
'Freshly packed vegetables, ready for your kitchen.</p>

<div className="flex-1 max-w-md">
<input
type="text"
placeholder="Search Products..."
className="w-full border rounded-xl px-4 py-2"
/>
</div>

<p>'
)

# 6 Products Per Row
$Code = $Code.Replace(
"grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
"grid-cols-2 md:grid-cols-4 lg:grid-cols-6"
)

# Remove Duplicate Search Button
$Code = $Code.Replace(
"Search Products",
""
)

# Compact Product Cards
$Code = $Code.Replace(
"h-32",
"h-24"
)

$Code = $Code.Replace(
"text-lg",
"text-sm"
)

Set-Content $File $Code -Encoding UTF8

Write-Host ""
Write-Host "================================="
Write-Host " PRODUCTS PAGE UPDATED "
Write-Host "================================="
Write-Host ""