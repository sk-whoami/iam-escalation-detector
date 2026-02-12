# IAM Privilege Escalation Detector

**Cyberthon 2025 - Problem Statement 2**

A professional web-based platform that analyzes Identity and Access Management (IAM) configurations to identify privilege escalation paths, excessive access, and high-risk misconfigurations.

![Dashboard Preview](docs/dashboard.png)

## 🎯 Features

### Core Capabilities
- **Privilege Escalation Detection**: Identifies attack chains from low-privilege to high-privilege access
- **Risk Scoring**: Assigns severity levels (Critical/High/Medium/Low) based on exploitability
- **Interactive Graph Visualization**: Network diagram showing users, roles, and permissions relationships
- **Over-Privileged Account Detection**: Flags users with excessive permissions
- **Detailed Risk Reports**: Structured analysis with remediation recommendations
- **Real-time Analysis**: Instant processing of IAM configurations

### Analysis Features
- Graph-based permission modeling
- Role inheritance tracking
- Conflicting role detection
- Least-privilege compliance scoring
- Multi-step escalation path discovery
- Attack surface visualization

### Technical Highlights
- **Backend**: FastAPI with NetworkX for graph algorithms
- **Frontend**: React with professional cybersecurity-themed UI
- **Visualization**: Cytoscape.js for interactive network graphs
- **Data Format**: JSON-based IAM policy ingestion

## 📋 Requirements

### Backend
- Python 3.8+
- pip

### Frontend
- Node.js 16+
- npm or yarn

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd iam-privilege-detector
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
pip install -r requirements.txt

# Start the API server
python main.py
```

The backend API will be available at `http://localhost:8000`

### 3. Frontend Setup

```bash
# Navigate to frontend directory (in a new terminal)
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will be available at `http://localhost:3000`

## 📊 Sample Data

A sample IAM configuration is included in `sample-data/sample-iam.json` with:
- 7 users with varying privilege levels
- 9 roles with inheritance relationships
- 23 permissions with different risk levels
- Multiple privilege escalation scenarios

### Loading Sample Data

**Option 1**: Via UI
1. Open the application at `http://localhost:3000`
2. Navigate to "Upload Data"
3. Click "Load Sample Data"

**Option 2**: Via API
```bash
curl -X POST http://localhost:8000/api/upload \
  -H "Content-Type: multipart/form-data" \
  -F "file=@sample-data/sample-iam.json"
```

## 🗂️ IAM Configuration Format

Your IAM configuration file should be JSON with this structure:

```json
{
  "users": [
    {
      "id": "user_001",
      "name": "username",
      "roles": ["role_id_1", "role_id_2"]
    }
  ],
  "roles": [
    {
      "id": "role_001",
      "name": "role_name",
      "permissions": ["perm_id_1"],
      "inherits_from": ["parent_role_id"]
    }
  ],
  "permissions": [
    {
      "id": "perm_001",
      "name": "permission_name",
      "risk_level": "low|medium|high|critical"
    }
  ]
}
```

### Field Descriptions

**Users**:
- `id`: Unique identifier
- `name`: Display name
- `roles`: Array of role IDs assigned to this user

**Roles**:
- `id`: Unique identifier
- `name`: Display name
- `permissions`: Array of permission IDs
- `inherits_from`: Optional array of parent role IDs

**Permissions**:
- `id`: Unique identifier
- `name`: Permission name (e.g., 'full_admin', 'read_docs')
- `risk_level`: One of 'low', 'medium', 'high', 'critical'

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Frontend (React)                    │
│  - Dashboard        - Graph View      - Risk Analysis   │
│  - Upload Interface - Visualization   - Reports         │
└────────────────┬────────────────────────────────────────┘
                 │
                 │ REST API
                 │
