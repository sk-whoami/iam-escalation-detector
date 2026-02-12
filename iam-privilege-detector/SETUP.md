# Quick Setup Guide

## Prerequisites
- Python 3.8 or higher
- Node.js 16 or higher
- npm or yarn

## Installation (5 minutes)

### Method 1: Automated Setup (Recommended)

**For Linux/Mac:**
```bash
chmod +x start.sh
./start.sh
```

**For Windows:**
```bash
start.bat
```

This will automatically:
1. Create Python virtual environment
2. Install Python dependencies
3. Install Node.js dependencies
4. Start both backend and frontend servers

### Method 2: Manual Setup

**Terminal 1 - Backend:**
```bash
cd backend
pip install -r requirements.txt
python main.py
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## Access the Application

Once both servers are running:

- **Frontend (UI)**: http://localhost:3000
- **Backend (API)**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

## First Time Usage

1. Open http://localhost:3000
2. Click "Upload Data" in the sidebar
3. Click "Load Sample Data" to analyze the included sample IAM configuration
4. Navigate through the Dashboard, Graph View, and Risk Analysis pages

## Common Issues

### Port Already in Use

**Backend (Port 8000):**
```bash
# Find process using port 8000
lsof -i :8000  # Mac/Linux
netstat -ano | findstr :8000  # Windows

# Kill the process and restart
```

**Frontend (Port 3000):**
```bash
# Find process using port 3000
lsof -i :3000  # Mac/Linux
netstat -ano | findstr :3000  # Windows

# Kill the process and restart
```

### Python Dependencies Error
```bash
cd backend
pip install --upgrade pip
pip install -r requirements.txt
```

### Node Dependencies Error
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### API Not Responding

1. Check backend is running: http://localhost:8000/api/health
2. Should return: `{"status": "healthy"}`
3. Check terminal for error messages
4. Restart backend server

## Testing the API Directly

### Upload Sample Data
```bash
curl -X POST http://localhost:8000/api/upload \
  -F "file=@sample-data/sample-iam.json"
```

### Direct Analysis
```bash
curl -X POST http://localhost:8000/api/analyze \
  -H "Content-Type: application/json" \
  -d @sample-data/sample-iam.json
```

## Next Steps

1. ✅ Load sample data
2. ✅ Explore the dashboard
3. ✅ View interactive graph
4. ✅ Review risk analysis
5. ✅ Try uploading your own IAM configuration

## Stopping the Application

**Automated:**
- Press `Ctrl+C` in the terminal running `start.sh`

**Manual:**
- Press `Ctrl+C` in each terminal window

## Getting Help

Check the main README.md for:
- Detailed architecture
- API documentation
- IAM configuration format
- Advanced features
- Troubleshooting guide
