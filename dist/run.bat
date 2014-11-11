:: Only show output in console
@echo off

:: Record current directory
set OLDDIR=%CD%

:: Change to script file directory "%~dp0"
CD /d %~dp0

:: current folder
set CURRENT_DIR=%CD%

echo CURRENT_DIR=%CURRENT_DIR%

:: folder to extract nar file
set EXTRACT_FOLDER=%TEMP%\nar_ext_pkg
set EMAIL_SERVERICE_FOLDER=%EXTRACT_FOLDER%\email_service
set CONTENT_SERVICE_FOLDER=%EXTRACT_FOLDER%\content_service
set SESSION_SERVICE_FOLDER=%EXTRACT_FOLDER%\session_service

echo EMAIL_SERVERICE_FOLDER=%EMAIL_SERVERICE_FOLDER%
echo CONTENT_SERVICE_FOLDER=%CONTENT_SERVICE_FOLDER%
echo SESSION_SERVICE_FOLDER=%SESSION_SERVICE_FOLDER%
echo.

:: email-service
IF "%1" == "email-service" (

	IF EXIST %EMAIL_SERVERICE_FOLDER% (
		rmdir /S /Q %EMAIL_SERVERICE_FOLDER%
	)

	nar extract netis-email-service-1.0.0.nar -o %EMAIL_SERVERICE_FOLDER%
	node %EMAIL_SERVERICE_FOLDER%\www.js --config %CURRENT_DIR%\NetIS.Service.Email_dev.yml

	goto end
)

:: session-service
IF "%1" == "session-service" (

	IF EXIST %SESSION_SERVICE_FOLDER% (
		rmdir /S /Q %SESSION_SERVICE_FOLDER%
	)

	nar extract netis-session-service-1.0.0.nar -o %SESSION_SERVICE_FOLDER%
	node %SESSION_SERVICE_FOLDER%\www.js --config %CURRENT_DIR%\NetIS.Service.Session_dev.yml

	goto end
)

:: content-service
IF "%1" == "content-service" (

	IF EXIST %CONTENT_SERVICE_FOLDER% (
		rmdir /S /Q %CONTENT_SERVICE_FOLDER%
	)

	nar extract netis-content-service-0.1.0.nar -o %CONTENT_SERVICE_FOLDER%
	node %CONTENT_SERVICE_FOLDER%\www.js --config %CURRENT_DIR%\NetIS.Service.Content_dev.yml

	goto end
)

:: usage help
echo Usage run.bat <command> 
echo.
echo where command is one of:
echo email-service, content-service, session-service
echo.
echo Examples:
echo   ./run.bat email-service
echo   set PORT=3003 && ./run.bat content-service

:end
:: restore to old directory
chdir /d %OLDDIR%