┌────────────────▼────────────────────────────────────────┐
│              Backend (FastAPI + NetworkX)               │
│  - IAM Parser         - Graph Construction              │
│  - Escalation Detector - Risk Scoring                   │
│  - Path Analysis      - Report Generation               │
└─────────────────────────────────────────────────────────┘
```

### Component Breakdown

**Frontend** (`/frontend`):
- `src/App.jsx`: Main application with routing
- `src/components/Dashboard.jsx`: Overview and statistics
- `src/components/GraphView.jsx`: Interactive network visualization
- `src/components/RiskAnalysis.jsx`: Detailed risk table
- `src/components/UploadPage.jsx`: File upload interface
- `src/App.css`: Professional cybersecurity theme

**Backend** (`/backend`):
- `main.py`: FastAPI application with analysis logic
- Graph construction using NetworkX
- BFS/DFS algorithms for path discovery
- Risk scoring methodology

## 🔍 How It Works

### 1. Data Ingestion
- Upload JSON file containing users, roles, and permissions
- Parse and validate IAM configuration
- Build internal data structures

### 2. Graph Construction
- Create directed graph with three node types:
  - **Users** (starting points)
  - **Roles** (intermediate relationships)
  - **Permissions** (target privileges)
- Establish edges for:
  - User → Role assignments
  - Role → Permission grants
  - Role → Role inheritance

### 3. Escalation Detection
- For each user, traverse graph to find reachable permissions
- Identify paths to critical/high-risk permissions
- Calculate shortest escalation chains
- Detect over-privileged accounts (>10 permissions or 3+ roles)

### 4. Risk Scoring
Risk scores are calculated based on:
- **Permission Criticality**: Critical permissions (+100 points)
- **Escalation Permissions**: Permissions that enable further escalation (+50 points)
- **Path Length**: Shorter paths are more dangerous (+40 for ≤2 steps)
- **Risk Level**: Permission's inherent risk (+80 critical, +50 high, +25 medium)

Severity levels:
- **Critical**: Score ≥150 or 2+ critical permissions
- **High**: Score ≥100 or 1+ critical permission
- **Medium**: Score ≥50 or 2+ escalation permissions
- **Low**: Score <50

### 5. Reporting
- Generate structured risk reports
- Provide remediation recommendations
- Export analysis results

## 📸 Screenshots

### Dashboard
Real-time overview of IAM security posture with risk distribution and key metrics.

### Graph Visualization
Interactive network diagram showing user-role-permission relationships with color-coded risk levels.

### Risk Analysis
Detailed table of escalation paths with severity levels, risk scores, and remediation guidance.

## 🛠️ API Endpoints

### `POST /api/analyze`
Analyze IAM configuration and return risk assessment.

**Request Body**:
```json
{
  "users": [...],
  "roles": [...],
  "permissions": [...]
}
```

**Response**:
```json
{
  "total_users": 7,
  "total_roles": 9,
  "total_permissions": 23,
  "critical_risks": 3,
  "high_risks": 5,
  "medium_risks": 8,
  "low_risks": 2,
  "over_privileged_users": 2,
  "escalation_paths": [...],
  "graph_data": {...}
}
```

### `POST /api/upload`
Upload and analyze IAM configuration file.

**Request**: Multipart form data with JSON file

**Response**: Same as `/api/analyze`

### `GET /api/health`
Health check endpoint.

**Response**:
```json
{
  "status": "healthy"
}
```

## 🎨 Design Philosophy

The UI follows a professional cybersecurity aesthetic:
- **Dark theme** optimized for security operations centers
- **Color-coded severity levels** (red/orange/yellow/green)
- **Monospace fonts** for technical data (JetBrains Mono)
- **Clean typography** for readability (Sora)
- **Cyan accents** for interactive elements
- **Minimal, focused interface** prioritizing actionable information

## 🔒 Security Considerations

This tool is designed for **security analysis and testing purposes only**. 

### Production Deployment Recommendations:
- Implement authentication and authorization
- Add rate limiting
- Enable HTTPS/TLS
- Sanitize and validate all inputs
- Add audit logging
- Implement data retention policies
- Review and test with security team

## 🚢 Building for Production

### Frontend
```bash
cd frontend
npm run build
```

Built files will be in `frontend/dist/`

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000
```

## 📝 Example Use Cases

### 1. Security Audit
Upload your organization's IAM configuration to:
- Identify privilege escalation risks
- Find over-privileged accounts
- Validate least-privilege compliance

### 2. Incident Response
Quickly analyze:
- How an attacker could escalate from compromised low-privilege account
- Which users have paths to critical systems
- What permissions enable lateral movement

### 3. Compliance Validation
Verify:
- Role separation is properly enforced
- No users have excessive combined permissions
- Critical permissions require multiple approval steps

### 4. Security Training
Demonstrate:
- How privilege escalation works
- Impact of misconfigurations
- Importance of least-privilege principle

## 🤝 Contributing

This project was developed for Cyberthon 2025. Contributions, issues, and feature requests are welcome!

## 📄 License

This project is provided as-is for educational and security testing purposes.

## 🏆 Cyberthon 2025

**Problem Statement**: Privilege Escalation Detection & IAM Risk Analysis Platform

**Team**: [Your Team Name]

**Judging Criteria Addressed**:
- ✅ **Innovation (20%)**: Graph-based modeling with intelligent risk scoring
- ✅ **Technical Implementation (35%)**: Clean architecture, NetworkX algorithms, React UI
- ✅ **Security Accuracy (35%)**: Realistic escalation detection, valid risk assessment
- ✅ **Presentation (10%)**: Professional UI, clear documentation, demo-ready

## 📞 Support

For questions or issues:
- Check the documentation
- Review sample data format
- Verify API is running on port 8000
- Ensure frontend proxy is configured correctly

## 🙏 Acknowledgments

- **NetworkX**: Graph algorithms library
- **FastAPI**: Modern Python web framework
- **Cytoscape.js**: Graph visualization library
- **React**: UI framework
- **MITRE ATT&CK**: Privilege escalation techniques reference
