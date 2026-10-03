/**
 * Plan Generator Tool
 * Uses watsonx.ai / Granite LLM to generate action plans
 * Falls back to template-based implementation if API unavailable
 */

import { generateJSON, isWatsonxConfigured } from '../services/watsonx.js';

// Template-based plan generation for MVP
function generateTemplatePlan(summary, contextSnippets, type) {
    const plans = {
        incident: [
            { step: 1, action: 'Acknowledge and assess', description: 'Review the incident details and assess severity and impact scope' },
            { step: 2, action: 'Initial investigation', description: 'Check logs, metrics, and recent changes that might be related' },
            { step: 3, action: 'Implement mitigation', description: 'Apply temporary fix or rollback if needed to restore service' },
            { step: 4, action: 'Notify stakeholders', description: 'Update the status page and notify affected teams/customers' },
            { step: 5, action: 'Document and follow-up', description: 'Create incident report and schedule post-mortem review' }
        ],
        feature: [
            { step: 1, action: 'Requirements analysis', description: 'Clarify requirements and acceptance criteria with stakeholders' },
            { step: 2, action: 'Technical design', description: 'Create technical design document and get architecture review' },
            { step: 3, action: 'Implementation', description: 'Develop the feature following coding standards and best practices' },
            { step: 4, action: 'Testing', description: 'Write unit tests, integration tests, and perform QA testing' },
            { step: 5, action: 'Deployment', description: 'Deploy to staging, verify, then roll out to production' }
        ],
        task: [
            { step: 1, action: 'Understand the task', description: 'Review requirements and clarify any ambiguities' },
            { step: 2, action: 'Plan the work', description: 'Break down into subtasks and estimate effort' },
            { step: 3, action: 'Execute', description: 'Complete the work following established processes' },
            { step: 4, action: 'Review and test', description: 'Self-review and test the completed work' },
            { step: 5, action: 'Deliver', description: 'Submit for review and mark as complete' }
        ]
    };

    let plan = plans[type] || plans.task;

    // Add context-aware step if we have context
    if (contextSnippets && contextSnippets.length > 0) {
        const contextTitles = contextSnippets.map(s => s.title).join(', ');
        plan = [
            ...plan.slice(0, 2),
            { step: 3, action: 'Reference documentation', description: `Review relevant docs: ${contextTitles}` },
            ...plan.slice(2).map((p, i) => ({ ...p, step: i + 4 }))
        ];
    }

    return plan;
}

// watsonx.ai implementation
async function watsonxGeneratePlan(summary, contextSnippets, type) {
    const contextInfo = contextSnippets?.length > 0
        ? `\nRelevant documentation found:\n${contextSnippets.map(s => `- ${s.title}: ${s.content?.substring(0, 200)}...`).join('\n')}`
        : '';

    const prompt = `You are an engineering planning assistant. Generate an action plan for this work item.

Work Item Summary: ${summary}
Type: ${type}
${contextInfo}

Create a 5-6 step action plan. Each step should have:
- step: step number (1-6)
- action: brief action name (max 30 chars)
- description: detailed description (max 100 chars)

The plan should be practical and actionable for an engineering team.`;

    const schema = {
        steps: [
            { step: 1, action: "Action name", description: "What to do" },
            { step: 2, action: "Action name", description: "What to do" }
        ]
    };

    try {
        const result = await generateJSON(prompt, schema);

        // Handle both array and object responses
        let steps = result.steps || result.plan || result;
        if (!Array.isArray(steps)) {
            steps = Object.values(result).find(v => Array.isArray(v)) || [];
        }

        // Validate and normalize
        return steps.slice(0, 6).map((step, i) => ({
            step: i + 1,
            action: step.action?.substring(0, 50) || `Step ${i + 1}`,
            description: step.description?.substring(0, 150) || 'Complete this step'
        }));
    } catch (error) {
        console.error('watsonx.ai plan generation failed, using template:', error.message);
        return generateTemplatePlan(summary, contextSnippets, type);
    }
}

/**
 * Main export: Generate action plan
 */
export async function generatePlan(summary, contextSnippets, type) {
    if (!summary) {
        throw new Error('summary is required');
    }

    // Use watsonx if configured
    if (isWatsonxConfigured()) {
        console.log('🤖 Using watsonx.ai for plan generation...');
        return await watsonxGeneratePlan(summary, contextSnippets, type);
    }

    // Simulate API latency for mock
    await new Promise(resolve => setTimeout(resolve, 400));
    return generateTemplatePlan(summary, contextSnippets, type);
}
