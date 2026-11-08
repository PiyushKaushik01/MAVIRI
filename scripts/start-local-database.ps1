$ErrorActionPreference = "Stop"

$envFilePath = Join-Path (Get-Location) ".env.local"
if (-not (Test-Path -LiteralPath $envFilePath)) {
  throw "Run npm run db:local:setup once to create the local database and authentication secret."
}

$databaseUrlLine = Get-Content -LiteralPath $envFilePath | Where-Object { $_ -match '^\s*DATABASE_URL\s*=' } | Select-Object -First 1
if (-not $databaseUrlLine -or $databaseUrlLine -notmatch '127\.0\.0\.1:5433') {
  exit 0
}

$pgCtl = "C:\Program Files\PostgreSQL\18\bin\pg_ctl.exe"
$dataDirectory = Join-Path $env:LOCALAPPDATA "Maviri\postgresql\data"
$logFile = Join-Path (Split-Path $dataDirectory -Parent) "postgres.log"
if (-not (Test-Path -LiteralPath $pgCtl) -or -not (Test-Path -LiteralPath (Join-Path $dataDirectory "PG_VERSION"))) {
  throw "The project-local PostgreSQL tools or data directory are missing. Run npm run db:local:setup again."
}

& $pgCtl status -D $dataDirectory *> $null
if ($LASTEXITCODE -ne 0) {
  & $pgCtl start -D $dataDirectory -l $logFile -o "-h 127.0.0.1 -p 5433" -w
  if ($LASTEXITCODE -ne 0) { throw "Could not start local PostgreSQL. See $logFile." }
}
