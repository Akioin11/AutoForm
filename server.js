const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const fs = require('fs');

const { GoogleGenAI } = require('@google/genai');
const { google } = require('googleapis');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Gemini AI
console.log('Gemini API Key loaded:', process.env.GEMINI_API_KEY ? 'Yes (length: ' + process.env.GEMINI_API_KEY.length + ')' : 'No');
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Read template HTML and CSS
const template1Html = fs.readFileSync(path.join(__dirname, 'templates', 'temp1.html'), 'utf8');
const template1Css = fs.readFileSync(path.join(__dirname, 'templates', 'temp1.css'), 'utf8');
const template2Html = fs.readFileSync(path.join(__dirname, 'templates', 'temp2.html'), 'utf8');
const template2Css = fs.readFileSync(path.join(__dirname, 'templates', 'temp2.css'), 'utf8');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

// Template 1 (Contact Us)
const template1 = `
<style>
@import url('https://fonts.googleapis.com/css?family=Fjalla+One&display=swap');
* { margin: 0; padding: 0; }
body { background: url('https://s3-us-west-2.amazonaws.com/s.cdpn.io/38816/image-from-rawpixel-id-2210775-jpeg.jpg') center center no-repeat; background-size: cover; width: 100vw; height: 100vh; display: grid; align-items: center; justify-items: center; }
.contact-us { background: #f8f4e5; padding: 50px 100px; border: 2px solid rgba(0,0,0,1); box-shadow: 15px 15px 1px #ffa580, 15px 15px 1px 2px rgba(0,0,0,1); }
input { display: block; width: 100%; font-size: 14pt; line-height: 28pt; font-family: 'Fjalla One', sans-serif; margin-bottom: 28pt; border: none; border-bottom: 5px solid rgba(0,0,0,1); background: #f8f4e5; min-width: 250px; padding-left: 5px; outline: none; color: rgba(0,0,0,1); }
input:focus { border-bottom: 5px solid #ffa580; }
button { display: block; margin: 0 auto; line-height: 28pt; padding: 0 20px; background: #ffa580; letter-spacing: 2px; transition: .2s all ease-in-out; outline: none; border: 1px solid rgba(0,0,0,1); box-shadow: 3px 3px 1px 1px #95a4ff, 3px 3px 1px 2px rgba(0,0,0,1); font-family: 'Fjalla One', sans-serif; font-size: 14pt; cursor: pointer; }
button:hover { background: rgba(0,0,0,1); color: white; border: 1px solid rgba(0,0,0,1); }
::selection { background: #ffc8ff; }
input:-webkit-autofill, input:-webkit-autofill:hover, input:-webkit-autofill:focus { border-bottom: 5px solid #95a4ff; -webkit-text-fill-color: #2A293E; -webkit-box-shadow: 0 0 0px 1000px #f8f4e5 inset; transition: background-color 5000s ease-in-out 0s; }
</style>
<div class="contact-us">
  <form>
    <input placeholder="Name" type="text" required>
    <input placeholder="Email" type="email" name="customerEmail">
    <input placeholder="Phone" type="tel" name="customerPhone" pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}">
    <button type="submit">SIGN UP</button>
  </form>
</div>
`;

