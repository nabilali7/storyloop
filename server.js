require('dotenv').config();
const express = require('express');
const cors = require('cors');
const os = require('os');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
app.use(cors());
app.use(express.json()); // To parse JSON request bodies

function getLocalExternalIPv4() {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    if (!nets[name]) continue;
    for (const net of nets[name]) {
      // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return 'localhost';
}

let history = [];

// --- Gemini AI Initialization ---
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("GEMINI_API_KEY not found in .env file. Please set it.");
  process.exit(1); // Exit if API key is not set
}

const genAI = new GoogleGenerativeAI(apiKey);

// Configure the model
const model = genAI.getGenerativeModel({
  model: 'gemini-2.5-flash-lite-preview-06-17', // Or your preferred model
  // systemInstruction: 'You are a creative app-idea generator. Your goal is to provide unique and practical ideas.' // You can add more specific instructions here if needed.
});

// --- Configuration for Idea Generation ---
// You can adjust these parameters to control the creativity and diversity of ideas
const generationConfig = {
  temperature: 0.9, // Higher temperature for more creativity
  topP: 0.9,
  topK: 40,
  maxOutputTokens: 512, // Limit the output length
  responseMimeType: "text/plain", // Expect plain text output
};

app.get('/test.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'test.html'));
});

app.post('/api/reset', (req, res) => {
  history = [];
  res.sendStatus(200);
});

app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'Missing message' });

    // Add user turn
    history.push({ role: 'user', parts: [{ text: message }] });

    // Send full history to Gemini
    const session = model.startChat({ generationConfig, history });
    const result = await session.sendMessage(message);
    const reply = result.response.text();

    // Record model turn
    history.push({ role: 'model', parts: [{ text: reply }] });

    res.json({ reply });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Chat failed' });
  }
});


// --- API Endpoint for Generating Ideas ---
app.post('/api/generateIdea', async (req, res) => {
  try {
    // Expect a prompt in the request body, e.g., { "prompt": "Suggest app ideas for remote workers" }
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Please provide a 'prompt' in the request body." });
    }

    console.log(`Received prompt: "${prompt}"`);

    // Start a chat session to generate the idea.
    // Although it's not a multi-turn conversation, using startChat allows us
    // to pass the systemInstruction and generationConfig more cleanly.
    // Alternatively, you could use model.generateContent directly if you don't need history.
    const chatSession = model.startChat({
      // You can pass your systemInstruction here if you defined it above
      // systemInstruction: 'You are a creative app-idea generator. Your goal is to provide unique and practical ideas.',
      generationConfig,
      history: [
        // This is where you would add any initial context or previous turns if it were a conversational generation.
        // For a single idea generation, we can start with the user's prompt.
        { role: "user", parts: [{ text: prompt }] },
      ],
    });

    // Send the prompt to the model. Since history is already set up with the user's prompt,
    // we can just call sendMessage with an empty string or the prompt again if needed.
    // For a single, stateless generation, model.generateContent is often simpler.
    // Let's switch to model.generateContent for a cleaner single-request generation:

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig, // Apply the generation configuration
    });

    const response = result.response;
    const text = response.text();

    if (!text) {
      console.warn("Gemini API returned an empty response.");
      return res.status(500).json({ error: "Failed to generate an idea. Empty response from AI." });
    }

    console.log(`Generated idea: "${text}"`);
    res.json({ idea: text });

  } catch (error) {
    console.error("Error in /api/generateIdea:", error);
    // Provide more specific error messages if possible
    if (error.message.includes('API key') || error.status === 401) {
      res.status(401).json({ error: 'Invalid Gemini API key.' });
    } else {
      res.status(500).json({ error: 'Failed to generate idea. Please try again later.' });
    }
  }
});

// --- Start the Server ---
const PORT = process.env.PORT || 3000; // Use environment variable for port or default to 3000
const HOST = getLocalExternalIPv4();
app.listen(PORT, () => {
  console.log(`Idea Generator server running on:`);
  console.log(`  • http://localhost:${PORT}`);
  console.log(`  • http://${HOST}:${PORT}`);
});