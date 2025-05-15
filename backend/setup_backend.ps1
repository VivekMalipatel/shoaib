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

# Run test_db.py
Write-Host "Testing database connection..."
python test_db.py
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Database connection failed. Please check your .env file and ensure PostgreSQL is running."
    exit 1
}

# Check if tables exist
Write-Host "Checking if database tables exist..."
python check_tables.py
$DB_STATUS = $LASTEXITCODE

$DB_STATUS = $LASTEXITCODE

# If tables don't exist, run create_db.py
if ($DB_STATUS -eq 2) {
    Write-Host "Creating database tables..."
    python create_db.py

    $seed = Read-Host "Would you like to seed the database with sample data? (y/n)"
    if ($seed -eq "y" -or $seed -eq "Y") {
        Write-Host "Seeding database with sample data..."
        python seed_db.py
    }
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