// Template 2 (PupAssure Signup)
const template2 = `
<style>
@import url('https://fonts.googleapis.com/css?family=Montserrat:400,600&display=swap');
* { box-sizing: border-box; margin: 0; padding: 0; }
body { align-items: center; background: #D8AA96; color: rgba(0,0,0,.8); display: grid; font-family: 'Montserrat',sans-serif; font-size: 14px; font-weight: 400; height: 100vh; justify-items: center; width: 100vw; }
.signup-container { display: grid; grid-template-areas: "left right"; max-width: 900px; }
.left-container { background: #807182; overflow: hidden; padding: 40px 0 0 0; position: relative; text-align: center; width: 300px; }
.left-container h1 { color: rgba(0,0,0,.8); display: inline-block; font-size: 24px; }
.left-container h1 i { background: #F7B1AB; border-radius: 50%; color: #807182; font-size: 24px; margin-right: 5px; padding: 10px; transform: rotate(-45deg); }
.left-container .puppy { bottom: -5px; position: absolute; text-align: center; }
.left-container .puppy:before { background: #807182; content: ""; height: 100%; left: 0; opacity: .4; position: absolute; width: 100%; z-index: 1; }
.left-container img { filter: sepia(100%); width: 70%; }
.right-container { background: #f9bdb7; display: grid; grid-template-areas: ". ."; width: 500px; }
.right-container h1:nth-of-type(1) { color: rgba(0,0,0,.8); font-size: 28px; font-weight: 600; }
.right-container .set { display: flex; justify-content: space-between; margin: 10px 0; }
.right-container input { border: 1px solid rgba(0,0,0,.1); border-radius: 4px; height: 38px; line-height: 38px; padding-left: 5px; }
.right-container input, .right-container label { color: rgba(0,0,0,.8); }
.right-container header { padding: 40px; }
.right-container label, .right-container input, .right-container .pets-photo { width: 176px; }
.right-container .pets-photo { align-items: center; display: grid; grid-template-areas: ". ."; }
.right-container .pets-photo button { border: none; border-radius: 50%; height: 38px; margin-right: 10px; outline: none; width: 38px; }
.right-container .pets-photo button i { color: rgba(0,0,0,.8); font-size: 16px; }
.right-container .pets-weight .radio-container { display: flex; justify-content: space-between; width: 100%; }
.right-container footer { align-items: center; background: #fff; display: grid; padding: 5px 40px; }
.right-container footer button { border: 1px solid rgba(0,0,0,.2); height: 38px; line-height: 38px; width: 100px; border-radius: 19px; font-family: 'Montserrat',sans-serif; }
.right-container footer #back { background: #fff; transition: .2s all ease-in-out; }
.right-container footer #back:hover { background: #171A2B; color: white; }
.right-container footer #next { background: #807182; border: 1px solid transparent; color: #fff; }
.right-container footer #next:hover { background: #171A2B; }
.pets-name label, .pets-breed label, .pets-birthday label, .pets-gender label, .pets-spayed-neutered label, .pets-weight label { display: block; margin-bottom: 5px; }
.radio-container { background: #fff; border: 1px solid rgba(0,0,0,.1); border-radius: 4px; display: inline-block; padding: 5px; }
.radio-container label { background: transparent; border: 1px solid transparent; border-radius: 2px; display: inline-block; height: 26px; line-height: 26px; margin: 0; padding: 0; text-align: center; transition: .2s all ease-in-out; width: 80px; }
.radio-container input[type="radio"] { display: none; }
.radio-container input[type="radio"]:checked + label { background: #F7B1AB; border: 1px solid rgba(0,0,0,.1); }
</style>
<div class="signup-container">
  <div class="left-container">
    <h1><i class="fas fa-paw"></i> PUPASSURE</h1>
    <div class="puppy">
      <img src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/38816/image-from-rawpixel-id-542207-jpeg.png" alt="Puppy">
    </div>
  </div>
  <div class="right-container">
    <header>
      <h1>Yay, puppies! Ensure your pup gets the best care!</h1>
      <div class="set">
        <div class="pets-name">
          <label for="pets-name">Name</label>
          <input id="pets-name" type="text" placeholder="Pet's name">
        </div>
        <div class="pets-photo">
          <button id="pets-upload" type="button"><i class="fas fa-camera-retro"></i></button>
          <label for="pets-upload">Upload a photo</label>
        </div>
      </div>
      <div class="set">
        <div class="pets-breed">
          <label for="pets-breed">Breed</label>
          <input id="pets-breed" type="text" placeholder="Pet's breed">
        </div>
        <div class="pets-birthday">
          <label for="pets-birthday">Birthday</label>
          <input id="pets-birthday" type="text" placeholder="MM/DD/YYYY">
        </div>
      </div>
      <div class="set">
        <div class="pets-gender">
          <label for="pet-gender-female">Gender</label>
          <div class="radio-container">
            <input id="pet-gender-female" name="pet-gender" type="radio" value="female" checked>
            <label for="pet-gender-female">Female</label>
            <input id="pet-gender-male" name="pet-gender" type="radio" value="male">
            <label for="pet-gender-male">Male</label>
          </div>
        </div>
        <div class="pets-spayed-neutered">
          <label for="pet-spayed">Spayed or Neutered</label>
          <div class="radio-container">
            <input id="pet-spayed" name="spayed-neutered" type="radio" value="spayed" checked>
            <label for="pet-spayed">Spayed</label>
            <input id="pet-neutered" name="spayed-neutered" type="radio" value="neutered">
            <label for="pet-neutered">Neutered</label>
          </div>
        </div>
      </div>
      <div class="pets-weight">
        <label for="pet-weight-0-25">Weight</label>
        <div class="radio-container">
          <input id="pet-weight-0-25" name="pet-weight" type="radio" value="0-25" checked>
          <label for="pet-weight-0-25">0-25 lbs</label>
          <input id="pet-weight-25-50" name="pet-weight" type="radio" value="25-50">
          <label for="pet-weight-25-50">25-50 lbs</label>
          <input id="pet-weight-50-100" name="pet-weight" type="radio" value="50-100">
          <label for="pet-weight-50-100">50-100 lbs</label>
          <input id="pet-weight-100-plus" name="pet-weight" type="radio" value="100+">
          <label for="pet-weight-100-plus">100+ lbs</label>
        </div>
      </div>
    </header>
    <footer>
      <div class="set">
        <button id="back" type="button">Back</button>
        <button id="next" type="button">Next</button>
      </div>
    </footer>
  </div>
</div>
`;

