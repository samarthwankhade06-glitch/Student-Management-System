@echo off
REM Student Management System - Run Script (Batch)

setlocal enabledelayedexpansion

set LibDir=lib
set BinDir=bin
set SrcDir=src
set H2Version=2.3.232
set H2Jar=%LibDir%\h2-%H2Version%.jar
set H2Url=https://repo1.maven.org/maven2/com/h2database/h2/%H2Version%/h2-%H2Version%.jar

REM 1. Create directories if they don't exist
if not exist "%LibDir%" (
    mkdir "%LibDir%"
    echo Created %LibDir% directory.
)

if not exist "%BinDir%" (
    mkdir "%BinDir%"
    echo Created %BinDir% directory.
)

REM 2. Download H2 Database Driver if not present
if not exist "%H2Jar%" (
    echo H2 Driver not found. Downloading version %H2Version% from Maven Central...
    powershell -Command "try { Invoke-WebRequest -Uri '%H2Url%' -OutFile '%H2Jar%' -UserAgent 'Mozilla/5.0' } catch { exit 1 }"
    if !errorlevel! neq 0 (
        echo Failed to download H2 Database JAR.
        exit /b 1
    )
    echo Downloaded H2 Driver successfully.
) else (
    echo H2 Driver version %H2Version% already exists in %LibDir%.
)

REM 3. Compile Java Source Files
echo Compiling Java source files...

if not exist "%SrcDir%" (
    echo No src directory found.
    exit /b 1
)

REM Get all Java files
setlocal enabledelayedexpansion
set "javafiles="
for /r "%SrcDir%" %%F in (*.java) do (
    set "javafiles=!javafiles! "%%F""
)

if "!javafiles!"=="" (
    echo No Java files found to compile.
    exit /b 1
)

set ClassPath=%LibDir%\h2-%H2Version%.jar
echo Running compilation with classpath: %ClassPath%

javac -cp "%ClassPath%" -d "%BinDir%" !javafiles!

if !errorlevel! neq 0 (
    echo Compilation failed!
    exit /b !errorlevel!
)

echo Compilation successful.

REM 4. Run the application
echo Starting Java HTTP Server...
set RunCommand=java -cp "%BinDir%;%LibDir%\h2-%H2Version%.jar" com.student.App
echo Server running at http://localhost:8082
echo Press Ctrl+C to stop the server.

%RunCommand%

endlocal
