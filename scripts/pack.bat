:: Only show output in console
@echo off

:: Record current directory
set OLDDIR=%CD%

:: Change to script file directory "%~dp0"
CD /d %~dp0

:: folder path for current script file
set DIR=%~dp0
set SRC_DIR=%DIR%..
set DIST_DIR=%DIR%..\dist

echo SRC_DIR=%SRC_DIR%
echo DIST_DIR=%DIST_DIR%

:: Create Node Package
IF "%1" == "create" (

	:: check dist folder existing
	IF NOT EXIST %DIST_DIR% (
		mkdir %DIST_DIR%
	)

	:: clean dist
	DEL %DIST_DIR%\*.nar
	DEL %DIST_DIR%\*.yml

	echo Creating node packages...

	nar create %SRC_DIR%\NetIS.Service.Email -o %DIST_DIR%
	nar create %SRC_DIR%\NetIS.Service.Content -o %DIST_DIR%
	nar create %SRC_DIR%\NetIS.Service.Session -o %DIST_DIR%

	:: copy Configuration Files
	copy %SRC_DIR%\NetIS.Service.Email\conf\development.yml %DIST_DIR%\NetIS.Service.Email_dev.yml
	copy %SRC_DIR%\NetIS.Service.Content\conf\development.yml %DIST_DIR%\NetIS.Service.Content_dev.yml
	copy %SRC_DIR%\NetIS.Service.Session\conf\development.yml %DIST_DIR%\NetIS.Service.Session_dev.yml

	echo Finish to create node packages...

	goto end
)

:: npm install all
IF "%1" == "npm-install" (
	echo Installing npm packages...

	pushd %SRC_DIR%\NetIS.Service.Email && npm install && popd
	pushd %SRC_DIR%\NetIS.Service.Content && npm install && popd
	pushd %SRC_DIR%\NetIS.Service.Session && npm install && popd

	echo Finish to install npm packages...

	goto end
)

:: npm update all
IF "%1" == "npm-update" (
	echo Updating npm packages...

	pushd %SRC_DIR%\NetIS.Service.Email && npm update && popd
	pushd %SRC_DIR%\NetIS.Service.Content && npm update && popd
	pushd %SRC_DIR%\NetIS.Service.Session && npm update && popd

	echo Finish to update npm packages...

	goto end
)

:: clean dist
IF "%1" == "clean" (

	echo Clearing dist...

	DEL %DIST_DIR%\*.nar
	DEL %DIST_DIR%\*.yml

	echo Cleared.

	goto end
)

echo Usage pack.bat "<command>"
echo.
echo where command is one of:
echo create, clean, npm-install, npm-update

:end
:: restore to old directory
chdir /d %OLDDIR%