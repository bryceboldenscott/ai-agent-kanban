function Toast({ message, type = 'success' }) {
    const icons = {
        success: (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 0a8 8 0 110 16A8 8 0 018 0zm3.5 4.5l-5 5-2-2L3 9l3.5 3.5 6.5-6.5-1.5-1.5z" />
            </svg>
        ),
        error: (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 0a8 8 0 110 16A8 8 0 018 0zm1 12H7v-2h2v2zm0-3H7V4h2v5z" />
            </svg>
        ),
        info: (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 0a8 8 0 110 16A8 8 0 018 0zm1 12H7V7h2v5zm0-6H7V4h2v2z" />
            </svg>
        )
    };

    return (
        <div className={`ibm-toast ${type}`} role="alert" aria-live="polite">
            <span className="ibm-toast-icon">{icons[type] || icons.info}</span>
            <span className="ibm-toast-message">{message}</span>
        </div>
    );
}

export default Toast;

