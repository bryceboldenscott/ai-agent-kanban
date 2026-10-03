import { summarizeAndClassify } from '../tools/summarize.js';
import { fetchContext } from '../tools/context.js';
import { generatePlan } from '../tools/planner.js';

/**
 * Orchestrates the AI pipeline for a card
 * Sequence: Summarize → Context → Plan
 */
export async function orchestrateCard(card, cardsMap) {
    console.log(`🤖 Starting orchestration for card: ${card.id}`);

    try {
        card.processingStatus = 'processing';
        cardsMap.set(card.id, { ...card });

        // Step 1: Summarize & Classify
        console.log(`📝 Step 1: Summarizing card ${card.id}...`);
        const classification = await summarizeAndClassify(card.rawText);

        card.summary = classification.summary;
        card.type = classification.type;
        card.severity = classification.severity;
        card.title = classification.title || card.title;
        card.updatedAt = new Date().toISOString();
        cardsMap.set(card.id, { ...card });
        console.log(`✅ Classification complete: ${card.type} / ${card.severity}`);

        // Step 2: Fetch Context (RAG simulation)
        console.log(`🔍 Step 2: Fetching context for card ${card.id}...`);
        const contextSnippets = await fetchContext(card.summary, card.type);

        card.contextSnippets = contextSnippets;
        card.updatedAt = new Date().toISOString();
        cardsMap.set(card.id, { ...card });
        console.log(`✅ Found ${contextSnippets.length} relevant snippets`);

        // Step 3: Generate Plan
        console.log(`📋 Step 3: Generating plan for card ${card.id}...`);
        const plan = await generatePlan(card.summary, card.contextSnippets, card.type);

        card.proposedPlan = plan;
        card.status = 'ready';
        card.processingStatus = 'complete';
        card.updatedAt = new Date().toISOString();
        cardsMap.set(card.id, { ...card });
        console.log(`✅ Generated ${plan.length}-step plan`);

        console.log(`🎉 Orchestration complete for card: ${card.id}`);
        return card;

    } catch (error) {
        console.error(`❌ Orchestration failed for card ${card.id}:`, error);
        card.processingStatus = 'error';
        card.processingError = error.message;
        card.updatedAt = new Date().toISOString();
        cardsMap.set(card.id, { ...card });
        throw error;
    }
}
