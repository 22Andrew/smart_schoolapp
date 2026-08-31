$templatesDir = Join-Path $PSScriptRoot "..\src\main\resources\templates"

Get-ChildItem -Path $templatesDir -Filter "*.html" -Recurse | ForEach-Object {
    if ($_.FullName -match "\\fragments\\") { return }
    $content = Get-Content $_.FullName -Raw
    if ($content -match "fragments/sidebar" -and $content -notmatch "fragments/top-navbar") {
        Write-Output $_.FullName.Replace($templatesDir + "\", "")
    }
}
