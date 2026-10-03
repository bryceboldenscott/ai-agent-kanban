import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load corpus from JSON file
let corpus = [];
try {
    const corpusPath = join(__dirname, '..', 'data', 'corpus.json');
    corpus = JSON.parse(readFileSync(corpusPath, 'utf-8'));
} catch (error) {
    console.error('Failed to load corpus:', error);
}

/**
 * Simple keyword matching for RAG simulation
 * @param {string} text - Text to match against
 * @param {string[]} keywords - Keywords to look for
 * @returns {number} - Match score
 */
function calculateMatchScore(text, keywords) {
    const textLower = text.toLowerCase();
    let score = 0;

    for (const keyword of keywords) {
        if (textLower.includes(keyword.toLowerCase())) {
            score += 1;
        }
    }

    return score;
}

/**
 * Context Fetch Tool (Fake RAG)
 * Retrieves relevant runbook/policy snippets based on summary and type
 * @param {string} summary - Card summary
 * @param {string} type - Card type (incident/feature/task)
 * @returns {Promise<Array<{id: string, title: string, type: string, content: string, relevanceScore: number}>>}
 */
export async function fetchContext(summary, type) {
    if (!summary) {
        return [];
    }

    // Simulate API latency
    await new Promise(resolve => setTimeout(resolve, 300));

    // Score each document
    const scoredDocs = corpus.map(doc => ({
        ...doc,
        relevanceScore: calculateMatchScore(summary, doc.keywords)
    }));

    // Filter and sort by relevance
    const relevantDocs = scoredDocs
        .filter(doc => doc.relevanceScore > 0)
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, 3); // Return top 3 matches

    // If no matches found, return generic docs based on type
    if (relevantDocs.length === 0) {
        const fallbackDocs = corpus
            .filter(doc => {
                if (type === 'incident') return doc.type === 'runbook' || doc.type === 'policy';
                if (type === 'feature') return doc.type === 'guide';
                return true;
            })
            .slice(0, 2)
            .map(doc => ({ ...doc, relevanceScore: 0.5 }));

        return fallbackDocs;
    }

    return relevantDocs.map(({ id, title, type, content, relevanceScore }) => ({
        id,
        title,
        type,
        content,
        relevanceScore
    }));
}