// Generate form endpoint
app.post('/api/generate-form', async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const systemPrompt = [
      'You are a professional web form designer. Based on the user\'s request, generate a complete HTML form and a corresponding CSS stylesheet.',
      '',
      'Requirements:',
      '- The form must look modern, clean, and visually appealing, suitable for a dashboard or business web app.',
      '- Use a material-inspired or dashboard style: subtle shadows, rounded corners, good spacing, and a neutral color palette (e.g., white, gray, blue, orange highlights).',
      '- The form HTML must be wrapped in a container with the class "autoform-generated-form".',
      '- All CSS selectors must be scoped to ".autoform-generated-form" (e.g., ".autoform-generated-form input { ... }").',
      '- Do NOT use any global selectors (no "body", "input", "button", "*", etc.).',
      '- Do not use external CSS frameworks.',
      '- Output the HTML and CSS separately. First output the HTML in a markdown code block labeled html, then output the CSS in a markdown code block labeled css.',
      '- Return only the HTML and CSS code, no explanations.',
      '',
      `User request: ${prompt}`,
      '',
      'Generate the HTML and CSS:'
    ].join('\n');

    const result = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: systemPrompt
    });
    const responseText = result.text;

    // Extract HTML and CSS code blocks from Gemini's response
    const htmlBlock = responseText.match(/```html([\s\S]*?)```/i);
    const cssBlock = responseText.match(/```css([\s\S]*?)```/i);
    const generatedHtml = htmlBlock ? htmlBlock[1].trim() : '';
    const generatedCss = cssBlock ? cssBlock[1].trim() : '';

    res.json({ 
      success: true, 
      html: generatedHtml,
      css: generatedCss,
      prompt 
    });

  } catch (error) {
    console.error('Error generating form:', error);
    res.status(500).json({ 
      error: 'Failed to generate form', 
      details: error.message 
    });
  }
});

