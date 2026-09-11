import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import setRoutes from './routes/setRoutes.js';

const app = express();
const PORT = process.env.PORT || 4000;

const allowedOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

app.use(cors({ origin: allowedOrigins.length ? allowedOrigins : true }));
app.use(express.json({ limit: '5mb' }));

app.get('/', (req, res) =>
  res.json({ app: 'QuizletSibling API', status: 'ok', endpoints: ['/api/sets', '/api/health'] })
);
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/sets', setRoutes);

app.use((err, req, res, next) => {
  res.status(err.status || 500).json({ message: err.message || 'Server error' });
});

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});