function Board({ cards, loading, onCardClick }) {
    const columns = [
        { id: 'new', title: 'New', filter: c => c.status === 'new' },
        { id: 'ready', title: 'Ready for Review', filter: c => c.status === 'ready' },
        { id: 'approved', title: 'Approved', filter: c => c.status === 'approved' }
    ];

    if (loading) {
        return (
            <div className="ibm-loading">
                <span className="ibm-spinner"></span>
                <span>Loading work items...</span>
            </div>
        );
    }

    return (
        <div className="ibm-board">
            {columns.map(column => {
                const columnCards = cards.filter(column.filter);
                return (
                    <div key={column.id} className="ibm-column">
                        <div className="ibm-column-header">
                            <span className="ibm-column-title">{column.title}</span>
                            <span className="ibm-column-count">{columnCards.length}</span>
                        </div>
                        <div className="ibm-column-body">
                            {columnCards.length === 0 ? (
                                <div className="ibm-empty">No items</div>
                            ) : (
                                columnCards.map(card => (
                                    <div
                                        key={card.id}
                                        className={`ibm-card ${card.type || ''} ${card.processingStatus === 'processing' ? 'processing' : ''}`}
                                        onClick={() => onCardClick(card)}
                                    >
                                        <div className="ibm-card-title">
                                            {card.title || 'Processing...'}
                                        </div>
                                        <div className="ibm-card-summary">
                                            {card.summary || card.rawText?.substring(0, 100)}
                                        </div>
                                        <div className="ibm-card-meta">
                                            {card.type && (
                                                <span className={`ibm-tag ${card.type}`}>
                                                    {card.type}
                                                </span>
                                            )}
                                            {card.severity && (
                                                <span className={`ibm-tag ${card.severity}`}>
                                                    {card.severity}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

export default Board;
