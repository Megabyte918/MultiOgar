@echo off
cls
:start
node ../src/index.js
@echo.
@echo Restarting server...
@echo.
goto start
