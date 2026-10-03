import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cardsRouter from './routes/cards.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
// Local demo only: no auth, so never listen beyond this machine.
const HOST = '127.0.0.1';

// Middleware
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

// Routes
app.use('/api/cards', cardsRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, HOST, () => {
  console.log(`🚀 AI Agent Kanban Backend running on http://${HOST}:${PORT}`);
});

export default app;