// Generate Google Apps Script for Google Forms endpoint
app.post('/api/generate-apps-script', async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }
    const systemPrompt = [
      'You are a Google Apps Script expert. Based on the user\'s request, generate a complete Google Apps Script that creates a Google Form with the requested fields and settings.',
      '',
      'Requirements:',
      '- Output only the Apps Script code, in a markdown code block labeled javascript.',
      '- The script should create a new Google Form with the requested fields, types, and options.',
      '- Use best practices for Google Apps Script.',
      '- Do not include any explanations, only the code.',
      '',
      `User request: ${prompt}`,
      '',
      'Generate the Apps Script code:'
    ].join('\n');
    const result = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: systemPrompt
    });
    const responseText = result.text;
    // Extract code block
    const codeBlock = responseText.match(/```(?:javascript|js)([\s\S]*?)```/i);
    const scriptCode = codeBlock ? codeBlock[1].trim() : responseText.trim();
    res.json({
      success: true,
      script: scriptCode,
      prompt
    });
  } catch (error) {
    console.error('Error generating Apps Script:', error);
    res.status(500).json({
      error: 'Failed to generate Apps Script',
      details: error.message
    });
  }
});

// --- Google OAuth2 and Forms API Integration ---
// In-memory token storage for demo (replace with DB/session for production)
let oauth2Tokens = null;
let userTokens = {};

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  'http://localhost:3000/oauth2callback'
);
const SCOPES = [
  'https://www.googleapis.com/auth/forms.body',
  'https://www.googleapis.com/auth/forms.responses.readonly',
  'https://www.googleapis.com/auth/drive.file',
  'openid',
  'email',
  'profile'
];

// Endpoint to create a Google Form using the Forms API
app.post('/api/create-google-form', async (req, res) => {
  try {
    if (!oauth2Tokens) {
      return res.status(401).json({ error: 'User not authenticated with Google.' });
    }
    const { form } = req.body; // Expecting a JSON structure for the form
    if (!form) {
      return res.status(400).json({ error: 'Form structure is required.' });
    }
    oauth2Client.setCredentials(oauth2Tokens);
    const forms = google.forms({ version: 'v1', auth: oauth2Client });
    // Step 1: Create the form with only the title
    const createRes = await forms.forms.create({
      requestBody: {
        info: {
          title: form.title || 'Untitled Form',
          documentTitle: form.title || 'Untitled Form',
        }
      }
    });
    const formId = createRes.data.formId;
    // Step 2: Add items/questions using batchUpdate
    if (form.items && form.items.length > 0) {
      const requests = form.items.map((item, idx) => ({
        createItem: {
          item,
          location: { index: idx }
        }
      }));
      await forms.forms.batchUpdate({
        formId,
        requestBody: { requests }
      });
    }
    // Get the form to retrieve the responderUri
    const getRes = await forms.forms.get({ formId });
    res.json({ success: true, formId, formUrl: getRes.data.responderUri });
  } catch (error) {
    console.error('Error creating Google Form:', error);
    res.status(500).json({ error: 'Failed to create Google Form', details: error.message });
  }
});

// Step 1: Redirect user to Google for consent
app.get('/auth/google', (req, res) => {
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent',
  });
  res.redirect(url);
});

// Step 2: Handle OAuth2 callback
app.get('/oauth2callback', async (req, res) => {
  const code = req.query.code;
  if (!code) return res.status(400).send('Missing code');
  try {
    const { tokens } = await oauth2Client.getToken(code);
    // For demo, store in memory by a fake user id (in production, use session/user id)
    userTokens['demo'] = tokens;
    oauth2Tokens = tokens; // Store the tokens in the in-memory variable
    // Serve a minimal HTML page that notifies the opener and closes the popup
    res.send(`<!DOCTYPE html>
<html><body>
<script>
  if (window.opener) {
    window.opener.postMessage({ type: 'google-auth-success' }, '*');
    window.close();
  } else {
    // If not opened as a popup, fallback to redirect
    window.location = 'http://localhost:5173/';
  }
</script>
<p>Signed in! You can close this window.</p>
</body></html>`);
  } catch (err) {
    res.status(500).send('OAuth error: ' + err.message);
  }
});

// Serve the frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
