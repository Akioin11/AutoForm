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

    const systemPrompt = `
You are a web form generator. Based on the user's request, generate a complete HTML form using one of the following templates as a base. Adapt the template as needed to fit the requested fields and requirements.

Template 1:
${template1}

Template 2:
${template2}

Requirements:
- Use/adapt one of the provided templates for design and structure.
- Only generate the HTML form element and the necessary CSS (inline in a <style> tag).
- Use semantic HTML5 form elements.
- Include proper form validation attributes.
- Make the form responsive and accessible.
- Include proper labels and placeholders.
- Add a submit button with appropriate styling.
- Do not use any external CSS frameworks like Bootstrap or Tailwind.
- Return only the HTML and CSS code, no explanations.

User request: ${prompt}

Generate a complete, styled HTML form:
`;
    const result = await ai.models.generateContent({
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
