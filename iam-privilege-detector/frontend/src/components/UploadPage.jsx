import { useState, useRef } from 'react';
import { Upload, FileJson, CheckCircle, AlertCircle, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function UploadPage() {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  const handleFileSelect = (e) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  const handleFile = async (file) => {
    setError(null);
    setSuccess(false);
    setUploading(true);

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      // Validate structure
      if (!data.users || !data.roles || !data.permissions) {
        throw new Error('Invalid IAM configuration format. Must contain users, roles, and permissions.');
      }

      // Send to API
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const result = await response.json();
      localStorage.setItem('analysisData', JSON.stringify(result));
      
      setSuccess(true);
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const loadSampleData = async () => {
    setError(null);
    setSuccess(false);
    setUploading(true);

    try {
      const response = await fetch('/sample-iam.json');
      const sampleData = await response.json();
      
      const analysisResponse = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sampleData)
      });
      
      const result = await analysisResponse.json();
      localStorage.setItem('analysisData', JSON.stringify(result));
      
      setSuccess(true);
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (err) {
      setError('Failed to load sample data');
    } finally {
      setUploading(false);
    }
  };

  const downloadSample = () => {
    const sampleData = {
      "users": [
        {
          "id": "user_001",
          "name": "example_user",
          "roles": ["role_001"]
        }
      ],
      "roles": [
        {
          "id": "role_001",
          "name": "example_role",
          "permissions": ["perm_001"],
          "inherits_from": []
        }
      ],
      "permissions": [
        {
          "id": "perm_001",
          "name": "read_access",
          "risk_level": "low"
        }
      ]
    };

    const blob = new Blob([JSON.stringify(sampleData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'iam-template.json';
    link.click();
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1 className="page-title">Upload IAM Configuration</h1>
        <p className="page-subtitle">Analyze your organization's identity and access management setup</p>
      </div>

      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div
          className={`upload-area ${dragging ? 'dragging' : ''}`}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />

          {uploading ? (
            <>
              <div className="loading-spinner" style={{ margin: '0 auto 16px' }}></div>
              <div className="upload-title">Analyzing configuration...</div>
            </>
          ) : success ? (
            <>
              <CheckCircle className="upload-icon" style={{ color: 'var(--low)' }} />
              <div className="upload-title" style={{ color: 'var(--low)' }}>Analysis Complete!</div>
              <div className="upload-subtitle">Redirecting to dashboard...</div>
            </>
          ) : (
            <>
              <Upload className="upload-icon" />
              <div className="upload-title">Drop your IAM configuration here</div>
              <div className="upload-subtitle">or click to browse files (JSON format)</div>
            </>
          )}
        </div>

        {error && (
          <div style={{
            marginTop: '20px',
            padding: '16px',
            background: 'rgba(255, 51, 102, 0.1)',
            border: '1px solid var(--critical)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            color: 'var(--critical)'
          }}>
            <AlertCircle size={20} />
            <div>{error}</div>
          </div>
        )}

        <div style={{ marginTop: '32px', textAlign: 'center' }}>
          <button className="btn btn-primary" onClick={loadSampleData} style={{ marginRight: '12px' }}>
            <FileJson size={16} />
            Load Sample Data
          </button>
          <button className="btn btn-secondary" onClick={downloadSample}>
            <Download size={16} />
            Download Template
          </button>
        </div>

        <div className="card" style={{ marginTop: '48px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
            Expected File Format
          </h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '16px', fontSize: '14px' }}>
            Your IAM configuration file should be in JSON format with the following structure:
          </p>
          <pre style={{
            background: 'var(--bg-tertiary)',
            padding: '20px',
            borderRadius: '12px',
            overflow: 'auto',
            fontSize: '13px',
            fontFamily: 'JetBrains Mono, monospace',
            color: 'var(--text-secondary)',
            lineHeight: '1.6'
          }}>
{`{
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
}`}
          </pre>
        </div>

        <div className="card" style={{ marginTop: '24px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
            What We Analyze
          </h3>
          <div style={{ display: 'grid', gap: '16px' }}>
            {[
              {
                title: 'Privilege Escalation Paths',
                description: 'Identifies chains of roles and permissions that could allow users to escalate privileges'
              },
              {
                title: 'Over-Privileged Accounts',
                description: 'Detects users with excessive access beyond the principle of least privilege'
              },
              {
                title: 'Conflicting Roles',
                description: 'Finds problematic combinations of roles that create security risks'
              },
              {
                title: 'Risk Scoring',
                description: 'Assigns severity levels based on exploitability and potential impact'
              }
            ].map((item, idx) => (
              <div key={idx} style={{ padding: '16px', background: 'var(--bg-tertiary)', borderRadius: '12px' }}>
                <div style={{ fontSize: '15px', fontWeight: '600', marginBottom: '4px', color: 'var(--text-primary)' }}>
                  {item.title}
                </div>
                <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                  {item.description}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
