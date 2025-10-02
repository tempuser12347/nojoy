@echo off
REM Change to the directory of this batch file
cd /d "%~dp0"

REM Go into backend folder
cd backend

REM Install dependencies
pip install -r requirements.txt

REM Run Python script
python run.py

REM Keep window open at the end (optional)
pause
