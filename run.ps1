# Student Management System - Run Script (PowerShell)

# 1. Set up directories
$LibDir = "lib"
$BinDir = "bin"

$SrcDir = "src"

if (!(Test-Path $LibDir)) {
    New-Item -ItemType Directory -Path $LibDir | Out-Null
    Write-Host "Created $LibDir directory." -ForegroundColor Green
}

if (!(Test-Path $BinDir)) {
    New-Item -ItemType Directory -Path $BinDir | Out-Null
    Write-Host "Created $BinDir directory." -ForegroundColor Green
}

# 2. Download H2 Database Driver if not present
$H2Version = "2.3.232"
$H2Jar = "$LibDir/h2-$H2Version.jar"
$H2Url = "https://repo1.maven.org/maven2/com/h2database/h2/$H2Version/h2-$H2Version.jar"

if (!(Test-Path $H2Jar)) {
    Write-Host "H2 Driver not found. Downloading version $H2Version from Maven Central..." -ForegroundColor Yellow
    try {
        Invoke-WebRequest -Uri $H2Url -OutFile $H2Jar -UserAgent "Mozilla/5.0"
        Write-Host "Downloaded H2 Driver successfully." -ForegroundColor Green
    }
    catch {
        Write-Error "Failed to download H2 Database JAR from $H2Url. Please check your internet connection or download it manually and place it in the $LibDir folder."
        Exit 1
    }
} else {
    Write-Host "H2 Driver version $H2Version already exists in $LibDir." -ForegroundColor Green
}

# 3. Compile Java Source Files
Write-Host "Compiling Java source files..." -ForegroundColor Yellow

# Find all Java files
$JavaFiles = Get-ChildItem -Path $SrcDir -Filter *.java -Recurse | ForEach-Object { '"{0}"' -f $_.FullName }

if ($JavaFiles.Count -eq 0) {
    Write-Host "No Java files found to compile. Please verify that the src directory has files." -ForegroundColor Red
    Exit 1
}

# Compile command
$ClassPath = "lib/h2-$H2Version.jar"
$CompileCommand = "javac -cp `"$ClassPath`" -d $BinDir " + ($JavaFiles -join " ")

Write-Host "Running compilation..." -ForegroundColor Cyan
Invoke-Expression $CompileCommand

if ($LASTEXITCODE -ne 0) {
    Write-Host "Compilation failed!" -ForegroundColor Red
    Exit $LASTEXITCODE
}
Write-Host "Compilation successful." -ForegroundColor Green

# 4. Run the application
Write-Host "Starting Java HTTP Server..." -ForegroundColor Yellow
$RunCommand = "java -cp `"$BinDir;lib/h2-$H2Version.jar`" com.student.App"
Write-Host "Server running at http://localhost:8082" -ForegroundColor Green
Write-Host "Press Ctrl+C to stop the server." -ForegroundColor Gray

Invoke-Expression $RunCommand
