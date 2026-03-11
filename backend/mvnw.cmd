@ECHO OFF
SETLOCAL

SET "MAVEN_PROJECTBASEDIR=%~dp0"
IF "%MAVEN_PROJECTBASEDIR:~-1%"=="\" SET "MAVEN_PROJECTBASEDIR=%MAVEN_PROJECTBASEDIR:~0,-1%"

SET "WRAPPER_JAR=%MAVEN_PROJECTBASEDIR%\.mvn\wrapper\maven-wrapper.jar"
SET "WRAPPER_LAUNCHER=org.apache.maven.wrapper.MavenWrapperMain"

WHERE java >NUL 2>NUL
IF ERRORLEVEL 1 (
  ECHO Error: Java not found in PATH.
  EXIT /B 1
)

IF NOT EXIST "%WRAPPER_JAR%" (
  ECHO Error: Maven wrapper jar not found at "%WRAPPER_JAR%".
  EXIT /B 1
)

java ^
  "-Dmaven.multiModuleProjectDirectory=%MAVEN_PROJECTBASEDIR%" ^
  -classpath "%WRAPPER_JAR%" ^
  %WRAPPER_LAUNCHER% ^
  %*

EXIT /B %ERRORLEVEL%