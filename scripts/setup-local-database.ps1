$ErrorActionPreference = "Stop"

$pgBin = "C:\Program Files\PostgreSQL\18\bin"
$initDb = Join-Path $pgBin "initdb.exe"
$pgCtl = Join-Path $pgBin "pg_ctl.exe"
$psql = Join-Path $pgBin "psql.exe"
$localRoot = Join-Path $env:LOCALAPPDATA "Maviri\postgresql"
$dataDirectory = Join-Path $localRoot "data"
$passwordFile = Join-Path $localRoot "init-password.txt"
$logFile = Join-Path $localRoot "postgres.log"
$port = 5433

function New-Secret([int]$length) {
  $bytes = New-Object byte[] $length
  $random = [Security.Cryptography.RandomNumberGenerator]::Create()
  try { $random.GetBytes($bytes) } finally { $random.Dispose() }
  return [Convert]::ToBase64String($bytes)
}

foreach ($binary in @($initDb, $pgCtl, $psql)) {
  if (-not (Test-Path -LiteralPath $binary)) {
    throw "PostgreSQL 18 client tools were not found at $pgBin. Install PostgreSQL 18 or configure DATABASE_URL manually."
  }
}

New-Item -ItemType Directory -Path $localRoot -Force | Out-Null

if (-not (Test-Path -LiteralPath (Join-Path $dataDirectory "PG_VERSION"))) {
  $envFilePath = Join-Path (Get-Location) ".env.local"
  if (Test-Path -LiteralPath $envFilePath) {
    throw ".env.local already exists, so setup will preserve it. Move that file aside or configure its DATABASE_URL to use a PostgreSQL database on 127.0.0.1:5433 before creating a local cluster."
  }

  $databasePassword = New-Secret 36
  [System.IO.File]::WriteAllText($passwordFile, $databasePassword, [System.Text.UTF8Encoding]::new($false))

  & $initDb -D $dataDirectory -U maviri -A scram-sha-256 --pwfile $passwordFile --encoding UTF8 --locale C
  if ($LASTEXITCODE -ne 0) { throw "Could not initialize the local Maviri PostgreSQL cluster." }

  Remove-Item -LiteralPath $passwordFile -Force -ErrorAction SilentlyContinue

  $connectionString = "postgresql://maviri:$([Uri]::EscapeDataString($databasePassword))@127.0.0.1:$port/maviri?schema=public"
  $authSecret = (New-Secret 48).TrimEnd([char[]]@("=" )).Replace("+", "-").Replace("/", "_")
  $envFile = @(
    "DATABASE_URL=`"$connectionString`""
    "BETTER_AUTH_SECRET=`"$authSecret`""
    "BETTER_AUTH_URL=`"http://localhost:3000`""
  ) -join [Environment]::NewLine
  [System.IO.File]::WriteAllText($envFilePath, $envFile + [Environment]::NewLine, [System.Text.UTF8Encoding]::new($false))
} elseif (-not (Test-Path -LiteralPath (Join-Path (Get-Location) ".env.local"))) {
  throw "The local database already exists, but .env.local is missing. Restore its connection URL or remove the local cluster before running setup again."
}

$databaseUrlLine = Get-Content -LiteralPath (Join-Path (Get-Location) ".env.local") | Where-Object { $_ -match '^\s*DATABASE_URL\s*=' } | Select-Object -First 1
if (-not $databaseUrlLine -or $databaseUrlLine -notmatch '127\.0\.0\.1:5433') {
  throw "DATABASE_URL in .env.local does not point to the project-local database. Setup preserved your existing configuration."
}

$databaseUrl = ($databaseUrlLine -replace '^\s*DATABASE_URL\s*=\s*', '').Trim().Trim('"').Trim("'")
$databaseUri = [Uri]$databaseUrl
$credential = $databaseUri.UserInfo -split ":", 2
$env:PGPASSWORD = [Uri]::UnescapeDataString($credential[1])
$databaseName = $databaseUri.AbsolutePath.TrimStart("/")

$clusterState = & $pgCtl status -D $dataDirectory 2>&1
if ($LASTEXITCODE -ne 0) {
  & $pgCtl start -D $dataDirectory -l $logFile -o "-h 127.0.0.1 -p $port" -w
  if ($LASTEXITCODE -ne 0) { throw "Could not start the project-local PostgreSQL server. See $logFile." }
}

$existingDatabase = & $psql -h 127.0.0.1 -p $port -U maviri -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname = '$databaseName'"
if ($LASTEXITCODE -ne 0) { throw "Could not connect to the project-local PostgreSQL server." }
if ([string]::IsNullOrWhiteSpace([string]$existingDatabase) -or $existingDatabase.Trim() -ne "1") {
  & $psql -h 127.0.0.1 -p $port -U maviri -d postgres -c "CREATE DATABASE `"$databaseName`""
  if ($LASTEXITCODE -ne 0) { throw "Could not create the Maviri database." }
}

Remove-Item Env:PGPASSWORD -ErrorAction SilentlyContinue
npx prisma migrate deploy
if ($LASTEXITCODE -ne 0) { throw "Database migration failed. Check .env.local and the PostgreSQL log at $logFile." }

Write-Host "Maviri's project-local PostgreSQL database is ready and migrations are applied."
