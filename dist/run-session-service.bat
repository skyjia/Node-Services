:: Only show output in console
@echo off

:: Record current directory
set OLDDIR=%CD%

:: Change to script file directory "%~dp0"
CD /d %~dp0

run.bat session-service

:: restore to old directory
chdir /d %OLDDIR%