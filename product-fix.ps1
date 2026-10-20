$path="components\product-card.tsx"

$content=Get-Content $path -Raw

$content=$content.Replace(
'className="w-full h-28 object-contain"',
'className="w-full h-24 object-contain p-2 hover:scale-105 transition duration-300"'
)

$content=$content.Replace(
'className="bg-white border rounded-xl p-3 shadow-sm hover:shadow-md transition"',
'className="bg-white border rounded-xl p-3 shadow-sm hover:shadow-md transition flex flex-col h-full"'
)

$content=$content.Replace(
'className="w-full mt-3 bg-green-600 text-white py-2 rounded-lg text-sm font-semibold"',
'className="w-full mt-2 bg-green-600 text-white py-1 rounded-lg text-xs font-semibold"'
)

$content=$content.Replace(
'className="w-10 h-10"',
'className="w-8 h-8 text-sm"'
)

$content=$content.Replace(
'className="w-10 h-10 text-green-600 font-bold"',
'className="w-8 h-8 text-green-600 font-bold text-sm"'
)

Set-Content $path $content

Write-Host "SUCCESS"
