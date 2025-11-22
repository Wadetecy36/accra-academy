@echo off
git add .
git commit -m "update %date% %time:~0,8%"
git push
echo.
echo ✅ PUSHED SUCCESSFULLY!
pause