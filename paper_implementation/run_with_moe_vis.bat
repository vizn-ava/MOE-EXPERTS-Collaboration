@echo off
chcp 65001 >nul
echo Activating moe_vis virtual environment...
call D:\conda\envs\moe_vis\Scripts\activate.bat

echo Current Python environment:
python --version
echo.

echo Available scripts:
echo 1. expert_analysis.py - Expert analysis script
echo 2. analyze_data.py - Data analysis script  
echo 3. calculate_focus_score.py - Focus score calculation script
echo 4. generate_simple_radar.py - Radar chart generation script
echo.

if "%1"=="" (
    echo Usage: run_with_moe_vis.bat [script_name]
    echo Example: run_with_moe_vis.bat expert_analysis.py
    pause
    exit /b 1
)

echo Running script: %1
python %1

if %errorlevel% neq 0 (
    echo Script failed with error code: %errorlevel%
    pause
    exit /b %errorlevel%
)

echo Script completed successfully!
pause