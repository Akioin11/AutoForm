# AutoForm - AI Form Generator

AutoForm is a web application that generates beautiful HTML forms using AI. Simply describe the form you want, and AutoForm will create a complete HTML form with styling using the Gemini AI API.

## Features

- 🤖 **AI-Powered Generation**: Uses Google's Gemini API to generate forms based on natural language descriptions
- 🎨 **Beautiful Styling**: Creates forms with modern, responsive CSS (no external frameworks needed)
- 👀 **Live Preview**: See your generated form in real-time
- 📝 **Code View**: View and copy the generated HTML/CSS code
- 💾 **Download**: Download the complete HTML file
- 📱 **Responsive**: Works perfectly on desktop and mobile devices

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- A Google Gemini API key

### Installation

1. **Clone or download the project**
   ```bash
   cd "d:\Development\VS Code\AutoForm"
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up your Gemini API key**
   - Get your API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Open the `.env` file
   - Replace `your_gemini_api_key_here` with your actual API key:
     ```
     GEMINI_API_KEY=your_actual_api_key_here
     PORT=3000
     ```

4. **Start the application**
   ```bash
   npm run dev
   ```

   This will start both the backend server (port 3000) and the frontend development server (port 5173).

5. **Open your browser**
   - Go to `http://localhost:5173`
   - Start generating forms!

### Production Build

To build for production:

```bash
npm run build
npm start
```

This will build the frontend and serve it from the Express server on port 3000.

## Usage Examples

Try these example prompts:

- "make a form for hotel booking with check-in date, check-out date, number of guests, room type, and special requests"
- "create a contact form with name, email, phone number, subject, and message"
- "build a job application form with personal details, work experience, and file upload for resume"
- "make a restaurant reservation form with date, time, party size, and dietary restrictions"
- "create a survey form about customer satisfaction with rating scales and feedback"

## Project Structure

```
AutoForm/
├── server.js          # Express server with Gemini API integration
├── index.html         # Main HTML file
├── style.css          # CSS styles (no external frameworks)
├── script.js          # Frontend JavaScript
├── vite.config.js     # Vite configuration
├── package.json       # Dependencies and scripts
├── .env              # Environment variables (API keys)
└── README.md         # This file
```

## API Endpoints

- `POST /api/generate-form` - Generate a form based on a text prompt
  - Body: `{ "prompt": "your form description" }`
  - Response: `{ "success": true, "form": "generated HTML", "prompt": "original prompt" }`

## Customization

The generated forms use inline CSS for easy customization. You can modify the system prompt in `server.js` to change the styling preferences or add additional requirements for the generated forms.

## Technologies Used

- **Frontend**: Vanilla JavaScript, HTML5, CSS3, Vite
- **Backend**: Node.js, Express.js
- **AI**: Google Gemini API
- **Styling**: Pure CSS (no frameworks like Bootstrap or Tailwind)

## Troubleshooting

1. **"Invalid API Key" error**: Make sure your Gemini API key is correctly set in the `.env` file
2. **Port conflicts**: Change the PORT in `.env` if port 3000 is already in use
3. **Form not generating**: Check the browser console and server logs for error messages

## License

MIT License - feel free to use this project for your own purposes!
