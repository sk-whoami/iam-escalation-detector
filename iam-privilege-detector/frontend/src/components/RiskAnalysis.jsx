import { useState, useEffect } from 'react';
import { AlertTriangle, TrendingUp, Target, Filter, Download, ChevronDown, ChevronUp } from 'lucide-react';

export default function RiskAnalysis() {
  const [analysis, setAnalysis] = useState(null);
  const [filter, setFilter] = useState('all');
  const [expandedRisks, setExpandedRisks] = useState(new Set());

  useEffect(() => {
    const analysisData = localStorage.getItem('analysisData');
    if (analysisData) {
      setAnalysis(JSON.parse(analysisData));
    }
  }, []);

  if (!analysis) {
    return (
      <div className="empty-state">
        <AlertTriangle className="empty-icon" />
        <div className="empty-title">No analysis data</div>
        <div className="empty-text">Upload an IAM configuration to view risk analysis</div>
      </div>
    );
  }

  const filteredRisks = filter === 'all' 
    ? analysis.escalation_paths
    : analysis.escalation_paths.filter(risk => risk.severity === filter);

  const toggleRisk = (index) => {
    const newExpanded = new Set(expandedRisks);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedRisks(newExpanded);
  };

  const exportReport = () => {
    const report = {
      generated_at: new Date().toISOString(),
      summary: {
        total_users: analysis.total_users,
        total_roles: analysis.total_roles,
        total_permissions: analysis.total_permissions,
        over_privileged_users: analysis.over_privileged_users,
        risk_distribution: {
          critical: analysis.critical_risks,
          high: analysis.high_risks,
          medium: analysis.medium_risks,
          low: analysis.low_risks
        }
      },
      escalation_paths: analysis.escalation_paths
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `iam-risk-report-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  return (
    <div className="fade-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Risk Analysis</h1>
          <p className="page-subtitle">Detailed privilege escalation paths and remediation guidance</p>
        </div>
        <button className="btn btn-primary" onClick={exportReport}>
          <Download size={16} />
          Export Report
        </button>
      </div>

      <div className="stats-grid" style={{ marginBottom: '32px' }}>
        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => setFilter('critical')}>
          <div className="stat-header">
            <div>
              <div className="stat-label">Critical</div>
              <div className="stat-value" style={{ color: 'var(--critical)' }}>{analysis.critical_risks}</div>
            </div>
            <div className="stat-icon" style={{ background: 'rgba(255, 51, 102, 0.1)', color: 'var(--critical)' }}>
              <AlertTriangle size={20} />
            </div>
          </div>
        </div>

        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => setFilter('high')}>
          <div className="stat-header">
            <div>
              <div className="stat-label">High</div>
              <div className="stat-value" style={{ color: 'var(--high)' }}>{analysis.high_risks}</div>
            </div>
            <div className="stat-icon" style={{ background: 'rgba(255, 136, 51, 0.1)', color: 'var(--high)' }}>
              <AlertTriangle size={20} />
            </div>
          </div>
        </div>

        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => setFilter('medium')}>
          <div className="stat-header">
            <div>
              <div className="stat-label">Medium</div>
              <div className="stat-value" style={{ color: 'var(--medium)' }}>{analysis.medium_risks}</div>
            </div>
            <div className="stat-icon" style={{ background: 'rgba(255, 204, 0, 0.1)', color: 'var(--medium)' }}>
              <AlertTriangle size={20} />
            </div>
          </div>
        </div>

        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => setFilter('low')}>
          <div className="stat-header">
            <div>
              <div className="stat-label">Low</div>
              <div className="stat-value" style={{ color: 'var(--low)' }}>{analysis.low_risks}</div>
            </div>
            <div className="stat-icon" style={{ background: 'rgba(0, 255, 136, 0.1)', color: 'var(--low)' }}>
              <AlertTriangle size={20} />
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
          <Filter size={20} style={{ color: 'var(--accent-cyan)' }} />
          <div style={{ display: 'flex', gap: '8px' }}>
            {['all', 'critical', 'high', 'medium', 'low'].map(level => (
              <button
                key={level}
                className={`btn ${filter === level ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setFilter(level)}
                style={{ textTransform: 'capitalize', padding: '8px 16px', fontSize: '13px' }}
              >
                {level}
              </button>
            ))}
          </div>
          <div style={{ marginLeft: 'auto', color: 'var(--text-muted)', fontSize: '14px' }}>
            Showing {filteredRisks.length} of {analysis.escalation_paths.length} risks
          </div>
        </div>
      </div>

      <div className="risk-list">
        {filteredRisks.map((risk, idx) => (
          <div key={idx} className="risk-item" onClick={() => toggleRisk(idx)}>
            <div className="risk-header">
              <div>
                <div className="risk-user">{risk.user_name}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px', fontFamily: 'JetBrains Mono, monospace' }}>
                  User ID: {risk.user_id}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span className={`severity-badge severity-${risk.severity}`}>
                  {risk.severity}
                </span>
                {expandedRisks.has(idx) ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </div>
            </div>

            <div className="risk-path" style={{ marginTop: '16px' }}>
              {risk.description}
            </div>

            <div className="risk-details" style={{ marginTop: '12px' }}>
              <div className="risk-score">
                <Target size={14} />
                Risk Score: {risk.risk_score}
              </div>
              <div className="risk-score">
                <TrendingUp size={14} />
                Escalation Steps: {risk.steps}
              </div>
            </div>

            {expandedRisks.has(idx) && (
              <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid var(--border-color)' }}>
                <div className="remediation-box">
                  <div className="remediation-title">
                    <AlertTriangle size={14} style={{ display: 'inline', marginRight: '8px' }} />
                    Remediation Recommendation
                  </div>
                  <div className="remediation-text">{risk.remediation}</div>
                </div>

                <div style={{ marginTop: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div style={{ background: 'var(--bg-tertiary)', padding: '16px', borderRadius: '12px' }}>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Attack Surface
                    </div>
                    <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                      This user can reach critical permissions through {risk.steps} intermediate role{risk.steps !== 1 ? 's' : ''}
                    </div>
                  </div>
                  <div style={{ background: 'var(--bg-tertiary)', padding: '16px', borderRadius: '12px' }}>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Priority
                    </div>
                    <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                      {risk.severity === 'critical' && 'Immediate action required - high exploitability'}
                      {risk.severity === 'high' && 'Address within 24-48 hours'}
                      {risk.severity === 'medium' && 'Review and remediate within 1 week'}
                      {risk.severity === 'low' && 'Schedule for next security review'}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        {filteredRisks.length === 0 && (
          <div className="empty-state">
            <AlertTriangle className="empty-icon" />
            <div className="empty-title">No risks found</div>
            <div className="empty-text">No escalation paths match the selected filter</div>
          </div>
        )}
      </div>
    </div>
  );
}
