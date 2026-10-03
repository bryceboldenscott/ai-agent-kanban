/**
 * Summarize & Classify Tool
 * Uses watsonx.ai / Granite LLM to analyze raw text
 * Falls back to mock implementation if API unavailable
 */

import { generateJSON, isWatsonxConfigured } from '../services/watsonx.js';

// Mock implementation for MVP (works without watsonx.ai)
function mockSummarize(rawText) {
    const text = rawText.toLowerCase();

    // Detect type
    let type = 'task';
    if (text.includes('error') || text.includes('500') || text.includes('down') ||
        text.includes('incident') || text.includes('alert') || text.includes('crash') ||
        text.includes('fail') || text.includes('urgent')) {
        type = 'incident';
    } else if (text.includes('feature') || text.includes('add') || text.includes('implement') ||
        text.includes('create') || text.includes('build') || text.includes('new')) {
        type = 'feature';
    }

    // Detect severity
    let severity = 'medium';
    if (text.includes('critical') || text.includes('urgent') || text.includes('asap') ||
        text.includes('production') || text.includes('down') || text.match(/\b(p0|p1|sev1)\b/)) {
        severity = 'high';
    } else if (text.includes('minor') || text.includes('low') || text.includes('when possible') ||
        text.includes('nice to have')) {
        severity = 'low';
    }

    // Generate summary
    const firstSentence = rawText.split(/[.!?]/)[0].trim();
    const summary = firstSentence.length > 120
        ? firstSentence.substring(0, 117) + '...'
        : firstSentence;

    // Generate title
    const words = rawText.split(/\s+/).slice(0, 6).join(' ');
    const title = words.length > 50 ? words.substring(0, 47) + '...' : words;

    return {
        summary,
        type,
        severity,
        title: title.charAt(0).toUpperCase() + title.slice(1)
    };
}

// watsonx.ai implementation
async function watsonxSummarize(rawText) {
    const prompt = `You are an engineering work classifier. Analyze this work item and classify it.

Work Item:
"""
${rawText}
"""

Analyze and respond with JSON containing:
- type: "incident" (errors, outages, bugs), "feature" (new functionality), or "task" (general work)
- severity: "high" (urgent/production issues), "medium" (normal priority), or "low" (nice to have)
- summary: A concise 1-sentence summary (max 120 chars)
- title: A short title (max 50 chars)`;

    const schema = {
        type: "incident|feature|task",
        severity: "high|medium|low",
        summary: "Brief summary here",
        title: "Short title"
    };

    try {
        const result = await generateJSON(prompt, schema);

        // Validate and normalize the response
        return {
            type: ['incident', 'feature', 'task'].includes(result.type) ? result.type : 'task',
            severity: ['high', 'medium', 'low'].includes(result.severity) ? result.severity : 'medium',
            summary: result.summary?.substring(0, 150) || rawText.substring(0, 100),
            title: result.title?.substring(0, 60) || rawText.substring(0, 50)
        };
    } catch (error) {
        console.error('watsonx.ai summarize failed, using mock:', error.message);
        return mockSummarize(rawText);
    }
}

/**
 * Main export: Summarize and classify raw text
 */
export async function summarizeAndClassify(rawText) {
    if (!rawText || typeof rawText !== 'string') {
        throw new Error('rawText must be a non-empty string');
    }

    // Use watsonx if configured
    if (isWatsonxConfigured()) {
        console.log('🤖 Using watsonx.ai for summarization...');
        return await watsonxSummarize(rawText);
    }

    // Simulate API latency for mock
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockSummarize(rawText);
}
