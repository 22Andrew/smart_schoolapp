$templatesDir = Join-Path $PSScriptRoot "..\src\main\resources\templates"
$replacement = @"
    <!-- Top Navigation Bar -->
    <nav th:replace="~{fragments/top-navbar :: top-navbar}"></nav>
"@

$patched = 0
$skipped = 0

Get-ChildItem -Path $templatesDir -Filter "*.html" -Recurse | ForEach-Object {
    $file = $_.FullName
    if ($file -match "\\fragments\\") {
        return
    }

    $content = Get-Content $file -Raw
    if ($content -match "fragments/top-navbar") {
        $script:skipped++
        return
    }

    if ($content -notmatch '<nav class="top-navbar">') {
        return
    }

    $updated = [regex]::Replace(
        $content,
        '(?s)\s*<!-- Top Navigation Bar -->\s*<nav class="top-navbar">.*?</nav>',
        "`r`n$replacement",
        1
    )

    if ($updated -eq $content) {
        $updated = [regex]::Replace(
            $content,
            '(?s)\s*<nav class="top-navbar">.*?</nav>',
            "`r`n$replacement",
            1
        )
    }

    if ($updated -ne $content) {
        Set-Content -Path $file -Value $updated -NoNewline
        $script:patched++
        Write-Output "Patched: $($_.Name)"
    }
}

Write-Output "Done. Patched $patched file(s), skipped $skipped already using fragment."
