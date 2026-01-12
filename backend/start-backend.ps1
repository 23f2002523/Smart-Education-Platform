# SmartEd - Start Backend Server
# Run this script from the backend directory

Write-Host "Starting SmartEd Backend Server..." -ForegroundColor Green

# Check if virtual environment is activated
if (-not $env:VIRTUAL_ENV) {
    Write-Host "Activating virtual environment..." -ForegroundColor Yellow
    $venvPath = Join-Path $PSScriptRoot ".." ".venv" "Scripts" "Activate.ps1"
    if (Test-Path $venvPath) {
        & $venvPath
    } else {
        Write-Host "Virtual environment not found. Please create it first." -ForegroundColor Red
        exit 1
    }
}

# Install dependencies if needed
Write-Host "Checking dependencies..." -ForegroundColor Yellow
pip install -q -r requirements.txt

# Start the Flask server
Write-Host "Starting Flask server on http://localhost:5000" -ForegroundColor Green
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
python app.py
