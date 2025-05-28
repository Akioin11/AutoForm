const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { GoogleGenAI } = require('@google/genai');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Gemini AI
console.log('Gemini API Key loaded:', process.env.GEMINI_API_KEY ? 'Yes (length: ' + process.env.GEMINI_API_KEY.length + ')' : 'No');
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

// Generate form endpoint
app.post('/api/generate-form', async (req, res) => {
  try {
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const systemPrompt = `
    You are a web form generator. Based on the user's request, generate a complete HTML form with inline CSS styling.
    
    Requirements:
    1. Generate only the HTML form element with all necessary input fields
    2. Include inline CSS for modern, professional styling
    3. Use semantic HTML5 form elements
    4. Include proper form validation attributes
    5. Make the form responsive and accessible
    6. Use a clean, modern design with good spacing and typography
    7. Include proper labels and placeholders
    8. Add a submit button with appropriate styling
    9. Do not use any external CSS frameworks like Bootstrap or Tailwind
    10. Return only the HTML code, no explanations

    User request: ${prompt}
    
    Generate a complete, styled HTML form:
    `;    const result = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: systemPrompt
    });
    const generatedForm = result.text;

    res.json({ 
      success: true, 
      form: generatedForm,
      prompt: prompt 
    });

  } catch (error) {
    console.error('Error generating form:', error);
    res.status(500).json({ 
      error: 'Failed to generate form', 
      details: error.message 
    });
  }
});

// Serve the frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
