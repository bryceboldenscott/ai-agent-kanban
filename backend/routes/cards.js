import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { orchestrateCard } from '../services/orchestrator.js';

const router = express.Router();

// In-memory database
const cards = new Map();

// POST /api/cards - Create card and trigger AI pipeline
router.post('/', async (req, res) => {
    try {
        const { rawText, title } = req.body;

        if (!rawText) {
            return res.status(400).json({ error: 'rawText is required' });
        }

        const id = uuidv4();
        const now = new Date().toISOString();

        // Create initial card
        const card = {
            id,
            title: title || 'Untitled Card',
            rawText,
            status: 'new',
            type: null,
            severity: null,
            summary: null,
            contextSnippets: [],
            proposedPlan: [],
            approvedPlan: null,
            createdAt: now,
            updatedAt: now,
            processingStatus: 'pending'
        };

        cards.set(id, card);

        // Trigger AI orchestration (async)
        orchestrateCard(card, cards).catch(err => {
            console.error(`Error processing card ${id}:`, err);
            card.processingStatus = 'error';
            card.processingError = err.message;
            cards.set(id, card);
        });

        res.status(201).json(card);
    } catch (error) {
        console.error('Error creating card:', error);
        res.status(500).json({ error: 'Failed to create card' });
    }
});

// GET /api/cards - List all cards
router.get('/', (req, res) => {
    const allCards = Array.from(cards.values());
    // Sort by createdAt descending
    allCards.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(allCards);
});

// GET /api/cards/:id - Get single card
router.get('/:id', (req, res) => {
    const card = cards.get(req.params.id);

    if (!card) {
        return res.status(404).json({ error: 'Card not found' });
    }

    res.json(card);
});

// PATCH /api/cards/:id/approve - Approve plan
router.patch('/:id/approve', (req, res) => {
    const card = cards.get(req.params.id);

    if (!card) {
        return res.status(404).json({ error: 'Card not found' });
    }

    card.approvedPlan = true;
    card.status = 'approved';
    card.updatedAt = new Date().toISOString();
    cards.set(card.id, card);

    res.json(card);
});

// PATCH /api/cards/:id/reject - Send back / reject plan
router.patch('/:id/reject', (req, res) => {
    const card = cards.get(req.params.id);

    if (!card) {
        return res.status(404).json({ error: 'Card not found' });
    }

    card.approvedPlan = false;
    card.status = 'new';
    card.updatedAt = new Date().toISOString();
    cards.set(card.id, card);

    res.json(card);
});

// DELETE /api/cards/:id - Delete card
router.delete('/:id', (req, res) => {
    const card = cards.get(req.params.id);

    if (!card) {
        return res.status(404).json({ error: 'Card not found' });
    }

    cards.delete(req.params.id);
    res.status(204).send();
});

export default router;
