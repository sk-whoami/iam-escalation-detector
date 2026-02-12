from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional, Set
import networkx as nx
import json
from collections import defaultdict
import uuid

app = FastAPI(title="IAM Privilege Escalation Detector")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models
class User(BaseModel):
    id: str
    name: str
    roles: List[str]

class Role(BaseModel):
    id: str
    name: str
    permissions: List[str]
    inherits_from: Optional[List[str]] = []

class Permission(BaseModel):
    id: str
    name: str
    risk_level: str  # low, medium, high, critical

class IAMData(BaseModel):
    users: List[User]
    roles: List[Role]
    permissions: List[Permission]

class EscalationPath(BaseModel):
    user_id: str
    user_name: str
    path: List[str]
    severity: str
    risk_score: int
    steps: int
    description: str
    remediation: str

class AnalysisResult(BaseModel):
    total_users: int
    total_roles: int
    total_permissions: int
    critical_risks: int
    high_risks: int
    medium_risks: int
    low_risks: int
    over_privileged_users: int
    escalation_paths: List[EscalationPath]
    graph_data: Dict

# Global storage
current_iam_data: Optional[IAMData] = None
current_graph: Optional[nx.DiGraph] = None

# Dangerous permissions that indicate high privilege
CRITICAL_PERMISSIONS = {
    'full_admin', 'modify_iam', 'delete_users', 'assign_roles',
    'create_admin', 'modify_security_policies', 'access_all_resources'
}

ESCALATION_PERMISSIONS = {
    'modify_groups', 'assign_self_admin', 'modify_roles',
    'create_roles', 'attach_policies', 'assume_role'
}

def build_graph(iam_data: IAMData) -> nx.DiGraph:
    """Build a directed graph representing IAM relationships"""
    G = nx.DiGraph()
    
    # Add users
    for user in iam_data.users:
        G.add_node(user.id, type='user', name=user.name, node_type='user')
    
    # Add roles
    for role in iam_data.roles:
        G.add_node(role.id, type='role', name=role.name, node_type='role')
    
    # Add permissions
    for perm in iam_data.permissions:
        G.add_node(perm.id, type='permission', name=perm.name, 
                   risk_level=perm.risk_level, node_type='permission')
    
    # Create edges: users -> roles
    for user in iam_data.users:
        for role_id in user.roles:
            G.add_edge(user.id, role_id, edge_type='has_role')
    
    # Create edges: roles -> permissions
    for role in iam_data.roles:
        for perm_id in role.permissions:
            G.add_edge(role.id, perm_id, edge_type='grants')
        
        # Role inheritance
        if role.inherits_from:
            for parent_role in role.inherits_from:
                G.add_edge(role.id, parent_role, edge_type='inherits')
    
    return G

def calculate_risk_score(path: List[str], G: nx.DiGraph) -> tuple:
    """Calculate risk score for an escalation path"""
    score = 0
    severity = "low"
    
    # Count critical permissions in path
    critical_count = 0
    escalation_count = 0
    
    for node in path:
        if G.nodes[node].get('type') == 'permission':
            perm_name = G.nodes[node].get('name', '')
            risk_level = G.nodes[node].get('risk_level', 'low')
            
            if perm_name in CRITICAL_PERMISSIONS:
                critical_count += 1
                score += 100
            elif perm_name in ESCALATION_PERMISSIONS:
                escalation_count += 1
                score += 50
            
            if risk_level == 'critical':
                score += 80
            elif risk_level == 'high':
                score += 50
            elif risk_level == 'medium':
                score += 25
    
    # Path length penalty (shorter escalation is worse)
    path_length = len([n for n in path if G.nodes[n].get('type') == 'role'])
    if path_length <= 2:
        score += 40
    elif path_length <= 4:
        score += 20
    
    # Determine severity
    if score >= 150 or critical_count >= 2:
        severity = "critical"
    elif score >= 100 or critical_count >= 1:
        severity = "high"
    elif score >= 50 or escalation_count >= 2:
        severity = "medium"
    else:
        severity = "low"
    
    return score, severity

