$ErrorActionPreference = "Stop"

& (Join-Path $PSScriptRoot "setup-local-database.ps1")
if ($LASTEXITCODE -ne 0) { throw "Local database preparation failed." }

$baseUrl = "http://localhost:3000"
$runId = [Guid]::NewGuid().ToString("N")
$email = "maviri-smoke-$runId@example.invalid"
$password = [Guid]::NewGuid().ToString("N") + "Aa!"
$webSession = New-Object Microsoft.PowerShell.Commands.WebRequestSession
$psql = "C:\Program Files\PostgreSQL\18\bin\psql.exe"
$sqlPath = Join-Path $env:TEMP "maviri-smoke-$runId.sql"

function Invoke-MaviriRequest([string]$path, [string]$method = "GET", $body = $null) {
  $parameters = @{
    Uri = "$baseUrl$path"
    Method = $method
    WebSession = $webSession
    UseBasicParsing = $true
  }
  if ($null -ne $body) {
    $parameters.ContentType = "application/json"
    $parameters.Body = ConvertTo-Json -InputObject $body -Depth 10 -Compress
  }

  try {
    $response = Invoke-WebRequest @parameters
    return @{ StatusCode = [int]$response.StatusCode; Content = [string]$response.Content }
  } catch {
    if ($_.Exception.Response) {
      $response = $_.Exception.Response
      $reader = New-Object System.IO.StreamReader($response.GetResponseStream())
      $content = $reader.ReadToEnd()
      $reader.Dispose()
      return @{ StatusCode = [int]$response.StatusCode; Content = $content }
    }
    throw
  }
}

function Assert-Status($response, [int]$expected, [string]$label) {
  if ($response.StatusCode -ne $expected) {
    throw "$label returned HTTP $($response.StatusCode), expected HTTP $expected. $($response.Content)"
  }
  Write-Host "$label : HTTP $expected"
}

try {
  $signup = Invoke-MaviriRequest "/api/auth/sign-up/email" "POST" @{ name = "Maviri Smoke"; email = $email; password = $password }
  Assert-Status $signup 200 "Account registration"

  $libraryWrite = Invoke-MaviriRequest "/api/library" "POST" @{ aniListMediaId = 21; status = "PLANNING"; episodesWatched = 0; rewatchCount = 0; personalScore = $null }
  Assert-Status $libraryWrite 201 "Library entry creation"

  $libraryRead = Invoke-MaviriRequest "/api/library"
  Assert-Status $libraryRead 200 "Authenticated library"
  $libraryData = $libraryRead.Content | ConvertFrom-Json
  if ($libraryData.entries.Count -ne 1) { throw "The saved library entry was not returned by the database." }

  $listWrite = Invoke-MaviriRequest "/api/library/lists" "POST" @{ name = "Smoke $runId" }
  Assert-Status $listWrite 201 "Custom list creation"

  $postWrite = Invoke-MaviriRequest "/api/community/posts" "POST" @{ content = "Smoke check $runId"; kind = "TEXT" }
  Assert-Status $postWrite 201 "Community post creation"

  $moderatorRoute = Invoke-MaviriRequest "/api/moderation/reports"
  Assert-Status $moderatorRoute 403 "Member moderation permission check"

  $statsPage = Invoke-MaviriRequest "/library/stats"
  Assert-Status $statsPage 200 "Personal statistics page"
  if ($statsPage.Content -notmatch "EPISODES WATCHED") { throw "The personal statistics page did not render the tracked library data." }

  $health = Invoke-MaviriRequest "/api/health"
  Assert-Status $health 200 "Database health check"
} finally {
  if (Test-Path -LiteralPath ".env.local") {
    $urlLine = Get-Content -LiteralPath ".env.local" | Where-Object { $_ -match '^\s*DATABASE_URL\s*=' } | Select-Object -First 1
    if ($urlLine) {
      $databaseUrl = [Uri](($urlLine -replace '^\s*DATABASE_URL\s*=\s*', '').Trim().Trim('"').Trim("'"))
      $credentials = $databaseUrl.UserInfo -split ":", 2
      $env:PGPASSWORD = [Uri]::UnescapeDataString($credentials[1])
      $databaseName = $databaseUrl.AbsolutePath.TrimStart("/")
      $cleanupEmails = @($email)
      $previousEmailFile = Join-Path $env:TEMP "maviri-readiness-email.txt"
      if (Test-Path -LiteralPath $previousEmailFile) {
        $cleanupEmails += (Get-Content -LiteralPath $previousEmailFile -Raw).Trim()
        Remove-Item -LiteralPath $previousEmailFile -Force
      }
      $sql = ($cleanupEmails | ForEach-Object { "DELETE FROM `"User`" WHERE email = '$($_.Replace("'", "''"))';" }) -join [Environment]::NewLine
      [System.IO.File]::WriteAllText($sqlPath, $sql, [System.Text.UTF8Encoding]::new($false))
      & $psql -h $databaseUrl.Host -p $databaseUrl.Port -U $credentials[0] -d $databaseName -v ON_ERROR_STOP=1 -f $sqlPath | Out-Null
      $cleanupStatus = $LASTEXITCODE
      Remove-Item Env:PGPASSWORD -ErrorAction SilentlyContinue
      Remove-Item -LiteralPath $sqlPath -Force -ErrorAction SilentlyContinue
      if ($cleanupStatus -ne 0) { throw "Could not remove the temporary smoke-check account." }
      Write-Host "Temporary smoke-check account and its data removed."
    }
  }
}
