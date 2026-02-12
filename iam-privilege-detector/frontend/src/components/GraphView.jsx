import { useEffect, useRef, useState } from 'react';
import cytoscape from 'cytoscape';
import cola from 'cytoscape-cola';
import { ZoomIn, ZoomOut, Maximize2, Download, User, Shield as ShieldIcon, Lock } from 'lucide-react';

cytoscape.use(cola);

export default function GraphView() {
  const cyRef = useRef(null);
  const containerRef = useRef(null);
  const [selectedNode, setSelectedNode] = useState(null);

  useEffect(() => {
    const analysisData = localStorage.getItem('analysisData');
    if (!analysisData || !containerRef.current) return;

    const analysis = JSON.parse(analysisData);
    const graphData = analysis.graph_data;

    const cy = cytoscape({
      container: containerRef.current,
      elements: graphData.elements,
      style: [
        {
          selector: 'node',
          style: {
            'background-color': (ele) => {
              const type = ele.data('type');
              if (type === 'user') return '#00d4ff';
              if (type === 'role') return '#7c3aed';
              if (type === 'permission') {
                const risk = ele.data('risk_level');
                if (risk === 'critical') return '#ff3366';
                if (risk === 'high') return '#ff8833';
                if (risk === 'medium') return '#ffcc00';
                return '#00ff88';
              }
              return '#6b7794';
            },
            'label': 'data(label)',
            'color': '#e8edf4',
            'font-size': '10px',
            'text-valign': 'center',
            'text-halign': 'center',
            'text-wrap': 'wrap',
            'text-max-width': '80px',
            'width': (ele) => {
              const type = ele.data('type');
              if (type === 'user') return 40;
              if (type === 'role') return 35;
              return 30;
            },
            'height': (ele) => {
              const type = ele.data('type');
              if (type === 'user') return 40;
              if (type === 'role') return 35;
              return 30;
            },
            'border-width': 2,
            'border-color': (ele) => {
              const type = ele.data('type');
              if (type === 'user') return '#00d4ff';
              if (type === 'role') return '#7c3aed';
              return 'transparent';
            },
            'font-family': 'JetBrains Mono, monospace',
            'font-weight': '600'
          }
        },
        {
          selector: 'edge',
          style: {
            'width': 2,
            'line-color': '#2a3650',
            'target-arrow-color': '#2a3650',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
            'arrow-scale': 1.2
          }
        },
        {
          selector: ':selected',
          style: {
            'border-width': 3,
            'border-color': '#00d4ff',
            'overlay-color': '#00d4ff',
            'overlay-opacity': 0.2,
            'overlay-padding': 4
          }
        }
      ],
      layout: {
        name: 'cola',
        animate: true,
        randomize: false,
        maxSimulationTime: 2000,
        nodeSpacing: 80,
        edgeLength: 120,
        convergenceThreshold: 0.01
      },
      minZoom: 0.3,
      maxZoom: 3,
      wheelSensitivity: 0.2
    });

    cyRef.current = cy;

    // Add click handler
    cy.on('tap', 'node', (evt) => {
      const node = evt.target;
      setSelectedNode({
        id: node.data('id'),
        label: node.data('label'),
        type: node.data('type'),
        risk_level: node.data('risk_level')
      });
    });

    cy.on('tap', (evt) => {
      if (evt.target === cy) {
        setSelectedNode(null);
      }
    });

    return () => {
      if (cyRef.current) {
        cyRef.current.destroy();
      }
    };
  }, []);

  const handleZoomIn = () => {
    if (cyRef.current) {
      cyRef.current.zoom(cyRef.current.zoom() * 1.2);
    }
  };

  const handleZoomOut = () => {
    if (cyRef.current) {
      cyRef.current.zoom(cyRef.current.zoom() * 0.8);
    }
  };

  const handleFit = () => {
    if (cyRef.current) {
      cyRef.current.fit(undefined, 50);
    }
  };

  const handleExport = () => {
    if (cyRef.current) {
      const png = cyRef.current.png({ full: true, scale: 2 });
      const link = document.createElement('a');
      link.href = png;
      link.download = 'iam-graph.png';
      link.click();
    }
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1 className="page-title">IAM Relationship Graph</h1>
        <p className="page-subtitle">Interactive visualization of users, roles, and permissions</p>
      </div>

      <div className="graph-container">
        <div ref={containerRef} className="graph-canvas"></div>
        
        <div className="graph-legend">
          <div className="legend-title">Legend</div>
          <div className="legend-item">
            <div className="legend-color" style={{ background: '#00d4ff' }}></div>
            <span>Users</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ background: '#7c3aed' }}></div>
            <span>Roles</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ background: '#ff3366' }}></div>
            <span>Critical Permissions</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ background: '#ff8833' }}></div>
            <span>High Risk Permissions</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ background: '#ffcc00' }}></div>
            <span>Medium Risk Permissions</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ background: '#00ff88' }}></div>
            <span>Low Risk Permissions</span>
          </div>
        </div>

        <div style={{ position: 'absolute', bottom: '24px', left: '24px', display: 'flex', gap: '8px' }}>
          <button className="btn btn-secondary" onClick={handleZoomIn} title="Zoom In">
            <ZoomIn size={16} />
          </button>
          <button className="btn btn-secondary" onClick={handleZoomOut} title="Zoom Out">
            <ZoomOut size={16} />
          </button>
          <button className="btn btn-secondary" onClick={handleFit} title="Fit to Screen">
            <Maximize2 size={16} />
          </button>
          <button className="btn btn-secondary" onClick={handleExport} title="Export as PNG">
            <Download size={16} />
          </button>
        </div>

        {selectedNode && (
          <div style={{
            position: 'absolute',
            bottom: '24px',
            right: '24px',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            padding: '20px',
            minWidth: '280px',
            maxWidth: '400px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              {selectedNode.type === 'user' && <User size={24} style={{ color: '#00d4ff' }} />}
              {selectedNode.type === 'role' && <ShieldIcon size={24} style={{ color: '#7c3aed' }} />}
              {selectedNode.type === 'permission' && <Lock size={24} style={{ 
                color: selectedNode.risk_level === 'critical' ? '#ff3366' :
                       selectedNode.risk_level === 'high' ? '#ff8833' :
                       selectedNode.risk_level === 'medium' ? '#ffcc00' : '#00ff88'
              }} />}
              <div>
                <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.5px', marginBottom: '4px' }}>
                  {selectedNode.type}
                </div>
                <div style={{ fontSize: '16px', fontWeight: '600', fontFamily: 'JetBrains Mono, monospace' }}>
                  {selectedNode.label}
                </div>
              </div>
            </div>
            {selectedNode.risk_level && (
              <div style={{ marginTop: '12px' }}>
                <span className={`severity-badge severity-${selectedNode.risk_level}`}>
                  {selectedNode.risk_level} risk
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      <div style={{ marginTop: '24px' }}>
        <div className="card">
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>
            Graph Controls
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', fontSize: '14px', color: 'var(--text-secondary)' }}>
            <div>
              <div style={{ fontWeight: '600', color: 'var(--text-primary)', marginBottom: '4px' }}>Click</div>
              Select nodes to view details
            </div>
            <div>
              <div style={{ fontWeight: '600', color: 'var(--text-primary)', marginBottom: '4px' }}>Drag</div>
              Pan around the graph
            </div>
            <div>
              <div style={{ fontWeight: '600', color: 'var(--text-primary)', marginBottom: '4px' }}>Scroll</div>
              Zoom in and out
            </div>
            <div>
              <div style={{ fontWeight: '600', color: 'var(--text-primary)', marginBottom: '4px' }}>Double-click</div>
              Center on node
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