def find_escalation_paths(G: nx.DiGraph, iam_data: IAMData) -> List[EscalationPath]:
    """Find all potential privilege escalation paths"""
    escalation_paths = []
    
    # For each user, find paths to critical permissions
    for user in iam_data.users:
        user_id = user.id
        
        # Get all permissions reachable from this user
        reachable_perms = set()
        try:
            for node in nx.descendants(G, user_id):
                if G.nodes[node].get('type') == 'permission':
                    reachable_perms.add(node)
        except:
            continue
        
        # Check for critical or escalation permissions
        critical_perms = []
        for perm_id in reachable_perms:
            perm_name = G.nodes[perm_id].get('name', '')
            if perm_name in CRITICAL_PERMISSIONS or perm_name in ESCALATION_PERMISSIONS:
                critical_perms.append(perm_id)
        
        # For each critical permission, find the path
        for target_perm in critical_perms:
            try:
                # Find shortest path
                path = nx.shortest_path(G, user_id, target_perm)
                
                # Build description
                path_description = []
                for i, node in enumerate(path):
                    node_type = G.nodes[node].get('type', '')
                    node_name = G.nodes[node].get('name', '')
                    
                    if node_type == 'user':
                        path_description.append(f"User: {node_name}")
                    elif node_type == 'role':
                        path_description.append(f"Role: {node_name}")
                    elif node_type == 'permission':
                        path_description.append(f"Permission: {node_name}")
                
                description = " → ".join(path_description)
                
                # Calculate risk
                risk_score, severity = calculate_risk_score(path, G)
                
                # Count steps (roles traversed)
                steps = len([n for n in path if G.nodes[n].get('type') == 'role'])
                
                # Generate remediation
                target_perm_name = G.nodes[target_perm].get('name', '')
                remediation = f"Remove '{target_perm_name}' permission from roles in escalation chain"
                
                if steps <= 2:
                    remediation = f"Direct escalation path detected. Consider implementing role separation and least-privilege principle. Remove '{target_perm_name}' from user's accessible roles."
                
                escalation_paths.append(EscalationPath(
                    user_id=user_id,
                    user_name=user.name,
                    path=path,
                    severity=severity,
                    risk_score=risk_score,
                    steps=steps,
                    description=description,
                    remediation=remediation
                ))
            except nx.NetworkXNoPath:
                continue
    
    # Sort by risk score
    escalation_paths.sort(key=lambda x: x.risk_score, reverse=True)
    
    return escalation_paths

def identify_over_privileged_users(G: nx.DiGraph, iam_data: IAMData) -> int:
    """Identify users with excessive permissions"""
    over_privileged = 0
    
    for user in iam_data.users:
        # Count direct permissions
        try:
            descendants = nx.descendants(G, user.id)
            perm_count = sum(1 for n in descendants if G.nodes[n].get('type') == 'permission')
            
            # If user has more than 10 permissions or 3+ roles, flag as over-privileged
            if perm_count > 10 or len(user.roles) > 3:
                over_privileged += 1
            
            # Check for critical permissions
            for node in descendants:
                if G.nodes[node].get('type') == 'permission':
                    perm_name = G.nodes[node].get('name', '')
                    if perm_name in CRITICAL_PERMISSIONS:
                        over_privileged += 1
                        break
        except:
            continue
    
    return over_privileged

def graph_to_cytoscape(G: nx.DiGraph) -> Dict:
    """Convert NetworkX graph to Cytoscape format"""
    elements = []
    
    # Add nodes
    for node, data in G.nodes(data=True):
        node_type = data.get('type', 'unknown')
        node_name = data.get('name', node)
        
        elements.append({
            'data': {
                'id': node,
                'label': node_name,
                'type': node_type,
                'risk_level': data.get('risk_level', 'low')
            }
        })
    
    # Add edges
    for source, target, data in G.edges(data=True):
        elements.append({
            'data': {
                'id': f"{source}-{target}",
                'source': source,
                'target': target,
                'type': data.get('edge_type', 'unknown')
            }
        })
    
    return {'elements': elements}

@app.post("/api/analyze")
async def analyze_iam(iam_data: IAMData):
    """Analyze IAM data for privilege escalation risks"""
    global current_iam_data, current_graph
    
    current_iam_data = iam_data
    
    # Build graph
    G = build_graph(iam_data)
    current_graph = G
    
    # Find escalation paths
    escalation_paths = find_escalation_paths(G, iam_data)
    
    # Count risks by severity
    critical_risks = sum(1 for ep in escalation_paths if ep.severity == 'critical')
    high_risks = sum(1 for ep in escalation_paths if ep.severity == 'high')
    medium_risks = sum(1 for ep in escalation_paths if ep.severity == 'medium')
    low_risks = sum(1 for ep in escalation_paths if ep.severity == 'low')
    
    # Identify over-privileged users
    over_privileged = identify_over_privileged_users(G, iam_data)
    
    # Convert graph for visualization
    graph_data = graph_to_cytoscape(G)
    
    result = AnalysisResult(
        total_users=len(iam_data.users),
        total_roles=len(iam_data.roles),
        total_permissions=len(iam_data.permissions),
        critical_risks=critical_risks,
        high_risks=high_risks,
        medium_risks=medium_risks,
        low_risks=low_risks,
        over_privileged_users=over_privileged,
        escalation_paths=escalation_paths,
        graph_data=graph_data
    )
    
    return result

@app.post("/api/upload")
async def upload_iam_file(file: UploadFile = File(...)):
    """Upload and parse IAM configuration file"""
    try:
        content = await file.read()
        data = json.loads(content)
        
        iam_data = IAMData(**data)
        return await analyze_iam(iam_data)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid file format: {str(e)}")

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}

@app.get("/")
async def root():
    """Root endpoint"""
    return {"message": "IAM Privilege Escalation Detector API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
