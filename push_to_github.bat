@echo off
echo 🚀 Preparing to push to GitHub...
echo 🔍 Staging changes (respecting .gitignore)...
git add .
echo ✅ Files staged.
echo.
echo 💾 Committing changes...
git commit -m "feat: complete AI resume screening module and integration"
echo.
echo ⬆️ Pushing to GitHub...
git push origin master
echo.
echo ✨ All changes have been pushed successfully!
echo.
pause
