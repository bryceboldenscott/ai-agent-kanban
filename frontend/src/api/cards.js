import axios from 'axios';

const API_BASE = '/api';

export const cardsApi = {
    // Get all cards
    getAll: async () => {
        const response = await axios.get(`${API_BASE}/cards`);
        return response.data;
    },

    // Get single card
    getById: async (id) => {
        const response = await axios.get(`${API_BASE}/cards/${id}`);
        return response.data;
    },

    // Create new card
    create: async (rawText, title) => {
        const response = await axios.post(`${API_BASE}/cards`, { rawText, title });
        return response.data;
    },

    // Approve card plan
    approve: async (id) => {
        const response = await axios.patch(`${API_BASE}/cards/${id}/approve`);
        return response.data;
    },

    // Reject / send back card
    reject: async (id) => {
        const response = await axios.patch(`${API_BASE}/cards/${id}/reject`);
        return response.data;
    },

    // Delete card
    delete: async (id) => {
        await axios.delete(`${API_BASE}/cards/${id}`);
    }
};

export default cardsApi;
