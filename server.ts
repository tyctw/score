import express from 'express';
import path from 'path';
import cors from 'cors';
import { createServer as createViteServer } from 'vite';
import { createClient } from '@supabase/supabase-js';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Initialize Supabase client
// Missing keys will be handled gracefully
let supabase: ReturnType<typeof createClient> | null = null;
const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
}

// ===============================
// API Routes
// ===============================

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', supabase: !!supabase });
});

app.get('/api/entries', async (req, res) => {
  if (!supabase) {
    return res.status(503).json({ error: 'Supabase is not configured' });
  }
  
  try {
    const { data, error } = await supabase
      .from('score_entries')
      .select('*')
      .order('timestamp', { ascending: false });

    if (error) {
      throw error;
    }

    // Parse JSON fields if necessary, depends on how they are stored
    const formattedData = data.map(entry => ({
      ...entry,
      scores: typeof entry.scores === 'string' ? JSON.parse(entry.scores) : entry.scores
    }));

    res.json(formattedData);
  } catch (error) {
    console.error('Error fetching entries from Supabase:', error);
    res.status(500).json({ error: 'Failed to fetch entries' });
  }
});

app.post('/api/entries', async (req, res) => {
  if (!supabase) {
    return res.status(503).json({ error: 'Supabase is not configured' });
  }

  try {
    const { entry } = req.body;
    
    if (!entry) {
      return res.status(400).json({ error: 'Missing entry data' });
    }

    const { data, error } = await supabase
      .from('score_entries')
      .insert([
        {
          id: entry.id,
          year: entry.year,
          school: entry.school,
          department: entry.department,
          region: entry.region,
          scores: typeof entry.scores === 'object' ? JSON.stringify(entry.scores) : entry.scores, // Store as JSON string or object depending on schema
          total_points: entry.totalPoints,
          total_credits: entry.totalCredits || null,
          notes: entry.notes || '',
          timestamp: entry.timestamp,
        }
      ]);

    if (error) {
      throw error;
    }

    res.json({ status: 'success' });
  } catch (error) {
    console.error('Error saving entry to Supabase:', error);
    res.status(500).json({ status: 'error', message: 'Failed to save entry' });
  }
});

// ===============================
// Vite Integration
// ===============================

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
