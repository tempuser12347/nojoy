@echo off
echo 🏗️  Building executable with PyInstaller...
pyinstaller --onefile --distpath=pyexe/ run.py

if %ERRORLEVEL% neq 0 (
    echo ❌  Build failed!
    pause
    exit /b %ERRORLEVEL%
)

echo ✅  Build succeeded!
echo 📦  Copying executable to parent folder...
copy /Y "pyexe\run.exe" "..\run.exe"

if %ERRORLEVEL% neq 0 (
    echo ❌  Copy failed!
    pause
    exit /b %ERRORLEVEL%
)

echo 🎉  Done! Executable is ready: ..\run.exe
pause
