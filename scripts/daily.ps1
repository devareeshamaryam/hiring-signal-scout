# Runs both TenderScout bots on this computer (used by Windows Task Scheduler).
# Keys come from .env and the service-account JSON files in the project folder.
# Output goes to logs\YYYY-MM-DD.log; logs older than 30 days are deleted.

$ErrorActionPreference = 'Continue'
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

$node = 'C:\Program Files\nodejs\node.exe'
New-Item -ItemType Directory -Force -Path "$root\logs" | Out-Null
$log = "$root\logs\$(Get-Date -Format yyyy-MM-dd).log"

function Run-Bot($name, $script) {
  Add-Content -Path $log -Encoding UTF8 -Value "`n==== $name started $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') ===="
  # cmd does the redirect so the log stays plain UTF-8 (PowerShell 5.1 would re-encode it
  # and wrap stderr lines as errors).
  cmd /c "`"$node`" $script >> `"$log`" 2>&1"
  $code = $LASTEXITCODE
  Add-Content -Path $log -Encoding UTF8 -Value "==== $name finished $(Get-Date -Format 'HH:mm:ss') (exit code $code) ===="
  return $code
}

# One after the other: the hiring bot reads the tender sheet's award winners.
$tender = Run-Bot 'Tender bot' 'src\index.js'
$hiring = Run-Bot 'Hiring bot' 'src\hiring.js'

Get-ChildItem "$root\logs\*.log" | Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-30) } | Remove-Item -Force

# Non-zero if either bot reported a problem (each bot already posts its own errors to Slack).
exit [Math]::Max($tender, $hiring)
