@echo off
cls
:answer1
exit
:answer0
node ../src/index.js
@echo.
@echo Restarting server...
@echo.
IF ERRORLEVEL 1
goto :answer0

IF ERRORLEVEL 0
goto :answer 1
