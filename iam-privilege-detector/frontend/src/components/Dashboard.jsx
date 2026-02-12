import { useEffect, useState } from 'react';
import { Users, Shield, AlertTriangle, Target, TrendingUp, Activity } from 'lucide-react';

export default function Dashboard() {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load sample data on mount
    loadSampleData();
  }, []);

  const loadSampleData = async () => {
    try {
      const response = await fetch('/sample-iam.json');
      const sampleData = await response.json();
      
      const analysisResponse = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sampleData)
      });
      
      const result = await analysisResponse.json();
      setAnalysis(result);
      localStorage.setItem('analysisData', JSON.stringify(result));
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <div className="loading-text">Analyzing IAM configuration...</div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="empty-state">
        <Shield className="empty-icon" />
        <div className="empty-title">No data loaded</div>
        <div className="empty-text">Upload an IAM configuration to get started</div>
      </div>
    );
  }

  const topRisks = analysis.escalation_paths.slice(0, 5);

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1 className="page-title">Security Dashboard</h1>
        <p className="page-subtitle">Real-time IAM privilege escalation monitoring and analysis</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <div>
              <div className="stat-label">Total Users</div>
              <div className="stat-value">{analysis.total_users}</div>
            </div>
            <div className="stat-icon">
              <Users size={20} />
            </div>
          </div>
          <div className="stat-change">
            <Activity size={14} />
            Active directory users
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div>
              <div className="stat-label">Roles Defined</div>
              <div className="stat-value">{analysis.total_roles}</div>
            </div>
            <div className="stat-icon">
              <Shield size={20} />
            </div>
          </div>
          <div className="stat-change">
            <Activity size={14} />
            IAM role assignments
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div>
              <div className="stat-label">Permissions</div>
              <div className="stat-value">{analysis.total_permissions}</div>
            </div>
            <div className="stat-icon">
              <Target size={20} />
            </div>
          </div>
          <div className="stat-change">
            <Activity size={14} />
            Unique permission policies
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div>
              <div className="stat-label">Over-Privileged</div>
              <div className="stat-value" style={{ color: 'var(--high)' }}>
                {analysis.over_privileged_users}
              </div>
            </div>
            <div className="stat-icon" style={{ background: 'rgba(255, 136, 51, 0.1)', color: 'var(--high)' }}>
              <TrendingUp size={20} />
            </div>
          </div>
          <div className="stat-change">
            <AlertTriangle size={14} />
            Requires review
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginBottom: '32px' }}>
        <div className="card">
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={20} style={{ color: 'var(--critical)' }} />
            Risk Distribution
          </h3>
          <div style={{ display: 'grid', gap: '16px' }}>
            {[
              { label: 'Critical', count: analysis.critical_risks, color: 'var(--critical)' },
              { label: 'High', count: analysis.high_risks, color: 'var(--high)' },
              { label: 'Medium', count: analysis.medium_risks, color: 'var(--medium)' },
              { label: 'Low', count: analysis.low_risks, color: 'var(--low)' }
            ].map(risk => (
              <div key={risk.label} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ minWidth: '80px', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)' }}>
                  {risk.label}
                </div>
                <div style={{ flex: 1, height: '32px', background: 'var(--bg-tertiary)', borderRadius: '8px', overflow: 'hidden', position: 'relative' }}>
                  <div style={{
                    width: `${(risk.count / analysis.escalation_paths.length) * 100}%`,
                    height: '100%',
                    background: risk.color,
                    transition: 'width 0.6s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    paddingRight: '12px'
                  }}>
                    {risk.count > 0 && (
                      <span style={{ fontSize: '13px', fontWeight: '600', color: 'white' }}>
                        {risk.count}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
            Quick Stats
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ padding: '16px', background: 'var(--bg-tertiary)', borderRadius: '12px' }}>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                Total Escalation Paths
              </div>
              <div style={{ fontSize: '28px', fontWeight: '700', fontFamily: 'JetBrains Mono, monospace' }}>
                {analysis.escalation_paths.length}
              </div>
            </div>
            <div style={{ padding: '16px', background: 'var(--bg-tertiary)', borderRadius: '12px' }}>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                Avg. Steps to Escalate
              </div>
              <div style={{ fontSize: '28px', fontWeight: '700', fontFamily: 'JetBrains Mono, monospace' }}>
                {analysis.escalation_paths.length > 0 
                  ? (analysis.escalation_paths.reduce((acc, ep) => acc + ep.steps, 0) / analysis.escalation_paths.length).toFixed(1)
                  : '0'}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Shield size={20} style={{ color: 'var(--critical)' }} />
          Top Critical Risks
        </h3>
        <div className="risk-list">
          {topRisks.map((risk, idx) => (
            <div key={idx} className="risk-item">
              <div className="risk-header">
                <div className="risk-user">{risk.user_name}</div>
                <span className={`severity-badge severity-${risk.severity}`}>
                  {risk.severity}
                </span>
              </div>
              <div className="risk-path">{risk.description}</div>
              <div className="risk-details">
                <div className="risk-score">
                  <Target size={14} />
                  Risk Score: {risk.risk_score}
                </div>
                <div className="risk-score">
                  <TrendingUp size={14} />
                  {risk.steps} steps to escalate
                </div>
              </div>
              <div className="remediation-box">
                <div className="remediation-title">Recommended Action</div>
                <div className="remediation-text">{risk.remediation}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
