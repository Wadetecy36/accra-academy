@echo off
color 2

echo.
echo   BLEOO SPIRIT PUSHING TO GITHUB...
echo.
git add .
git commit -m "update %date% %time:~0,8%"
git push
echo.
echo   PUSHED SUCCESSFULLY!
echo   Live: https://Wadetecy36.github.io/accra-academy-website
echo.
pause