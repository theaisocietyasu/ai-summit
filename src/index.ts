import express from 'express';
import path from 'path';
import { connectToDatabase } from './services/database';
import routes from './routes';
import { errorHandler } from './middleware';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, '../public')));

app.use('/api', routes);

app.get('/', (_req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.use(errorHandler);

// Connect to database on cold start
connectToDatabase().catch((error) => {
  console.error('Failed to connect to database:', error);
});

// Only start server when running locally (not on Vercel)
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

export default app;
