@echo off
echo 🚀 Pushing to GitHub...
echo.

:: 1. Update the GitHub remote with your correct URL
set REPO_URL=https://github.com/ayse-hatun/AI_RESUME_SCREENING_APP.git

echo 🔗 Connecting to: %REPO_URL%
git remote add origin %REPO_URL% 2>nul
if %errorlevel% neq 0 (
    git remote set-url origin %REPO_URL%
)

:: 2. Stage and Commit
echo 🔍 Staging and Finalizing...
git add .
git commit -m "feat: complete AI resume screening module" 2>nul

:: 3. Push
echo ⬆️ Pushing to GitHub...
git push -u origin main

if %errorlevel% neq 0 (
    echo.
    echo ❌ PUSH FAILED. 
    echo Please make sure you have created the repository "AI_RESUME_SCREENING_APP" 
    echo on your GitHub account "ayse-hatun" before running this.
) else (
    echo.
    echo ✨ SUCCESS! Your code is now live on GitHub at:
    echo %REPO_URL%
)

echo.
pause
