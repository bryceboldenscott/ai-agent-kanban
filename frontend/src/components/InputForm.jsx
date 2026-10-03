import { useState } from 'react';

const SAMPLE_INPUTS = [
    {
        label: 'Incident',
        text: "We're seeing 500 errors on checkout service in us-east region. Error rate jumped to 15% at 2:30 PM. Users can't complete purchases. This is affecting revenue significantly."
    },
    {
        label: 'Feature',
        text: "Add dark mode toggle to user settings page. Should persist across sessions and match system preference by default. Need to follow accessibility guidelines."
    },
    {
        label: 'Bug',
        text: "Login page crashes on iOS Safari when using autofill. Users report seeing a blank screen after their password manager fills in credentials. Reproducible on iPhone 14 Pro."
    },
    {
        label: 'Task',
        text: "Update API documentation for the new /users endpoint. Include request/response examples, authentication requirements, and rate limiting details."
    }
];

function InputForm({ onSubmit }) {
    const [text, setText] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!text.trim() || submitting) return;

        setSubmitting(true);
        try {
            await onSubmit(text.trim());
            setText('');
        } finally {
            setSubmitting(false);
        }
    };

    const handleSampleClick = (sample) => {
        setText(sample.text);
    };

    const handleClear = () => {
        setText('');
    };

    const charCount = text.length;
    const isValid = text.trim().length >= 10;

    return (
        <div className="ibm-input-section">
            <label className="ibm-input-label">Create New Work Item</label>

            <div className="ibm-quick-fill">
                <span className="ibm-quick-fill-label">Templates:</span>
                {SAMPLE_INPUTS.map((sample, idx) => (
                    <button
                        key={idx}
                        type="button"
                        className="ibm-btn ibm-btn-ghost"
                        onClick={() => handleSampleClick(sample)}
                        style={{ padding: '4px 12px', minHeight: 'auto', fontSize: '12px' }}
                        title={`Load ${sample.label} template`}
                    >
                        {sample.label}
                    </button>
                ))}
                {text && (
                    <button
                        type="button"
                        className="ibm-btn ibm-btn-ghost"
                        onClick={handleClear}
                        style={{ padding: '4px 12px', minHeight: 'auto', fontSize: '12px', color: 'var(--red-60)' }}
                        title="Clear the text area"
                    >
                        Clear
                    </button>
                )}
            </div>

            <form onSubmit={handleSubmit}>
                <div className="ibm-input-group">
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <textarea
                            className="ibm-textarea"
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="Paste an incident report, feature request, bug report, or any work item. AI agents will classify, add context, and propose an action plan."
                            rows={3}
                            style={{
                                borderColor: text && !isValid ? 'var(--yellow-30)' : undefined
                            }}
                        />
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            fontSize: '11px',
                            color: 'var(--text-muted)',
                            padding: '0 2px'
                        }}>
                            <span>
                                {text && !isValid && (
                                    <span style={{ color: 'var(--yellow-30)' }}>
                                        Minimum 10 characters required
                                    </span>
                                )}
                            </span>
                            <span>{charCount} characters</span>
                        </div>
                    </div>
                    <button
                        type="submit"
                        className="ibm-btn ibm-btn-primary"
                        disabled={!isValid || submitting}
                        style={{ minWidth: 120, alignSelf: 'flex-start' }}
                        title={!isValid ? 'Enter at least 10 characters to submit' : 'Submit work item for AI processing'}
                    >
                        {submitting ? (
                            <>
                                <span className="ibm-spinner"></span>
                                Processing
                            </>
                        ) : (
                            'Submit'
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default InputForm;

