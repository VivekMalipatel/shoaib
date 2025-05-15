# Colors
$GREEN = "`e[32m"
$RED = "`e[31m"
$YELLOW = "`e[33m"
$NC = "`e[0m"

Write-Host "${YELLOW}Starting Frontend Setup Script${NC}"

# Check Node.js
if (!(Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "${RED}Node.js is not installed. Please install Node.js first.${NC}"
    exit 1
}

# Check npm
if (!(Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Host "${RED}npm is not installed. Please install npm first.${NC}"
    exit 1
}

Write-Host "${GREEN}Node.js and npm detected${NC}"

# Install dependencies
Write-Host "${YELLOW}Installing frontend dependencies...${NC}"
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "${RED}Failed to install dependencies. Check package.json and try again.${NC}"
    exit 1
}
Write-Host "${GREEN}Dependencies installed successfully${NC}"

# Test backend connection
$backendUrl = "http://20.106.33.167:5001/api/user"
Write-Host "${YELLOW}Testing backend connection at $backendUrl...${NC}"
$testResult = Test-NetConnection -ComputerName 20.106.33.167 -Port 5001
if ($testResult.TcpTestSucceeded) {
    Write-Host "${GREEN}Backend connection successful (port 5001 is open)${NC}"
} else {
    Write-Host "${RED}Could not connect to backend at $backendUrl (port 5001 may be blocked)${NC}"
}

# Run lint if defined
if (Get-Content package.json | Select-String '"lint"\s*:') {
    Write-Host "${YELLOW}Running linting...${NC}"
    npm run lint
    if ($LASTEXITCODE -ne 0) {
        $response = Read-Host "${RED}Linting failed. Do you want to continue? (y/n)"
        if ($response -notin @("y", "Y")) {
            exit 1
        }
    } else {
        Write-Host "${GREEN}Linting passed${NC}"
    }
}

# Run tests if defined
if (Get-Content package.json | Select-String '"test"\s*:') {
    Write-Host "${YELLOW}Running tests...${NC}"
    npm test -- --watchAll=false
    if ($LASTEXITCODE -ne 0) {
        $response = Read-Host "${RED}Tests failed. Do you want to continue? (y/n)"
        if ($response -notin @("y", "Y")) {
            exit 1
        }
    } else {
        Write-Host "${GREEN}Tests passed${NC}"
    }
}

# Start Vite dev server
Write-Host "${YELLOW}Starting frontend development server...${NC}"
Write-Host "${GREEN}The frontend will be available at http://localhost:5173${NC}"
Write-Host "${GREEN}API requests will be proxied to http://20.106.33.167:5001${NC}"
npm run dev

Write-Host "${RED}Frontend server has stopped${NC}"