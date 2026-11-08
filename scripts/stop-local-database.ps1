$ErrorActionPreference = "Stop"
$dataDirectory = Join-Path $env:LOCALAPPDATA "Maviri\postgresql\data"
$pgCtl = "C:\Program Files\PostgreSQL\18\bin\pg_ctl.exe"

if ((Test-Path -LiteralPath $pgCtl) -and (Test-Path -LiteralPath (Join-Path $dataDirectory "PG_VERSION"))) {
  & $pgCtl stop -D $dataDirectory -m fast -w
  if ($LASTEXITCODE -ne 0) { throw "Could not stop local PostgreSQL cleanly." }
}
