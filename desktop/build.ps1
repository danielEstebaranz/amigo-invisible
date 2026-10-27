# Compila AmigoInvisible.exe con el compilador de C# incluido en Windows (.NET Framework 4.x).
# Uso (desde PowerShell): .\desktop\build.ps1
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$csc = Join-Path $env:WINDIR 'Microsoft.NET\Framework64\v4.0.30319\csc.exe'
$outDir = Join-Path $root 'dist'
New-Item -ItemType Directory -Force $outDir | Out-Null

& $csc /nologo /target:winexe /optimize+ `
  /win32icon:"$PSScriptRoot\icon.ico" `
  /out:"$outDir\AmigoInvisible.exe" `
  "$PSScriptRoot\AmigoInvisible.cs"
if ($LASTEXITCODE -ne 0) { throw 'Error al compilar' }
Write-Output "Creado $outDir\AmigoInvisible.exe"
