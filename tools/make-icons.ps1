# Membuat ikon PWA 192 & 512 dari ./assets/img/icon.svg (fallback gambar vektor)
# Dijalankan sekali via: powershell -ExecutionPolicy Bypass -File tools/make-icons.ps1
$ErrorActionPreference = 'Stop'
$imgDir = Join-Path (Join-Path (Join-Path $PSScriptRoot '..') 'assets') 'img'
if (-not (Test-Path -LiteralPath $imgDir)) { throw "Folder tidak ditemukan: $imgDir" }
Add-Type -AssemblyName System.Drawing
function New-PwaIcon([int]$size, [string]$out) {
  $bmp = New-Object System.Drawing.Bitmap($size, $size)
  try {
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    try {
      $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
      $g.Clear([System.Drawing.ColorTranslator]::FromHtml('#0f172a'))
      $teal = New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml('#0f766e'))
      try {
        $d = [int]($size * 0.62)
        $x = [int](($size - $d) / 2)
        $g.FillEllipse($teal, $x, $x, $d, $d)
      } finally { $teal.Dispose() }
      $font = New-Object System.Drawing.Font('Arial', [float]($size * 0.26), [System.Drawing.FontStyle]::Bold)
      try {
        $brush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
        try {
          $sf = New-Object System.Drawing.StringFormat
          $sf.Alignment = [System.Drawing.StringAlignment]::Center
          $sf.LineAlignment = [System.Drawing.StringAlignment]::Center
          $g.DrawString('PJ', $font, $brush, [System.Drawing.RectangleF]::new(0, 0, $size, $size), $sf)
        } finally { $brush.Dispose() }
      } finally { $font.Dispose() }
    } finally { $g.Dispose() }
    $bmp.Save($out, [System.Drawing.Imaging.ImageFormat]::Png)
  } finally { $bmp.Dispose() }
  Write-Output "OK: $out"
}
New-PwaIcon 192 (Join-Path $imgDir 'icon-192.png')
New-PwaIcon 512 (Join-Path $imgDir 'icon-512.png')
