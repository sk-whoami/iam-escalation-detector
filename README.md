# 🛡 IAM Guardian Project

## Privilege Escalation Detection & IAM Risk Analysis Platform

A web-based platform that analyses user roles and permissions within a simulated organisation to identify privilege escalation paths, excessive access, and high-risk misconfigurations.

---

## 🔍 What It Does

- **Ingests IAM data** — users, roles, permissions, and trust relationships (JSON)
- **Builds a permission graph** — models access relationships as a directed graph
- **Detects escalation paths** — finds how a low-privilege user could reach admin access
- **Identifies over-privileged accounts** — flags users with excessive permissions
- **Generates risk reports** — severity scoring with remediation recommendations

### Example Output

```
User: intern_user → Role: support_staff → Inherited Permission: modify_groups →
Escalation Path: assign_self_admin → Full system access achievable in 3 steps.
Severity: Critical.
```

---

## 🏗 Architecture

```
Policy JSON upload → Permission Modelling → Graph Construction →
Escalation Path Analysis → Risk Scoring → Dashboard Output
```

| Layer | Technology |
|-------|-----------|
| Backend API | Flask / FastAPI |
| Graph Modelling | Python NetworkX |
| Frontend | HTML / CSS / JavaScript |
| Data Format | JSON |

---

## 🚀 Quick Start

### Prerequisites

- Python 3.8+
- pip

### Installation

```bash
# Clone the repository
git clone https://github.com/sk-whoami/iam-escalation-detector.git
cd iam-escalation-detector

# Install dependencies
pip install -r requirements.txt

# Run the application
python app.py
```

Then open `http://localhost:5000` in your browser.

---

## 📁 Project Structure

```
iam-escalation-detector/
├── app.py                  # Flask application entry point
├── requirements.txt        # Python dependencies
├── data/
│   └── iam_dataset.json    # Sample IAM dataset
├── core/
│   ├── graph_builder.py    # Builds permission graph using NetworkX
│   ├── escalation.py       # Escalation path detection logic
│   └── risk_scorer.py      # Risk severity scoring
├── templates/
│   └── index.html          # Frontend dashboard
├── static/
│   ├── style.css           # Styling
│   └── script.js           # Frontend logic
└── README.md
```

---

## 📊 Sample Dataset

The included `data/iam_dataset.json` contains a simulated organisation with:

- **10 users** across different departments
- **6 roles** with varying privilege levels
- **15+ permissions** including sensitive operations
- **Role inheritance** and trust relationships
- **Deliberate misconfigurations** that create escalation paths

---

## 🔐 How Escalation Detection Works

1. **Graph Construction** — Users, roles, and permissions are modelled as nodes. Edges represent assignments and inheritance.
2. **Path Discovery** — Graph traversal algorithms (BFS/DFS) find all paths from low-privilege nodes to high-privilege nodes (e.g., admin permissions).
3. **Risk Scoring** — Each path is scored based on:
   - Number of steps to reach admin
   - Sensitivity of permissions along the path
   - Number of users affected
4. **Reporting** — Results are displayed with severity labels (Critical / High / Medium / Low) and remediation steps.

---

## 🎯 MITRE ATT&CK Mapping

| Technique ID | Name | Relevance |
|-------------|------|-----------|
| T1078 | Valid Accounts | Compromised low-privilege accounts |
| T1098 | Account Manipulation | Modifying group memberships |
| T1136 | Create Account | Ability to create new privileged accounts |
| T1548 | Abuse Elevation Control | Bypassing access controls |

---

## 👥 Team

Built during Cyberthon 2026 Hackathon.

---

## 📄 License

MIT License
