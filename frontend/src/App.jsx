import { useState, useEffect, useCallback, useRef } from 'react';
import Board from './components/Board';
import CardDrawer from './components/CardDrawer';
import InputForm from './components/InputForm';
import Toast from './components/Toast';
import cardsApi from './api/cards';

// View Components
function AnalyticsView({ cards, onCardClick, onNavigate }) {
    const [selectedMetric, setSelectedMetric] = useState(null);
    const [tableSort, setTableSort] = useState({ field: 'updatedAt', direction: 'desc' });

    // Compute metrics
    const metrics = {
        total: cards.length,
        new: cards.filter(c => c.status === 'new').length,
        ready: cards.filter(c => c.status === 'ready').length,
        approved: cards.filter(c => c.status === 'approved').length,
        incidents: cards.filter(c => c.type === 'incident').length,
        features: cards.filter(c => c.type === 'feature').length,
        tasks: cards.filter(c => c.type === 'task').length,
        highSeverity: cards.filter(c => c.severity === 'high').length,
    };

    const completionRate = metrics.total > 0 ? Math.round((metrics.approved / metrics.total) * 100) : 0;
    const processingRate = metrics.total > 0 ? Math.round((metrics.ready / metrics.total) * 100) : 0;

    // Get filtered/sorted cards for table
    const getDisplayCards = () => {
        let filtered = [...cards];
        if (selectedMetric) {
            switch (selectedMetric) {
                case 'incidents': filtered = cards.filter(c => c.type === 'incident'); break;
                case 'features': filtered = cards.filter(c => c.type === 'feature'); break;
                case 'tasks': filtered = cards.filter(c => c.type === 'task'); break;
                case 'high': filtered = cards.filter(c => c.severity === 'high'); break;
                case 'new': filtered = cards.filter(c => c.status === 'new'); break;
                case 'ready': filtered = cards.filter(c => c.status === 'ready'); break;
                case 'approved': filtered = cards.filter(c => c.status === 'approved'); break;
            }
        }
        return filtered.sort((a, b) => {
            const aVal = a[tableSort.field] || '';
            const bVal = b[tableSort.field] || '';
            const cmp = aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
            return tableSort.direction === 'desc' ? -cmp : cmp;
        });
    };

    const displayCards = getDisplayCards();

    const handleSort = (field) => {
        setTableSort(prev => ({
            field,
            direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    return (
        <>
            <div className="ibm-content-header">
                <h1 className="ibm-content-title">Operations Dashboard</h1>
                <p className="ibm-content-subtitle">
                    Real-time processing metrics and work item analysis
                </p>
            </div>
            <div className="ibm-content-body">
                {/* Key Metrics - SaaS Style */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: 'var(--spacing-04)',
                    marginBottom: 'var(--spacing-06)'
                }}>
                    <div style={{
                        background: 'linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-tertiary) 100%)',
                        padding: 'var(--spacing-05)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 'var(--spacing-02)',
                        borderRadius: '8px',
                        border: '1px solid var(--border-subtle)',
                        boxShadow: 'var(--shadow-sm)'
                    }}>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.32px' }}>
                            Throughput
                        </span>
                        <span style={{ fontSize: '32px', fontWeight: 300, color: 'var(--text-primary)', lineHeight: 1 }}>
                            {metrics.total}
                        </span>
                        <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                            total work items processed
                        </span>
                    </div>
                    <div style={{
                        background: 'linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-tertiary) 100%)',
                        padding: 'var(--spacing-05)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 'var(--spacing-02)',
                        borderRadius: '8px',
                        border: '1px solid var(--border-subtle)',
                        boxShadow: 'var(--shadow-sm)'
                    }}>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.32px' }}>
                            Completion Rate
                        </span>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--spacing-02)' }}>
                            <span style={{ fontSize: '32px', fontWeight: 300, color: completionRate >= 50 ? 'var(--green-50)' : 'var(--text-primary)', lineHeight: 1 }}>
                                {completionRate}
                            </span>
                            <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>%</span>
                        </div>
                        <div style={{ height: '4px', background: 'var(--bg-tertiary)', width: '100%' }}>
                            <div style={{ height: '100%', width: `${completionRate}%`, background: 'var(--green-50)', transition: 'width 0.3s ease' }}></div>
                        </div>
                    </div>
                    <div style={{
                        background: 'linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-tertiary) 100%)',
                        padding: 'var(--spacing-05)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 'var(--spacing-02)',
                        borderRadius: '8px',
                        border: '1px solid var(--border-subtle)',
                        boxShadow: 'var(--shadow-sm)'
                    }}>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.32px' }}>
                            Pending Review
                        </span>
                        <span style={{ fontSize: '32px', fontWeight: 300, color: metrics.ready > 0 ? 'var(--yellow-30)' : 'var(--text-primary)', lineHeight: 1 }}>
                            {metrics.ready}
                        </span>
                        <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                            items awaiting approval
                        </span>
                    </div>
                    <div style={{
                        background: 'linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-tertiary) 100%)',
                        padding: 'var(--spacing-05)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 'var(--spacing-02)',
                        borderRadius: '8px',
                        border: '1px solid var(--border-subtle)',
                        boxShadow: 'var(--shadow-sm)'
                    }}>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.32px' }}>
                            Critical Items
                        </span>
                        <span style={{ fontSize: '32px', fontWeight: 300, color: metrics.highSeverity > 0 ? 'var(--red-60)' : 'var(--text-primary)', lineHeight: 1 }}>
                            {metrics.highSeverity}
                        </span>
                        <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                            high severity active
                        </span>
                    </div>
                </div>

                {/* Distribution Section */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 'var(--spacing-05)',
                    marginBottom: 'var(--spacing-05)'
                }}>
                    {/* Type Distribution */}
                    <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }}>
                        <div style={{
                            padding: 'var(--spacing-04)',
                            borderBottom: '1px solid var(--border-subtle)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                                Work Item Distribution
                            </span>
                            {selectedMetric && ['incidents', 'features', 'tasks'].includes(selectedMetric) && (
                                <button
                                    onClick={() => setSelectedMetric(null)}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: 'var(--accent-primary)',
                                        fontSize: '12px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Clear filter
                                </button>
                            )}
                        </div>
                        <div style={{ padding: 'var(--spacing-04)' }}>
                            {[
                                { key: 'incidents', label: 'Incidents', count: metrics.incidents, color: 'var(--red-60)', pct: metrics.total ? Math.round(metrics.incidents / metrics.total * 100) : 0 },
                                { key: 'features', label: 'Features', count: metrics.features, color: 'var(--blue-60)', pct: metrics.total ? Math.round(metrics.features / metrics.total * 100) : 0 },
                                { key: 'tasks', label: 'Tasks', count: metrics.tasks, color: 'var(--purple-50)', pct: metrics.total ? Math.round(metrics.tasks / metrics.total * 100) : 0 },
                            ].map(item => (
                                <div
                                    key={item.key}
                                    onClick={() => setSelectedMetric(selectedMetric === item.key ? null : item.key)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 'var(--spacing-04)',
                                        padding: 'var(--spacing-03) 0',
                                        cursor: 'pointer',
                                        opacity: selectedMetric && selectedMetric !== item.key ? 0.4 : 1,
                                        transition: 'opacity 0.15s ease'
                                    }}
                                >
                                    <div style={{ width: '3px', height: '24px', background: item.color }}></div>
                                    <span style={{ flex: 1, fontSize: '14px', color: 'var(--text-secondary)' }}>{item.label}</span>
                                    <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', minWidth: '32px', textAlign: 'right' }}>{item.count}</span>
                                    <div style={{ width: '80px', height: '4px', background: 'var(--bg-tertiary)' }}>
                                        <div style={{ height: '100%', width: `${item.pct}%`, background: item.color }}></div>
                                    </div>
                                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', minWidth: '32px', textAlign: 'right' }}>{item.pct}%</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Pipeline Status */}
                    <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }}>
                        <div style={{
                            padding: 'var(--spacing-04)',
                            borderBottom: '1px solid var(--border-subtle)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                                Pipeline Status
                            </span>
                            {selectedMetric && ['new', 'ready', 'approved'].includes(selectedMetric) && (
                                <button
                                    onClick={() => setSelectedMetric(null)}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: 'var(--accent-primary)',
                                        fontSize: '12px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Clear filter
                                </button>
                            )}
                        </div>
                        <div style={{ padding: 'var(--spacing-04)' }}>
                            {[
                                { key: 'new', label: 'New', count: metrics.new, color: 'var(--gray-60)' },
                                { key: 'ready', label: 'Ready for Review', count: metrics.ready, color: 'var(--yellow-30)' },
                                { key: 'approved', label: 'Approved', count: metrics.approved, color: 'var(--green-50)' },
                            ].map((item, idx) => (
                                <div
                                    key={item.key}
                                    onClick={() => setSelectedMetric(selectedMetric === item.key ? null : item.key)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 'var(--spacing-04)',
                                        padding: 'var(--spacing-03) 0',
                                        cursor: 'pointer',
                                        opacity: selectedMetric && selectedMetric !== item.key ? 0.4 : 1,
                                        borderLeft: selectedMetric === item.key ? `3px solid ${item.color}` : '3px solid transparent',
                                        paddingLeft: 'var(--spacing-03)',
                                        marginLeft: '-var(--spacing-03)',
                                        transition: 'all 0.15s ease'
                                    }}
                                >
                                    <div style={{
                                        width: '8px',
                                        height: '8px',
                                        borderRadius: '50%',
                                        background: item.color,
                                        boxShadow: selectedMetric === item.key ? `0 0 0 3px ${item.color}33` : 'none'
                                    }}></div>
                                    <span style={{ flex: 1, fontSize: '14px', color: 'var(--text-secondary)' }}>{item.label}</span>
                                    <span style={{
                                        fontSize: '20px',
                                        fontWeight: 400,
                                        color: item.count > 0 ? item.color : 'var(--text-muted)',
                                        fontVariantNumeric: 'tabular-nums'
                                    }}>{item.count}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Data Table */}
                <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }}>
                    <div style={{
                        padding: 'var(--spacing-04)',
                        borderBottom: '1px solid var(--border-subtle)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                            {selectedMetric ? `Filtered: ${selectedMetric.toUpperCase()}` : 'All Work Items'} ({displayCards.length})
                        </span>
                        <button
                            className="ibm-btn ibm-btn-ghost"
                            onClick={() => onNavigate('workitems')}
                            style={{ padding: '4px 12px', minHeight: 'auto', fontSize: '12px' }}
                        >
                            Open Kanban →
                        </button>
                    </div>

                    {/* Table Header */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '2fr 100px 100px 140px',
                        borderBottom: '1px solid var(--border-subtle)',
                        fontSize: '12px',
                        fontWeight: 600,
                        color: 'var(--text-secondary)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.32px'
                    }}>
                        <div
                            onClick={() => handleSort('title')}
                            style={{ padding: 'var(--spacing-03) var(--spacing-04)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                            Title {tableSort.field === 'title' && (tableSort.direction === 'asc' ? '↑' : '↓')}
                        </div>
                        <div
                            onClick={() => handleSort('type')}
                            style={{ padding: 'var(--spacing-03) var(--spacing-04)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                            Type {tableSort.field === 'type' && (tableSort.direction === 'asc' ? '↑' : '↓')}
                        </div>
                        <div
                            onClick={() => handleSort('severity')}
                            style={{ padding: 'var(--spacing-03) var(--spacing-04)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                            Severity {tableSort.field === 'severity' && (tableSort.direction === 'asc' ? '↑' : '↓')}
                        </div>
                        <div
                            onClick={() => handleSort('status')}
                            style={{ padding: 'var(--spacing-03) var(--spacing-04)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                            Status {tableSort.field === 'status' && (tableSort.direction === 'asc' ? '↑' : '↓')}
                        </div>
                    </div>

                    {/* Table Body */}
                    <div style={{ maxHeight: '240px', overflowY: 'auto' }}>
                        {displayCards.length === 0 ? (
                            <div style={{ padding: 'var(--spacing-05)', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>
                                No work items found
                            </div>
                        ) : (
                            displayCards.slice(0, 10).map((card, idx) => (
                                <div
                                    key={card.id}
                                    onClick={() => onCardClick(card)}
                                    style={{
                                        display: 'grid',
                                        gridTemplateColumns: '2fr 100px 100px 140px',
                                        borderBottom: idx < displayCards.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                                        cursor: 'pointer',
                                        transition: 'background 0.1s ease'
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                >
                                    <div style={{
                                        padding: 'var(--spacing-03) var(--spacing-04)',
                                        fontSize: '14px',
                                        color: 'var(--text-primary)',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap'
                                    }}>
                                        {card.title || 'Processing...'}
                                    </div>
                                    <div style={{ padding: 'var(--spacing-03) var(--spacing-04)' }}>
                                        <span style={{
                                            fontSize: '11px',
                                            padding: '2px 6px',
                                            background: card.type === 'incident' ? 'var(--red-60)' : card.type === 'feature' ? 'var(--blue-60)' : 'var(--purple-50)',
                                            color: 'white',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.32px'
                                        }}>
                                            {card.type || '—'}
                                        </span>
                                    </div>
                                    <div style={{ padding: 'var(--spacing-03) var(--spacing-04)' }}>
                                        <span style={{
                                            fontSize: '11px',
                                            padding: '2px 6px',
                                            background: card.severity === 'high' ? 'rgba(218, 30, 40, 0.2)' : card.severity === 'medium' ? 'rgba(240, 171, 0, 0.2)' : 'rgba(66, 190, 101, 0.2)',
                                            color: card.severity === 'high' ? 'var(--red-60)' : card.severity === 'medium' ? 'var(--yellow-30)' : 'var(--green-50)',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.32px'
                                        }}>
                                            {card.severity || '—'}
                                        </span>
                                    </div>
                                    <div style={{
                                        padding: 'var(--spacing-03) var(--spacing-04)',
                                        fontSize: '12px',
                                        color: 'var(--text-secondary)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px'
                                    }}>
                                        <span style={{
                                            width: '6px',
                                            height: '6px',
                                            borderRadius: '50%',
                                            background: card.status === 'approved' ? 'var(--green-50)' : card.status === 'ready' ? 'var(--yellow-30)' : 'var(--gray-50)'
                                        }}></span>
                                        {card.status}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                    {displayCards.length > 10 && (
                        <div style={{
                            padding: 'var(--spacing-03) var(--spacing-04)',
                            borderTop: '1px solid var(--border-subtle)',
                            fontSize: '12px',
                            color: 'var(--text-muted)',
                            textAlign: 'center'
                        }}>
                            Showing 10 of {displayCards.length} items
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}


function DocumentationView() {
    const [expandedDoc, setExpandedDoc] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const docs = [
        { id: 'incident-response', title: 'Incident Response Runbook', type: 'runbook', description: 'Standard operating procedures for handling production incidents, including escalation paths and communication templates.', content: '1. Acknowledge the alert within 5 minutes\n2. Assess severity using the impact matrix\n3. Create incident channel and page on-call if P1/P2\n4. Begin investigation following the troubleshooting guide\n5. Communicate status updates every 15 minutes\n6. Document resolution steps in the incident ticket\n7. Schedule post-mortem within 48 hours' },
        { id: 'feature-workflow', title: 'Feature Development Workflow', type: 'guide', description: 'End-to-end process for taking a feature from ideation through production deployment.', content: '1. Product Requirements Document (PRD) approval\n2. Technical Design Document (TDD) review\n3. Sprint planning and task breakdown\n4. Implementation with feature flags\n5. Code review and automated testing\n6. Staging deployment and QA sign-off\n7. Gradual rollout to production' },
        { id: 'on-call', title: 'On-Call Handbook', type: 'runbook', description: 'Guidelines for on-call engineers including alert triage, incident severity levels, and handoff procedures.', content: 'On-Call Responsibilities:\n• Monitor alerting channels during shift\n• Respond to pages within SLA (5 min P1, 15 min P2)\n• Escalate when needed - never hesitate\n• Document all actions taken\n• Handoff with detailed notes\n\nSeverity Levels:\nP1 - Customer-facing outage\nP2 - Major degradation\nP3 - Minor issues\nP4 - Cosmetic/low priority' },
        { id: 'code-review', title: 'Code Review Standards', type: 'policy', description: 'Best practices and requirements for conducting effective code reviews.', content: 'Required Checks:\n✓ Two approvals for production code\n✓ All tests passing\n✓ No security vulnerabilities\n✓ Documentation updated\n\nReview Focus Areas:\n• Logic correctness\n• Edge case handling\n• Performance implications\n• Error handling\n• Test coverage' },
        { id: 'deployment', title: 'Deployment Checklist', type: 'guide', description: 'Step-by-step checklist for safe production deployments including rollback procedures.', content: 'Pre-Deploy:\n□ All tests green\n□ Staging verified\n□ Rollback plan documented\n□ On-call notified\n\nDeploy:\n□ Deploy during low-traffic window\n□ Monitor metrics for 15 min\n□ Verify feature flags\n\nRollback Trigger:\n• Error rate > 1%\n• Latency p99 > 2x baseline\n• Any critical alerts' },
        { id: 'security', title: 'Security Policies', type: 'policy', description: 'Security requirements and compliance guidelines for all engineering work.', content: 'Security Requirements:\n• No secrets in code - use vault\n• All endpoints require authentication\n• Input validation on all user data\n• SQL injection prevention\n• XSS protection enabled\n\nCompliance:\n• SOC2 audit annually\n• GDPR data handling\n• PCI-DSS for payments' },
    ];

    const filteredDocs = docs.filter(doc =>
        doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.type.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <>
            <div className="ibm-content-header">
                <h1 className="ibm-content-title">Documentation</h1>
                <p className="ibm-content-subtitle">
                    Knowledge base used by AI agents for context retrieval
                </p>
            </div>
            <div className="ibm-content-body">
                <div className="ibm-input-section" style={{ marginBottom: 'var(--spacing-05)' }}>
                    <input
                        type="text"
                        className="ibm-textarea"
                        style={{ height: 'auto', padding: 'var(--spacing-03)' }}
                        placeholder="Search documentation..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div style={{ display: 'grid', gap: 'var(--spacing-03)' }}>
                    {filteredDocs.map(doc => (
                        <div
                            key={doc.id}
                            className="ibm-snippet"
                            style={{ cursor: 'pointer' }}
                            onClick={() => setExpandedDoc(expandedDoc === doc.id ? null : doc.id)}
                        >
                            <div className="ibm-snippet-title">
                                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <svg
                                        width="12" height="12" viewBox="0 0 16 16"
                                        fill="currentColor"
                                        style={{
                                            transform: expandedDoc === doc.id ? 'rotate(90deg)' : 'rotate(0deg)',
                                            transition: 'transform 0.15s ease'
                                        }}
                                    >
                                        <path d="M6 4l4 4-4 4z" />
                                    </svg>
                                    {doc.title}
                                </span>
                                <span className="ibm-snippet-type">{doc.type}</span>
                            </div>
                            <div className="ibm-snippet-content">{doc.description}</div>
                            {expandedDoc === doc.id && (
                                <div
                                    className="ibm-raw-text"
                                    style={{ marginTop: 'var(--spacing-03)', whiteSpace: 'pre-line' }}
                                >
                                    {doc.content}
                                </div>
                            )}
                        </div>
                    ))}
                    {filteredDocs.length === 0 && (
                        <div style={{ color: 'var(--text-muted)', padding: 'var(--spacing-05)', textAlign: 'center' }}>
                            No documents match "{searchTerm}"
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

function AIToolView({ tool, onNavigate }) {
    const [tryItInput, setTryItInput] = useState('');
    const [tryItOutput, setTryItOutput] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const toolInfo = {
        summarize: {
            title: 'Summarize Tool',
            subtitle: 'Classifies and summarizes incoming work items',
            description: 'The Summarize tool uses watsonx.ai with Granite LLM to analyze raw text input and extract:',
            features: [
                { name: 'Type Classification', desc: 'Categorizes as incident, feature request, or general task' },
                { name: 'Severity Detection', desc: 'Determines priority level (high, medium, low) based on keywords and context' },
                { name: 'Title Generation', desc: 'Creates a concise, descriptive title for the work item' },
                { name: 'Summary Extraction', desc: 'Produces a one-sentence summary capturing the key information' },
            ],
            placeholder: 'Enter text to classify and summarize...',
            sampleInput: "Database is overloaded - query response time exceeds 5 seconds, users reporting slow dashboard loads.",
            process: (input) => {
                const isIncident = /error|crash|down|outage|fail|slow|overload|503|500/i.test(input);
                const isFeature = /add|implement|feature|support|enable|need|want|request/i.test(input);
                const isHigh = /critical|urgent|revenue|outage|production|down|immediately/i.test(input);
                const isMedium = /slow|degraded|affected|concern|issue/i.test(input);
                return {
                    type: isIncident ? 'incident' : isFeature ? 'feature' : 'task',
                    severity: isHigh ? 'high' : isMedium ? 'medium' : 'low',
                    title: input.split(/[.!?]/)[0].substring(0, 50) + (input.length > 50 ? '...' : ''),
                    summary: input.length > 100 ? input.substring(0, 100) + '...' : input
                };
            }
        },
        context: {
            title: 'Context RAG Tool',
            subtitle: 'Retrieves relevant documentation using RAG',
            description: 'The Context tool simulates Retrieval-Augmented Generation (RAG) to find relevant documentation:',
            features: [
                { name: 'Keyword Matching', desc: 'Scores documents based on keyword relevance to the work item' },
                { name: 'Type-Based Filtering', desc: 'Prioritizes runbooks for incidents, guides for features' },
                { name: 'Top-K Selection', desc: 'Returns the top 3 most relevant documents' },
                { name: 'Fallback Logic', desc: 'Provides generic docs if no strong matches are found' },
            ],
            placeholder: 'Enter a summary to find relevant documentation...',
            sampleInput: "High severity incident: checkout service returning 500 errors, affecting revenue",
            process: (input) => {
                const docs = [
                    { id: 1, title: 'Incident Response Runbook', type: 'runbook', relevance: 0 },
                    { id: 2, title: 'Feature Development Workflow', type: 'guide', relevance: 0 },
                    { id: 3, title: 'On-Call Handbook', type: 'runbook', relevance: 0 },
                    { id: 4, title: 'Deployment Checklist', type: 'guide', relevance: 0 },
                    { id: 5, title: 'Security Policies', type: 'policy', relevance: 0 },
                ];
                const lowerInput = input.toLowerCase();
                if (/incident|error|outage|500|crash/i.test(lowerInput)) {
                    docs[0].relevance = 95;
                    docs[2].relevance = 82;
                }
                if (/checkout|payment|service/i.test(lowerInput)) {
                    docs[3].relevance = 78;
                }
                if (/feature|add|implement/i.test(lowerInput)) {
                    docs[1].relevance = 90;
                }
                return docs.sort((a, b) => b.relevance - a.relevance).slice(0, 3).filter(d => d.relevance > 0);
            }
        },
        planner: {
            title: 'Plan Generator Tool',
            subtitle: 'Creates actionable plans based on context',
            description: 'The Planner tool generates step-by-step action plans using the work item and retrieved context:',
            features: [
                { name: 'Type-Specific Templates', desc: 'Uses different plan structures for incidents vs features vs tasks' },
                { name: 'Context Integration', desc: 'References relevant documentation in the plan steps' },
                { name: '5-6 Step Plans', desc: 'Generates practical, actionable steps for the engineering team' },
                { name: 'watsonx.ai Integration', desc: 'Uses Granite LLM when configured, falls back to templates' },
            ],
            placeholder: 'Enter incident/feature summary to generate action plan...',
            sampleInput: "High severity incident affecting checkout service with 500 errors",
            process: (input) => {
                const isIncident = /incident|error|outage|500|crash|down/i.test(input);
                if (isIncident) {
                    return [
                        { step: 1, action: 'Acknowledge & Assess', description: 'Create incident channel, assess impact scope' },
                        { step: 2, action: 'Check Logs', description: 'Review checkout service logs for error patterns' },
                        { step: 3, action: 'Scale Resources', description: 'Increase pod replicas if load-related' },
                        { step: 4, action: 'Rollback if Needed', description: 'Revert to last known good deployment' },
                        { step: 5, action: 'Notify Stakeholders', description: 'Update status page and notify affected teams' },
                    ];
                }
                return [
                    { step: 1, action: 'Requirements Review', description: 'Review and validate requirements' },
                    { step: 2, action: 'Technical Design', description: 'Create technical design document' },
                    { step: 3, action: 'Implementation', description: 'Implement with feature flag' },
                    { step: 4, action: 'Testing', description: 'Write and run tests' },
                    { step: 5, action: 'Deploy', description: 'Deploy to staging then production' },
                ];
            }
        }
    };

    const info = toolInfo[tool];

    const handleTryIt = () => {
        if (!tryItInput.trim()) return;
        setIsProcessing(true);
        setTimeout(() => {
            const result = info.process(tryItInput);
            setTryItOutput(result);
            setIsProcessing(false);
        }, 800);
    };

    const handleUseSample = () => {
        setTryItInput(info.sampleInput);
        setTryItOutput(null);
    };

    return (
        <>
            <div className="ibm-content-header">
                <h1 className="ibm-content-title">{info.title}</h1>
                <p className="ibm-content-subtitle">{info.subtitle}</p>
            </div>
            <div className="ibm-content-body">
                <div className="ibm-input-section">
                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 'var(--spacing-05)' }}>
                        {info.description}
                    </p>
                    <div style={{ display: 'grid', gap: 'var(--spacing-03)' }}>
                        {info.features.map((feature, idx) => (
                            <div key={idx} className="ibm-step">
                                <div className="ibm-step-number">{idx + 1}</div>
                                <div className="ibm-step-content">
                                    <div className="ibm-step-action">{feature.name}</div>
                                    <div className="ibm-step-description">{feature.desc}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="ibm-input-section" style={{ marginTop: 'var(--spacing-05)' }}>
                    <div className="ibm-input-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>Try It</span>
                        <button
                            className="ibm-btn ibm-btn-ghost"
                            onClick={handleUseSample}
                            style={{ padding: '4px 8px', minHeight: 'auto', fontSize: '12px' }}
                        >
                            Use Sample Input
                        </button>
                    </div>
                    <div style={{ marginTop: 'var(--spacing-03)' }}>
                        <div className="ibm-input-group">
                            <textarea
                                className="ibm-textarea"
                                value={tryItInput}
                                onChange={(e) => { setTryItInput(e.target.value); setTryItOutput(null); }}
                                placeholder={info.placeholder}
                                rows={2}
                            />
                            <button
                                className="ibm-btn ibm-btn-primary"
                                onClick={handleTryIt}
                                disabled={!tryItInput.trim() || isProcessing}
                                style={{ minWidth: 100 }}
                            >
                                {isProcessing ? (
                                    <>
                                        <span className="ibm-spinner"></span>
                                        Running
                                    </>
                                ) : 'Run'}
                            </button>
                        </div>
                    </div>

                    {tryItOutput && (
                        <div style={{ marginTop: 'var(--spacing-04)' }}>
                            <div className="ibm-input-label" style={{ marginBottom: 'var(--spacing-03)' }}>Output</div>
                            <div className="ibm-raw-text" style={{ whiteSpace: 'pre-wrap' }}>
                                {JSON.stringify(tryItOutput, null, 2)}
                            </div>
                        </div>
                    )}
                </div>

                <div style={{ marginTop: 'var(--spacing-05)', display: 'flex', gap: 'var(--spacing-03)' }}>
                    <button
                        className="ibm-btn ibm-btn-secondary"
                        onClick={() => onNavigate('workitems')}
                    >
                        ← Create Real Work Item
                    </button>
                </div>
            </div>
        </>
    );
}

function App() {
    const [cards, setCards] = useState([]);
    const [selectedCard, setSelectedCard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [toast, setToast] = useState(null);
    const [activeView, setActiveView] = useState('workitems');
    const [isTransitioning, setIsTransitioning] = useState(false);

    // Ref to track the currently selected card ID for polling updates
    // This allows fetchCards to update the card data without resurrecting a closed drawer
    const selectedCardIdRef = useRef(null);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    // Enhanced navigation with visual feedback
    const handleNavigation = (view) => {
        if (view === activeView) return; // Already on this view
        setIsTransitioning(true);
        setTimeout(() => {
            setActiveView(view);
            setIsTransitioning(false);
        }, 150);
    };

    /**
     * Close the drawer - clears both state and ref to prevent resurrection
     */
    const handleCloseDrawer = useCallback(() => {
        selectedCardIdRef.current = null;
        setSelectedCard(null);
    }, []);

    /**
     * Open a card in the drawer - sets both state and ref
     */
    const handleOpenCard = useCallback((card) => {
        selectedCardIdRef.current = card.id;
        setSelectedCard(card);
    }, []);

    const fetchCards = useCallback(async () => {
        try {
            const data = await cardsApi.getAll();
            setCards(data);
            setError(null);
            // Only update selectedCard if the drawer is intentionally open (ref has a value)
            if (selectedCardIdRef.current) {
                const updated = data.find(c => c.id === selectedCardIdRef.current);
                if (updated) setSelectedCard(updated);
            }
        } catch (err) {
            console.error('Failed to fetch cards:', err);
            setError('Failed to load cards');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCards();
        const interval = setInterval(fetchCards, 2000);
        return () => clearInterval(interval);
    }, [fetchCards]);

    const handleCreateCard = async (rawText) => {
        try {
            await cardsApi.create(rawText);
            showToast('Card created. Processing with AI agents.', 'success');
            await fetchCards();
        } catch (err) {
            console.error('Failed to create card:', err);
            showToast('Failed to create card', 'error');
        }
    };

    const handleApprove = async (id) => {
        try {
            await cardsApi.approve(id);
            showToast('Plan approved successfully.', 'success');
            setSelectedCard(null);
            await fetchCards();
        } catch (err) {
            console.error('Failed to approve card:', err);
            showToast('Failed to approve', 'error');
        }
    };

    const handleReject = async (id) => {
        try {
            await cardsApi.reject(id);
            showToast('Card returned for revision.', 'info');
            setSelectedCard(null);
            await fetchCards();
        } catch (err) {
            console.error('Failed to reject card:', err);
        }
    };

    const handleDelete = async (id) => {
        try {
            await cardsApi.delete(id);
            showToast('Card deleted.', 'success');
            setSelectedCard(null);
            await fetchCards();
        } catch (err) {
            console.error('Failed to delete card:', err);
            showToast('Failed to delete card', 'error');
        }
    };

    const stats = {
        new: cards.filter(c => c.status === 'new').length,
        ready: cards.filter(c => c.status === 'ready').length,
        approved: cards.filter(c => c.status === 'approved').length,
        total: cards.length
    };

    const renderMainContent = () => {
        switch (activeView) {
            case 'analytics':
                return <AnalyticsView cards={cards} onCardClick={handleOpenCard} onNavigate={handleNavigation} />;
            case 'documentation':
                return <DocumentationView />;
            case 'summarize':
                return <AIToolView tool="summarize" onNavigate={handleNavigation} />;
            case 'context':
                return <AIToolView tool="context" onNavigate={handleNavigation} />;
            case 'planner':
                return <AIToolView tool="planner" onNavigate={handleNavigation} />;
            default:
                return (
                    <>
                        <div className="ibm-content-header">
                            <h1 className="ibm-content-title">Work Items</h1>
                            <p className="ibm-content-subtitle">
                                AI-powered classification and action planning
                            </p>
                        </div>
                        <div className="ibm-content-body">
                            <div className="ibm-stats-row">
                                <div className="ibm-stat-tile">
                                    <div className="ibm-stat-value">{stats.total}</div>
                                    <div className="ibm-stat-label">Total Items</div>
                                </div>
                                <div className="ibm-stat-tile">
                                    <div className="ibm-stat-value">{stats.new}</div>
                                    <div className="ibm-stat-label">New</div>
                                </div>
                                <div className="ibm-stat-tile">
                                    <div className="ibm-stat-value">{stats.ready}</div>
                                    <div className="ibm-stat-label">Ready for Review</div>
                                </div>
                                <div className="ibm-stat-tile">
                                    <div className="ibm-stat-value">{stats.approved}</div>
                                    <div className="ibm-stat-label">Approved</div>
                                </div>
                            </div>
                            <InputForm onSubmit={handleCreateCard} />
                            {error && (
                                <div style={{ color: 'var(--red-60)', marginBottom: 'var(--spacing-05)', fontSize: '14px' }}>
                                    {error}
                                </div>
                            )}
                            <Board cards={cards} loading={loading} onCardClick={handleOpenCard} />
                        </div>
                    </>
                );
        }
    };

    return (
        <>
            {/* IBM Cloud Header */}
            <header className="ibm-header">
                <a href="/" className="ibm-header-logo" onClick={(e) => { e.preventDefault(); handleNavigation('workitems'); }}>
                    <svg viewBox="0 0 32 32" fill="currentColor">
                        <path d="M0 6h7v2H0zm0 4h7v2H0zm0 4h7v2H0zm0 4h7v2H0zm0 4h7v2H0z" />
                        <path d="M9 6h7v2H9zm0 8h7v2H9zm0 8h7v2H9z" />
                        <path d="M9 10h4v2H9zm0 8h4v2H9z" />
                        <path d="M18 6h7v2h-7zm0 4h7v2h-7zm0 4h7v2h-7zm0 4h7v2h-7zm0 4h7v2h-7z" />
                        <path d="M25 6h7v2h-7zm0 8h7v2h-7zm0 8h7v2h-7z" />
                        <path d="M25 10h4v2h-4zm0 8h4v2h-4z" />
                    </svg>
                    IBM Cloud
                </a>
                <nav className="ibm-header-nav">
                    <span className="ibm-header-nav-item active">AI Agent Kanban</span>
                </nav>
                <div className="ibm-header-actions">
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        Dev Day 2026
                    </span>
                </div>
            </header>

            {/* Main Layout */}
            <div className="ibm-layout">
                {/* Left Sidebar */}
                <aside className="ibm-sidebar">
                    <div className="ibm-sidebar-section">
                        <div className="ibm-sidebar-title">Navigation</div>
                        <nav className="ibm-sidebar-nav">
                            <div
                                className={`ibm-sidebar-item ${activeView === 'workitems' ? 'active' : ''}`}
                                onClick={() => handleNavigation('workitems')}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => e.key === 'Enter' && handleNavigation('workitems')}
                                title="Kanban board with AI-processed work items"
                            >
                                <svg viewBox="0 0 16 16" fill="currentColor">
                                    <path d="M3 2h10v2H3zm0 4h10v2H3zm0 4h10v2H3zm0 4h6v2H3z" />
                                </svg>
                                Work Items
                            </div>
                            <div
                                className={`ibm-sidebar-item ${activeView === 'analytics' ? 'active' : ''}`}
                                onClick={() => handleNavigation('analytics')}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => e.key === 'Enter' && handleNavigation('analytics')}
                                title="View metrics, throughput, and work item analysis"
                            >
                                <svg viewBox="0 0 16 16" fill="currentColor">
                                    <path d="M8 0a8 8 0 100 16A8 8 0 008 0zm0 14A6 6 0 118 2a6 6 0 010 12z" />
                                </svg>
                                Analytics
                            </div>
                            <div
                                className={`ibm-sidebar-item ${activeView === 'documentation' ? 'active' : ''}`}
                                onClick={() => handleNavigation('documentation')}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => e.key === 'Enter' && handleNavigation('documentation')}
                                title="Browse runbooks and policies used by AI agents"
                            >
                                <svg viewBox="0 0 16 16" fill="currentColor">
                                    <path d="M14 3H2v10h12V3zm-1 9H3V4h10v8z" />
                                </svg>
                                Documentation
                            </div>
                        </nav>
                    </div>
                    <div className="ibm-sidebar-section">
                        <div className="ibm-sidebar-title">AI Tools</div>
                        <nav className="ibm-sidebar-nav">
                            <div
                                className={`ibm-sidebar-item ${activeView === 'summarize' ? 'active' : ''}`}
                                onClick={() => handleNavigation('summarize')}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => e.key === 'Enter' && handleNavigation('summarize')}
                                title="AI tool: Classify and summarize work items"
                            >
                                <svg viewBox="0 0 16 16" fill="currentColor">
                                    <path d="M2 2h12v2H2zm0 4h8v2H2zm0 4h10v2H2zm0 4h6v2H2z" />
                                </svg>
                                Summarize
                            </div>
                            <div
                                className={`ibm-sidebar-item ${activeView === 'context' ? 'active' : ''}`}
                                onClick={() => handleNavigation('context')}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => e.key === 'Enter' && handleNavigation('context')}
                                title="AI tool: Search for relevant documents and context"
                            >
                                <svg viewBox="0 0 16 16" fill="currentColor">
                                    <path d="M6 0v6H0v10h10v-6h6V0H6zm4 14H2V8h8v6zM14 8h-2V6H6V2h8v6z" />
                                </svg>
                                Context RAG
                            </div>
                            <div
                                className={`ibm-sidebar-item ${activeView === 'planner' ? 'active' : ''}`}
                                onClick={() => handleNavigation('planner')}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => e.key === 'Enter' && handleNavigation('planner')}
                                title="AI tool: Generate step-by-step action plans"
                            >
                                <svg viewBox="0 0 16 16" fill="currentColor">
                                    <path d="M2 2h2v2H2zm4 0h8v2H6zM2 6h2v2H2zm4 0h8v2H6zM2 10h2v2H2zm4 0h8v2H6zM2 14h2v2H2zm4 0h8v2H6z" />
                                </svg>
                                Plan Generator
                            </div>
                        </nav>
                    </div>
                </aside>

                {/* Main Content */}
                <main
                    className="ibm-content"
                    style={{
                        opacity: isTransitioning ? 0.5 : 1,
                        transition: 'opacity 0.15s ease-out'
                    }}
                >
                    {renderMainContent()}
                </main>
            </div>

            {/* Drawer */}
            {selectedCard && (
                <CardDrawer
                    card={selectedCard}
                    onClose={handleCloseDrawer}
                    onApprove={handleApprove}
                    onReject={handleReject}
                    onDelete={handleDelete}
                />
            )}

            {/* Toast */}
            {toast && <Toast message={toast.message} type={toast.type} />}
        </>
    );
}

export default App;
