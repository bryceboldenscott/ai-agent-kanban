import { useState, useCallback } from 'react';

/**
 * CardDrawer - Right-side panel showing work item details
 * 
 * State management: The drawer is controlled by the parent component via the `card` prop.
 * When `card` is truthy, the drawer renders. When the user clicks the X button or overlay,
 * `onClose` is called which sets `selectedCard` to null in the parent, causing this
 * component to unmount (conditional rendering in App.jsx: `{selectedCard && <CardDrawer />}`).
 */
function CardDrawer({ card, onClose, onApprove, onReject, onDelete }) {
    const [expandedSnippet, setExpandedSnippet] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState(false);

    // Derived state for cleaner conditionals
    const isProcessing = card.processingStatus === 'pending' || card.processingStatus === 'processing';
    const isReady = card.status === 'ready';
    const isApproved = card.status === 'approved';
    const isNew = card.status === 'new';

    /**
     * Handle closing the drawer - called by X button, overlay click, or Close button.
     * This clears the selected item in the parent, causing the drawer to unmount.
     */
    const handleCloseDrawer = useCallback(() => {
        onClose();
    }, [onClose]);

    /**
     * Handle overlay click - closes the drawer when clicking outside the panel
     */
    const handleOverlayClick = useCallback((e) => {
        // Only close if clicking the overlay itself, not its children
        if (e.target === e.currentTarget) {
            handleCloseDrawer();
        }
    }, [handleCloseDrawer]);

    /**
     * Prevent clicks inside the drawer from bubbling to the overlay
     */
    const handleDrawerClick = useCallback((e) => {
        e.stopPropagation();
    }, []);

    /**
     * Handle delete with confirmation - requires double-click within 3 seconds
     */
    const handleDeleteClick = useCallback(() => {
        if (confirmDelete) {
            onDelete(card.id);
        } else {
            setConfirmDelete(true);
            setTimeout(() => setConfirmDelete(false), 3000);
        }
    }, [confirmDelete, onDelete, card.id]);

    /**
     * Toggle context snippet expansion
     */
    const toggleSnippet = useCallback((id) => {
        setExpandedSnippet(prev => prev === id ? null : id);
    }, []);

    return (
        <>
            {/* Overlay - clicking this closes the drawer */}
            <div
                className="ibm-overlay"
                onClick={handleOverlayClick}
                aria-hidden="true"
            />

            {/* Drawer Panel */}
            <div
                className="ibm-drawer"
                onClick={handleDrawerClick}
                role="dialog"
                aria-modal="true"
                aria-labelledby="drawer-title"
            >
                {/* Header */}
                <div className="ibm-drawer-header">
                    {/* Title container - constrained to prevent overlapping close button */}
                    <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                        <h2 id="drawer-title" className="ibm-drawer-title">
                            {card.title || 'Untitled Item'}
                        </h2>
                        <div style={{ marginTop: '8px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            {card.type && <span className={`ibm-tag ${card.type}`}>{card.type}</span>}
                            {card.severity && <span className={`ibm-tag ${card.severity}`}>{card.severity}</span>}
                            {isProcessing && <span className="ibm-tag">Processing</span>}
                            {isApproved && (
                                <span className="ibm-tag" style={{ background: 'rgba(36, 161, 72, 0.2)', color: '#42be65' }}>
                                    Approved
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Close Button - Primary way to dismiss the drawer */}
                    <button
                        type="button"
                        className="ibm-drawer-close"
                        onClick={handleCloseDrawer}
                        aria-label="Close details"
                    >
                        <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M12 4.7L11.3 4 8 7.3 4.7 4 4 4.7 7.3 8 4 11.3l.7.7L8 8.7l3.3 3.3.7-.7L8.7 8z" />
                        </svg>
                    </button>
                </div>

                {/* Body - Scrollable content area */}
                <div className="ibm-drawer-body">
                    {/* Summary Section */}
                    <div className="ibm-drawer-section">
                        <div className="ibm-drawer-section-title">Summary</div>
                        <div className="ibm-drawer-section-content">
                            {card.summary || 'Generating summary...'}
                        </div>
                    </div>

                    {/* Context Section - Expandable snippets */}
                    <div className="ibm-drawer-section">
                        <div className="ibm-drawer-section-title">
                            Context ({card.contextSnippets?.length || 0} documents)
                            {card.contextSnippets?.length > 0 && (
                                <span style={{ fontWeight: 400, marginLeft: '8px', fontSize: '11px' }}>
                                    Click to expand
                                </span>
                            )}
                        </div>
                        {card.contextSnippets?.length > 0 ? (
                            card.contextSnippets.map(snippet => (
                                <div
                                    key={snippet.id}
                                    className="ibm-snippet"
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => toggleSnippet(snippet.id)}
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={(e) => e.key === 'Enter' && toggleSnippet(snippet.id)}
                                >
                                    <div className="ibm-snippet-title">
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <svg
                                                width="12"
                                                height="12"
                                                viewBox="0 0 16 16"
                                                fill="currentColor"
                                                style={{
                                                    transform: expandedSnippet === snippet.id ? 'rotate(90deg)' : 'rotate(0deg)',
                                                    transition: 'transform 0.15s ease'
                                                }}
                                            >
                                                <path d="M6 4l4 4-4 4z" />
                                            </svg>
                                            {snippet.title}
                                        </span>
                                        <span className="ibm-snippet-type">{snippet.type}</span>
                                    </div>
                                    <div
                                        className="ibm-snippet-content"
                                        style={{
                                            maxHeight: expandedSnippet === snippet.id ? '500px' : '40px',
                                            overflow: 'hidden',
                                            transition: 'max-height 0.2s ease'
                                        }}
                                    >
                                        {snippet.content}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="ibm-drawer-section-content" style={{ color: 'var(--text-muted)' }}>
                                {isProcessing ? 'Fetching relevant context...' : 'No relevant documents found'}
                            </div>
                        )}
                    </div>

                    {/* Action Plan Section */}
                    <div className="ibm-drawer-section">
                        <div className="ibm-drawer-section-title">
                            Action Plan ({card.proposedPlan?.length || 0} steps)
                        </div>
                        {card.proposedPlan?.length > 0 ? (
                            card.proposedPlan.map(step => (
                                <div key={step.step} className="ibm-step">
                                    <div className="ibm-step-number">{step.step}</div>
                                    <div className="ibm-step-content">
                                        <div className="ibm-step-action">{step.action}</div>
                                        <div className="ibm-step-description">{step.description}</div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="ibm-drawer-section-content" style={{ color: 'var(--text-muted)' }}>
                                {isProcessing ? 'Generating action plan...' : 'No plan generated'}
                            </div>
                        )}
                    </div>

                    {/* Original Input Section */}
                    <div className="ibm-drawer-section">
                        <div className="ibm-drawer-section-title">Original Input</div>
                        <div className="ibm-raw-text">{card.rawText}</div>
                    </div>

                    {/* Metadata Section */}
                    <div className="ibm-drawer-section">
                        <div className="ibm-drawer-section-title">Metadata</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-03)', fontSize: '12px' }}>
                            <div>
                                <span style={{ color: 'var(--text-muted)' }}>Created:</span>
                                <div style={{ color: 'var(--text-secondary)' }}>
                                    {new Date(card.createdAt).toLocaleString()}
                                </div>
                            </div>
                            <div>
                                <span style={{ color: 'var(--text-muted)' }}>Updated:</span>
                                <div style={{ color: 'var(--text-secondary)' }}>
                                    {new Date(card.updatedAt).toLocaleString()}
                                </div>
                            </div>
                            <div>
                                <span style={{ color: 'var(--text-muted)' }}>Status:</span>
                                <div style={{ color: 'var(--text-secondary)' }}>{card.status}</div>
                            </div>
                            <div>
                                <span style={{ color: 'var(--text-muted)' }}>Processing:</span>
                                <div style={{ color: 'var(--text-secondary)' }}>{card.processingStatus}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer - Action buttons based on status */}
                <div className="ibm-drawer-footer">
                    {isReady && (
                        <>
                            <button
                                type="button"
                                className="ibm-btn ibm-btn-primary"
                                onClick={() => onApprove(card.id)}
                                style={{ flex: 1 }}
                            >
                                Approve Plan
                            </button>
                            <button
                                type="button"
                                className="ibm-btn ibm-btn-danger"
                                onClick={() => onReject(card.id)}
                            >
                                Return
                            </button>
                        </>
                    )}

                    {isApproved && (
                        <>
                            <div style={{ color: 'var(--green-50)', fontWeight: 500, fontSize: '14px', flex: 1 }}>
                                ✓ Plan has been approved
                            </div>
                            {onDelete && (
                                <button
                                    type="button"
                                    className="ibm-btn ibm-btn-ghost"
                                    onClick={handleDeleteClick}
                                    style={{ color: confirmDelete ? 'var(--red-60)' : 'var(--text-muted)' }}
                                >
                                    {confirmDelete ? 'Confirm Delete' : 'Delete'}
                                </button>
                            )}
                        </>
                    )}

                    {isProcessing && (
                        <div className="ibm-loading" style={{ flex: 1 }}>
                            <span className="ibm-spinner" />
                            <span>AI agents processing...</span>
                        </div>
                    )}

                    {isNew && !isProcessing && (
                        <>
                            <button
                                type="button"
                                className="ibm-btn ibm-btn-secondary"
                                onClick={handleCloseDrawer}
                                style={{ flex: 1 }}
                            >
                                Close
                            </button>
                            {onDelete && (
                                <button
                                    type="button"
                                    className="ibm-btn ibm-btn-ghost"
                                    onClick={handleDeleteClick}
                                    style={{ color: confirmDelete ? 'var(--red-60)' : 'var(--text-muted)' }}
                                >
                                    {confirmDelete ? 'Confirm Delete' : 'Delete'}
                                </button>
                            )}
                        </>
                    )}
                </div>
            </div>
        </>
    );
}

export default CardDrawer;

