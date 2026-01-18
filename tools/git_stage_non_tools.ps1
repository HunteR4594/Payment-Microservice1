Set-Location 'c:\Users\renren\Documents\3rd yr\webdev\trydemo1\Payment-Microservice1'
Write-Output 'Staging all changes under tools/'
git add -- tools
$staged = git diff --cached --name-only
if ($staged -eq $null -or $staged -eq '') {
    Write-Output 'No staged changes found under tools/'
    exit 0
}
Write-Output 'Committing staged tool changes'
git commit -m 'chore(tools): add/update helper and test scripts'
$branch = git rev-parse --abbrev-ref HEAD
Write-Output ('Pushing to origin/' + $branch)
git push origin $branch
Set-Location 'c:\Users\renren\Documents\3rd yr\webdev\trydemo1\Payment-Microservice1'
$lines = git status --porcelain --untracked-files=all
$files = @()
foreach ($l in $lines) {
    if ($l.Length -ge 4) {
        $files += $l.Substring(3).Trim()
    }
}
$toAdd = $files | Where-Object { $_ -and (-not $_.StartsWith('tools/')) -and (-not $_.StartsWith('auth_service/')) -and (-not $_.StartsWith('./tools/')) -and (-not $_.StartsWith('./auth_service/')) }
if (-not $toAdd) {
    Write-Output 'No files to add (excluding tools and auth_service)'
    exit 0
}
Write-Output 'Staging:'
$toAdd | ForEach-Object { Write-Output "  $_" }
# Stage selected files (pass as array)
git add -- $toAdd
# Commit
git commit -m 'chore: commit changes (exclude auth_service and tools)'
$branch = git rev-parse --abbrev-ref HEAD
Write-Output "Pushing branch: $branch"
git push origin $branch
