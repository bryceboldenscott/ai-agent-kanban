/**
 * watsonx.ai Client Service
 * Handles authentication and text generation with IBM watsonx.ai
 */

import { WatsonXAI } from '@ibm-cloud/watsonx-ai';
import { IamAuthenticator } from 'ibm-cloud-sdk-core';

let watsonxClient = null;

/**
 * Initialize the watsonx.ai client
 */
function getClient() {
    if (!watsonxClient) {
        const apiKey = process.env.WATSONX_API_KEY;
        const projectId = process.env.WATSONX_PROJECT_ID;
        const serviceUrl = process.env.WATSONX_URL || 'https://us-south.ml.cloud.ibm.com';

        if (!apiKey || apiKey === 'your_api_key_here') {
            console.log('⚠️ watsonx.ai API key not configured');
            return null;
        }

        if (!projectId || projectId === 'your_project_id_here') {
            console.log('⚠️ watsonx.ai Project ID not configured');
            return null;
        }

        try {
            watsonxClient = WatsonXAI.newInstance({
                version: '2024-05-31',
                serviceUrl: serviceUrl,
                authenticator: new IamAuthenticator({
                    apikey: apiKey,
                }),
            });
            console.log('✅ watsonx.ai client initialized');
        } catch (error) {
            console.error('❌ Failed to initialize watsonx.ai client:', error.message);
            return null;
        }
    }
    return watsonxClient;
}

/**
 * Check if watsonx.ai is configured
 */
export function isWatsonxConfigured() {
    const apiKey = process.env.WATSONX_API_KEY;
    const projectId = process.env.WATSONX_PROJECT_ID;
    return apiKey && apiKey !== 'your_api_key_here' &&
        projectId && projectId !== 'your_project_id_here';
}

/**
 * Generate text using watsonx.ai
 */
export async function generateText(prompt, options = {}) {
    const client = getClient();
    if (!client) {
        throw new Error('watsonx.ai client not configured');
    }

    const projectId = process.env.WATSONX_PROJECT_ID;
    const modelId = options.modelId || 'ibm/granite-3-8b-instruct';

    const params = {
        input: prompt,
        modelId: modelId,
        projectId: projectId,
        parameters: {
            decoding_method: 'greedy',
            max_new_tokens: options.maxTokens || 500,
            min_new_tokens: 1,
            stop_sequences: options.stopSequences || [],
            repetition_penalty: 1.1,
        }
    };

    try {
        console.log(`🤖 Calling watsonx.ai with model: ${modelId}`);
        const response = await client.generateText(params);

        if (response.result && response.result.results && response.result.results[0]) {
            const text = response.result.results[0].generated_text.trim();
            console.log(`✅ watsonx.ai generated ${text.length} chars`);
            return text;
        }

        throw new Error('No text generated');
    } catch (error) {
        console.error('❌ watsonx.ai error:', error.message);
        throw error;
    }
}

/**
 * Generate structured JSON output using watsonx.ai
 */
export async function generateJSON(prompt, schema = {}) {
    const jsonPrompt = `${prompt}

Respond ONLY with valid JSON matching this structure. No explanation, no markdown, just JSON:
${JSON.stringify(schema, null, 2)}`;

    const text = await generateText(jsonPrompt, {
        maxTokens: 800,
        stopSequences: ['\n\n\n']
    });

    // Extract JSON from response
    let jsonStr = text;

    // Handle if wrapped in markdown code blocks
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
        jsonStr = jsonMatch[1];
    }

    // Find JSON object in response
    const objectMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (objectMatch) {
        jsonStr = objectMatch[0];
    }

    try {
        return JSON.parse(jsonStr);
    } catch (parseError) {
        console.error('Failed to parse JSON from watsonx response:', text);
        throw new Error('Invalid JSON response from watsonx.ai');
    }
}

export default { generateText, generateJSON, isWatsonxConfigured };
