const express = require('express');
const openai = require('openai');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Replace "your-api-key" with your actual API key from OpenAI
openai.apiKey = 'insert-key';

app.get('/random-verse', async (req, res) => {
  try {
    const response = await axios.get('https://labs.bible.org/api/?passage=random&type=json');
    const verse = response.data[0];
    res.json(verse);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching random verse' });
  }
});

app.post('/interpret-verse', async (req, res) => {
  try {
    const { verse, userQuestion } = req.body;

    const prompt = `The Bible verse is: "${verse.text} - ${verse.bookname} ${verse.chapter}:${verse.verse}". How can we integrate this verse into our modern lives? ${userQuestion}`;

    const { Configuration, OpenAIApi } = require("openai");
    const configuration = new Configuration({
      apiKey: process.env.OPENAI_API_KEY,
    });
    const openai = new OpenAIApi(configuration);
    const response = await openai.createCompletion({
      model: "davinci",
      prompt: prompt,
      max_tokens: 150,
      temperature: 0.5,
    });
    

    const answer = response.choices[0].text.trim();
    res.json({ answer });
  } catch (error) {
    res.status(500).json({ message: 'Error interpreting verse' });
  }
});

const PORT = process.env.PORT || 3001;
const path = require('path');
app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
