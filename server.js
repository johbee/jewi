const express = require('express');
const openai = require('openai');
const axios = require('axios');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });

const app = express();
app.use(cors());
app.use(express.json());

app.get('/random-verse', async (req, res) => {
  try {
    const response = await axios.get('https://labs.bible.org/api/?passage=random&type=json');
    const verse = response.data[0];
    res.json(verse);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching random verse' });
  }
});

app.get('/interpret-verse', (req, res) => fetchAnswer(req, res));

app.post('/interpret-verse', (req, res) => fetchAnswer(req, res));

const PORT = process.env.PORT || 3001;
const path = require('path');
app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

fetchAnswer = async (req, res) => {
  // res.json({answer:"be gone!"}); return;

  try {
    var { verse, userQuestion } = req.body;
    if(!verse) {
      verse = {
        text:"for god so loved the world that he sent his only begotten son",
        bookname:"john",
        chapter:3,
        verse:16
      };
    }
    if(!userQuestion) userQuestion = "";
    
    if(!!verse)
    var prompt = `The Bible verse is: "${verse.text} - ${verse.bookname} ${verse.chapter}:${verse.verse}". How can we integrate this verse into our modern lives? ${userQuestion}`;
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

    if(!response || !response.data || !response.data.choices || response.data.choices.length <= 0) {
      res.json({message:"Repent and try again. (no choices in response)"});
      return;
    }
    
    const answer = response.data.choices[0].text.trim();
    
    res.json({ answer });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "You pray to an anti-god ({error.message})" });
  }
}