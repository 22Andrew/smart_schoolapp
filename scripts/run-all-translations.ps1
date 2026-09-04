# Generate UI phrase translations for all header languages in parallel.
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force

$env:I18N_CONCURRENCY = "3"
$langs = @('hi', 'ar', 'sw', 'fr', 'tr', 'ru', 'de', 'nl')

foreach ($lang in $langs) {
    Start-Process -FilePath node `
        -ArgumentList "scripts/generate-i18n-phrases.js", "--lang=$lang" `
        -RedirectStandardOutput "scripts/i18n-$lang.log" `
        -RedirectStandardError "scripts/i18n-$lang.err.log" `
        -WindowStyle Hidden
    Write-Host "Started translation job for $lang"
}

Write-Host "All 8 language jobs started. Monitor scripts/i18n-*.log for progress."
