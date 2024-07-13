const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();

app.use(cors());

const SEMANTIC_SCHOLAR_API = 'https://api.semanticscholar.org/graph/v1';

app.get('/api/paper/search', async (req, res) => {
  try {
    const response = await axios.get(`${SEMANTIC_SCHOLAR_API}/paper/search`, {
      params: req.query
    });
    res.json(response.data);
  } catch (error) {
    console.error('Error calling Semantic Scholar API:', error);
    res.status(error.response?.status || 500).json({ error: 'An error occurred while searching papers' });
  }
});

app.get('/api/paper/:paperId', async (req, res) => {
  try {
    const response = await axios.get(`${SEMANTIC_SCHOLAR_API}/paper/${req.params.paperId}`, {
      params: req.query
    });
    res.json(response.data);
  } catch (error) {
    console.error('Error calling Semantic Scholar API:', error);
    res.status(error.response?.status || 500).json({ error: 'An error occurred while fetching paper details' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));