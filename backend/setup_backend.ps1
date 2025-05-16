Write-Host "===== Backend Setup and Deployment Script (Windows) ====="

# Set error preference
$ErrorActionPreference = "Stop"

# Create virtual environment if it doesn't exist
if (!(Test-Path ".venv")) {
    Write-Host "Creating virtual environment..."
    python -m venv .venv
} else {
    Write-Host "Virtual environment already exists."
}

# Activate virtual environment
Write-Host "Activating virtual environment..."
& .\.venv\Scripts\Activate.ps1

# Install dependencies
Write-Host "Installing dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

# Check for .env file
if (!(Test-Path ".env")) {
    Write-Host "Creating .env file with default settings..."
@"
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/docdb
SECRET_KEY=production-secret-key
JWT_SECRET_KEY=production-jwt-secret-key
"@ | Out-File -Encoding UTF8 .env
    Write-Host ".env file created. Please update it with your actual database credentials."
    exit 1
}

# Ensure database exists
Write-Host "Ensuring database exists..."
try {
    python create_db.py
} catch {
    Write-Host "❌ Failed to ensure database exists. Exiting."
    exit 1
}

# Seed the database
Write-Host "Seeding the database with test data..."
try {
    python seed_db.py
} catch {
    Write-Host "❌ Failed to seed the database. Exiting."
    exit 1
}

# Start the Flask server
Write-Host "Starting the Flask application server..."
$env:FLASK_APP = "run.py"
$env:FLASK_ENV = "production"

# Get port from arguments or use default
if ($args.Count -ge 1) {
    $port = $args[0]
} else {
    $port = "5001"
}

Write-Host "Server is starting on port $port..."
$env:PORT = $port
python run.py