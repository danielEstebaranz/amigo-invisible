# Genera el icono de la app (regalo blanco sobre degradado azul-morado) en PNG e ICO.
# Uso (desde PowerShell): .\desktop\make-icons.ps1
Add-Type -AssemblyName System.Drawing
$root = Split-Path -Parent $PSScriptRoot

function New-IconBitmap([int]$size) {
  $bmp = New-Object System.Drawing.Bitmap $size, $size
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = 'AntiAlias'
  $g.Clear([System.Drawing.Color]::Transparent)

  # Fondo: cuadrado redondeado con degradado.
  $r = $size * 0.22
  $path = New-Object System.Drawing.Drawing2D.GraphicsPath
  $path.AddArc(0, 0, $r * 2, $r * 2, 180, 90)
  $path.AddArc($size - $r * 2, 0, $r * 2, $r * 2, 270, 90)
  $path.AddArc($size - $r * 2, $size - $r * 2, $r * 2, $r * 2, 0, 90)
  $path.AddArc(0, $size - $r * 2, $r * 2, $r * 2, 90, 90)
  $path.CloseFigure()
  $brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush (New-Object System.Drawing.Point 0, 0), (New-Object System.Drawing.Point $size, $size), ([System.Drawing.Color]::FromArgb(0, 120, 212)), ([System.Drawing.Color]::FromArgb(92, 45, 145))
  $g.FillPath($brush, $path)

  # Regalo: trazos del icono "gift" (rejilla de 24) escalados al centro.
  $s = $size / 24 * 0.62
  $o = ($size - 24 * $s) / 2
  $pen = New-Object System.Drawing.Pen ([System.Drawing.Color]::White), ([Math]::Max(1.5, 2 * $s))
  $pen.StartCap = 'Round'; $pen.EndCap = 'Round'; $pen.LineJoin = 'Round'
  function P([double]$x, [double]$y) { New-Object System.Drawing.PointF ([float]($o + $x * $s)), ([float]($o + $y * $s)) }
  $g.DrawRectangle($pen, [float]($o + 3 * $s), [float]($o + 8 * $s), [float](18 * $s), [float](4 * $s))
  $g.DrawLine($pen, (P 12 8), (P 12 21))
  $g.DrawLines($pen, [System.Drawing.PointF[]]@((P 19 12), (P 19 21), (P 5 21), (P 5 12)))
  $g.DrawBezier($pen, (P 12 8), (P 10 3), (P 4.5 2.5), (P 7.5 8))
  $g.DrawBezier($pen, (P 12 8), (P 14 3), (P 19.5 2.5), (P 16.5 8))
  $g.Dispose()
  return $bmp
}

# Entrada de ICO en formato DIB de 32 bits (compatible con el compilador de C# clásico).
function Get-DibBytes($bmp) {
  $n = $bmp.Width
  $ms = New-Object System.IO.MemoryStream
  $w = New-Object System.IO.BinaryWriter $ms
  $w.Write([UInt32]40); $w.Write([Int32]$n); $w.Write([Int32]($n * 2))
  $w.Write([UInt16]1); $w.Write([UInt16]32); $w.Write([UInt32]0)
  $w.Write([UInt32]($n * $n * 4)); $w.Write([Int32]0); $w.Write([Int32]0); $w.Write([UInt32]0); $w.Write([UInt32]0)
  for ($y = $n - 1; $y -ge 0; $y--) {
    for ($x = 0; $x -lt $n; $x++) {
      $c = $bmp.GetPixel($x, $y)
      $w.Write([byte]$c.B); $w.Write([byte]$c.G); $w.Write([byte]$c.R); $w.Write([byte]$c.A)
    }
  }
  $maskRow = [Math]::Ceiling($n / 32) * 4
  $w.Write((New-Object byte[] ($maskRow * $n)))
  $w.Flush()
  return , $ms.ToArray()
}

# PNG para la web (icono de pantalla de inicio).
$big = New-IconBitmap 512
$big.Save((Join-Path $root 'public\icon-512.png'), [System.Drawing.Imaging.ImageFormat]::Png)
(New-IconBitmap 192).Save((Join-Path $root 'public\icon-192.png'), [System.Drawing.Imaging.ImageFormat]::Png)

# ICO con varias resoluciones.
$sizes = 256, 64, 48, 32, 16
$images = New-Object System.Collections.Generic.List[byte[]]
foreach ($sz in $sizes) { $images.Add((Get-DibBytes (New-IconBitmap $sz))) }
$out = New-Object System.IO.MemoryStream
$w = New-Object System.IO.BinaryWriter $out
$w.Write([UInt16]0); $w.Write([UInt16]1); $w.Write([UInt16]$sizes.Count)
$offset = 6 + 16 * $sizes.Count
for ($i = 0; $i -lt $sizes.Count; $i++) {
  $dim = if ($sizes[$i] -ge 256) { 0 } else { $sizes[$i] }
  $w.Write([byte]$dim); $w.Write([byte]$dim); $w.Write([byte]0); $w.Write([byte]0)
  $w.Write([UInt16]1); $w.Write([UInt16]32)
  $w.Write([UInt32]$images[$i].Length); $w.Write([UInt32]$offset)
  $offset += $images[$i].Length
}
foreach ($img in $images) { $w.Write($img) }
$w.Flush()
[System.IO.File]::WriteAllBytes((Join-Path $PSScriptRoot 'icon.ico'), $out.ToArray())
Write-Output 'Iconos generados'
