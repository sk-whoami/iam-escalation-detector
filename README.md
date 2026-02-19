# 🛡 IAM Guardian

## Privilege Escalation Detection & IAM Risk Analysis Platform

A web-based platform that analyses user roles and permissions within a simulated organisation to identify privilege escalation paths, excessive access, and high-risk misconfigurations.

-----

## 🔍 What It Does

- **Ingests IAM data** — users, roles, permissions, and trust relationships (JSON)
- **Builds a permission graph** — models access relationships as a directed graph
- **Detects escalation paths** — finds how a low-privilege user could reach admin access
- **Identifies over-privileged accounts** — flags users with excessive permissions
- **Analyses attack vectors** — maps findings to real-world threat scenarios
- **Generates risk reports** — severity scoring with remediation recommendations

### Example Output

```
User: intern_user → Role: support_staff → Inherited Permission: modify_groups →
Escalation Path: assign_self_admin → Full system access achievable in 3 steps.
Severity: Critical.
```

-----

## 🏗 Architecture

```
JSON Upload → Permission Modelling (Pydantic) → Graph Construction (NetworkX) →
Escalation Path Analysis (BFS/DFS) → Risk Scoring → React Dashboard
```

|Layer          |Technology      |
|---------------|----------------|
|Backend API    |FastAPI (Python)|
|Graph Engine   |NetworkX        |
|Data Validation|Pydantic        |
|Frontend       |React + Vite    |
|Data Format    |JSON            |

-----

## 🚀 Quick Start

### Prerequisites

- Python 3.8+
- Node.js 16+
- pip and npm

### Installation

```bash
# Clone the repository
git clone https://github.com/sk-whoami/iam-escalation-detector.git
cd iam-escalation-detector/iam-privilege-detector

# Install and run the backend
cd backend
pip install fastapi uvicorn networkx pydantic python-multipart
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000

# In a new terminal — install and run the frontend
cd frontend
npm install
npm run dev
```

Then open `http://localhost:3000` in your browser.

-----

## 📁 Project Structure

```
iam-privilege-detector/
├── backend/
│   └── main.py              # FastAPI app with graph logic and API endpoints
├── frontend/
│   ├── src/
│   │   ├── App.jsx           # Main React application
│   │   ├── App.css           # Styling
│   │   └── components/       # UI components
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── sample-data/
│   ├── sample-iam.json       # Sample IAM dataset
│   └── complex-escalation.json
├── README.md
├── PROJECT_OVERVIEW.md
├── SETUP.md
├── start.sh                  # Mac/Linux start script
└── start.bat                 # Windows start script
```

-----

## 🔐 How Escalation Detection Works

1. **Graph Construction** — Users, roles, and permissions are modelled as nodes in a directed graph. Edges represent role assignments and permission inheritance.
1. **Path Discovery** — Graph traversal algorithms find all paths from low-privilege nodes to high-privilege targets such as admin permissions.
1. **Risk Scoring** — Each escalation path is scored based on the number of steps to reach admin, the sensitivity of permissions along the path, and the number of affected users.
1. **Reporting** — Results are displayed on an interactive dashboard with severity labels (Critical / High / Medium / Low) and remediation steps.

-----

## 📊 Dashboard Pages

- **Dashboard** — Overview of total users, roles, permissions, over-privileged accounts, and risk distribution
- **Upload Data** — Upload custom IAM datasets (JSON) for analysis
- **Graph View** — Interactive visual map of users, roles, and permission relationships
- **Attack Vectors** — Identified threat scenarios including privilege escalation, lateral movement, permission abuse, data exfiltration, and deployment tampering
- **Risk Analysis** — Detailed per-user escalation paths with severity and remediation

-----

## 🎯 MITRE ATT&CK Mapping

|Technique ID|Name                   |Relevance                                |
|------------|-----------------------|-----------------------------------------|
|T1078       |Valid Accounts         |Compromised low-privilege accounts       |
|T1098       |Account Manipulation   |Modifying group memberships              |
|T1136       |Create Account         |Ability to create new privileged accounts|
|T1548       |Abuse Elevation Control|Bypassing access controls                |

-----

## 👥 Team

Built during Cyberthon 2026 — BCU Cyber Security Society Hackathon at STEAMhouse.

-----

## 📄 License

MIT License
