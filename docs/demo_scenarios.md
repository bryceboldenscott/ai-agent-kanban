# Demo Scenarios

Two pre-prepared demo scenarios for the IBM Dev Day presentation.

## Scenario 1: Production Incident (P1)

**Paste this text:**
```
URGENT: Production checkout service is returning 500 errors in the us-east region. 
Error rate jumped from 0.1% to 15% starting at 2:30 PM EST. Customers cannot complete 
purchases. On-call team has been notified. Recent deployment 30 minutes ago. 
Need immediate investigation and resolution.
```

**Expected AI Output:**
- **Type:** Incident
- **Severity:** High
- **Context:** Checkout service runbook, deployment rollback policy, incident response docs
- **Plan:** 5-6 step incident response plan

---

## Scenario 2: Feature Request

**Paste this text:**
```
Feature request: Add dark mode toggle to the user settings page. The toggle should 
persist across sessions using localStorage and respect the user's system preference 
by default. Should follow our existing design system patterns. Low priority, 
implement when time permits.
```

**Expected AI Output:**
- **Type:** Feature
- **Severity:** Low
- **Context:** UI component library docs, accessibility guidelines
- **Plan:** 5 step implementation plan

---

## Demo Flow

1. **Open the app** at http://localhost:5173
2. **Show empty board** - explain 3 columns (New, Ready, Approved)
3. **Paste Scenario 1** - watch AI process in real-time
4. **Open card drawer** - show AI insights (type, severity, context, plan)
5. **Click Approve** - card moves to Approved column
6. **Repeat with Scenario 2** - show feature classification
7. **Briefly show Langflow diagram** - explain agent architecture
