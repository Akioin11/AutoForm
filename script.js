class AutoFormGenerator {
    constructor() {
        this.initializeElements();
        this.bindEvents();
        this.currentFormHTML = '';
        this.currentFormCSS = '';
    }

    initializeElements() {
        this.promptInput = document.getElementById('promptInput');
        this.promptForm = document.getElementById('promptForm');
        this.generateBtn = document.getElementById('generateBtn');
        this.btnText = this.generateBtn.querySelector('.btn-text');
        this.spinner = this.generateBtn.querySelector('.spinner');
        this.previewPane = document.getElementById('previewPane');
        this.codePane = document.getElementById('codePane');
        this.generatedCode = document.getElementById('generatedCode');
        this.previewBtn = document.getElementById('previewBtn');
        this.codeBtn = document.getElementById('codeBtn');
        this.downloadBtn = document.getElementById('downloadBtn');
        this.fullscreenBtn = document.getElementById('fullscreenBtn');
        this.fullscreenModal = document.getElementById('fullscreenModal');
        this.fullscreenPreview = document.getElementById('fullscreenPreview');
        this.closeFullscreenBtn = document.getElementById('closeFullscreenBtn');
        this.googleSignInBtn = document.getElementById('googleSignInBtn');
        this.createGoogleFormBtn = document.getElementById('createGoogleFormBtn');
        this.googleSignInText = document.getElementById('googleSignInText');
        this.createGoogleFormText = document.getElementById('createGoogleFormText');
        this.suggestionList = document.getElementById('suggestionList');
    }

    bindEvents() {
        this.generateBtn.addEventListener('click', () => this.generateForm());
        if (this.promptForm) {
            this.promptForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.generateForm();
            });
        }
        this.promptInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.ctrlKey) {
                this.generateForm();
            }
        });
        this.previewBtn.addEventListener('click', () => this.showPreview());
        this.codeBtn.addEventListener('click', () => this.showCode());
        this.downloadBtn.addEventListener('click', () => this.downloadForm());
        this.fullscreenBtn.addEventListener('click', () => this.openFullscreen());
        this.closeFullscreenBtn.addEventListener('click', () => this.closeFullscreen());
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.fullscreenModal.classList.contains('active')) {
                this.closeFullscreen();
            }
        });
        // Google Sign-In and Google Form creation
        if (this.googleSignInBtn) {
            this.googleSignInBtn.addEventListener('click', () => this.handleGoogleSignIn());
        }
        if (this.createGoogleFormBtn) {
            this.createGoogleFormBtn.addEventListener('click', () => this.createGoogleForm());
        }
    }

    async generateForm() {
        const prompt = this.promptInput.value.trim();
        if (!prompt) {
            alert('Please enter a description for your form');
            return;
        }
        this.setLoading(true);
        try {
            const response = await fetch('/api/generate-form', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ prompt })
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'Failed to generate form');
            }
            this.currentFormHTML = data.html;
            this.currentFormCSS = data.css;
            this.displayForm(data.html, data.css);
            this.enableControls();
            this.showSuggestions(prompt, data.html);
        } catch (error) {
            console.error('Error generating form:', error);
            alert('Error generating form: ' + error.message);
        } finally {
            this.setLoading(false);
        }
    }

    showSuggestions(prompt, html) {
        if (!this.suggestionList) return;
        // Suggest possible improvements or iterations based on the prompt and form
        const suggestions = [];
        // Example: If the form has no file upload, suggest adding one
        if (!/type=["']?file["']?/i.test(html)) {
            suggestions.push('Add a file upload field (e.g., for attachments or resumes).');
        }
        // Suggest adding validation if not present
        if (!/required/i.test(html)) {
            suggestions.push('Add required validation to important fields.');
        }
        // Suggest adding a confirmation message
        suggestions.push('Add a confirmation message after form submission.');
        // Suggest customizing the submit button text
        if (!/type=["']?submit["']?[^>]*value=["']?[^"'>]+["']?/i.test(html)) {
            suggestions.push('Customize the submit button text to match the form purpose.');
        }
        // Suggest using select/radio for options if only text fields are present
        if (!/<select|type=["']?radio["']?/i.test(html)) {
            suggestions.push('Add dropdowns or radio buttons for fields with predefined options.');
        }
        // Suggest adding help text or tooltips
        suggestions.push('Add help text or tooltips for complex fields.');
        // Show suggestions
        this.suggestionList.innerHTML = suggestions.map(s => `<li>${s}</li>`).join('');
    }

    setLoading(loading) {
        this.generateBtn.disabled = loading;
        if (loading) {
            this.btnText.textContent = 'Generating...';
            this.spinner.classList.remove('hidden');
        } else {
            this.btnText.textContent = 'Generate Form';
            this.spinner.classList.add('hidden');
        }
    }

    displayForm(formHTML, formCSS) {
        const cleanHTML = this.cleanFormHTML(formHTML);
        const wrappedHTML = this.ensureAutoformWrapper(cleanHTML);
        this.previewPane.innerHTML = wrappedHTML;
        // Remove any previously injected style
        const prevStyle = document.getElementById('autoform-generated-style');
        if (prevStyle) prevStyle.remove();
        if (formCSS && formCSS.trim()) {
            const style = document.createElement('style');
            style.id = 'autoform-generated-style';
            style.textContent = formCSS;
            document.head.appendChild(style);
        }
        // Sync fullscreen preview content and style
        if (this.fullscreenPreview) {
            this.fullscreenPreview.innerHTML = wrappedHTML;
            // Remove any previous style in fullscreen
            const prevFSStyle = this.fullscreenPreview.querySelector('style#autoform-generated-style');
            if (prevFSStyle) prevFSStyle.remove();
            if (formCSS && formCSS.trim()) {
                const style = document.createElement('style');
                style.id = 'autoform-generated-style';
                style.textContent = formCSS;
                this.fullscreenPreview.appendChild(style);
            }
        }
        this.generatedCode.textContent =
            `<!-- HTML -->\n` + wrappedHTML +
            `\n\n/* CSS */\n` + (formCSS || '');
        this.showPreview();
    }

    ensureAutoformWrapper(html) {
        // If already wrapped, return as is
        if (/class=["']?autoform-generated-form["']?/i.test(html)) return html;
        // Otherwise, wrap it
        return `<div class=\"autoform-generated-form\">${html}</div>`;
    }

    cleanFormHTML(html) {
        // Remove any markdown code block markers if present
        let cleaned = html.replace(/```html\n?/g, '').replace(/```\n?/g, '');
        
        // Ensure we have a complete form
        if (!cleaned.includes('<form')) {
            cleaned = `<form>${cleaned}</form>`;
        }
        
        return cleaned.trim();
    }

    showPreview() {
        this.previewPane.classList.add('active');
        this.codePane.classList.remove('active');
        this.previewBtn.classList.add('active');
        this.codeBtn.classList.remove('active');
    }

    showCode() {
        this.previewPane.classList.remove('active');
        this.codePane.classList.add('active');
        this.previewBtn.classList.remove('active');
        this.codeBtn.classList.add('active');
    }

    enableControls() {
        this.downloadBtn.disabled = false;
        if (this.createGoogleFormBtn) this.createGoogleFormBtn.disabled = false;
        // Optionally, update Google sign-in UI if already signed in
        // this.setGoogleSignedInUI();
    }

    openFullscreen() {
        if (!this.fullscreenModal) return;
        this.fullscreenModal.classList.add('active');
        // Sync content in case of late open
        this.fullscreenPreview.innerHTML = this.previewPane.innerHTML;
        // Also inject style
        const prevFSStyle = this.fullscreenPreview.querySelector('style#autoform-generated-style');
        if (prevFSStyle) prevFSStyle.remove();
        if (this.currentFormCSS && this.currentFormCSS.trim()) {
            const style = document.createElement('style');
            style.id = 'autoform-generated-style';
            style.textContent = this.currentFormCSS;
            this.fullscreenPreview.appendChild(style);
        }
    }
    closeFullscreen() {
        if (!this.fullscreenModal) return;
        this.fullscreenModal.classList.remove('active');
    }

    async downloadForm() {
        // Use JSZip to create a zip with HTML and CSS
        if (!window.JSZip) {
            await this.loadJSZip();
        }
        const zip = new window.JSZip();
        const htmlContent = this.createCompleteHTMLDocument(this.currentFormHTML, this.currentFormCSS);
        zip.file('index.html', htmlContent);
        zip.file('style.css', this.currentFormCSS || '');
        const blob = await zip.generateAsync({ type: 'blob' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'autoform.zip';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    async loadJSZip() {
        // Dynamically load JSZip from CDN if not present
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    createCompleteHTMLDocument(formHTML, formCSS) {
        // Always wrap HTML in .autoform-generated-form
        const wrappedHTML = this.ensureAutoformWrapper(this.cleanFormHTML(formHTML));
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Generated Form</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    ${wrappedHTML}
    <script>
        // Basic form validation and submission handling
        document.addEventListener('DOMContentLoaded', function() {
            const forms = document.querySelectorAll('form');
            forms.forEach(form => {
                form.addEventListener('submit', function(e) {
                    e.preventDefault();
                    const formData = new FormData(form);
                    const data = Object.fromEntries(formData.entries());
                    console.log('Form submitted:', data);
                    alert('Form submitted! Check console for data.');
                });
            });
        });
    </script>
</body>
</html>`;
    }

    async handleGoogleSignIn() {
        this.googleSignInBtn.disabled = true;
        this.googleSignInText.textContent = 'Signing in...';
        // Open Google OAuth in a popup window
        const popup = window.open('http://localhost:3000/auth/google', 'googleSignInPopup', 'width=500,height=600');
        if (!popup) {
            alert('Popup blocked! Please allow popups for this site.');
            this.googleSignInBtn.disabled = false;
            this.googleSignInText.textContent = 'Sign in with Google';
            return;
        }
        // Listen for postMessage from popup
        const onMessage = (event) => {
            if (event.origin !== 'http://localhost:3000' && event.origin !== window.location.origin) return;
            if (event.data && event.data.type === 'google-auth-success') {
                this.setGoogleSignedInUI();
                window.removeEventListener('message', onMessage);
                try { popup.close(); } catch (e) {}
            }
        };
        window.addEventListener('message', onMessage);
    }

    // Call this after successful sign-in (for demo, just enable button)
    setGoogleSignedInUI() {
        this.googleSignInBtn.disabled = true;
        this.googleSignInText.textContent = 'Signed in with Google';
        this.createGoogleFormBtn.disabled = false;
    }

    async createGoogleForm() {
        if (!this.currentFormHTML) {
            alert('Please generate a form first.');
            return;
        }
        this.createGoogleFormBtn.disabled = true;
        this.createGoogleFormText.textContent = 'Creating...';
        // Map the current form to a minimal Google Forms API structure
        const formJson = this.mapFormToGoogleFormsApi();
        if (!formJson) {
            alert('Unable to map form to Google Forms API structure.');
            this.createGoogleFormBtn.disabled = false;
            this.createGoogleFormText.textContent = 'Create Google Form';
            return;
        }
        try {
            const response = await fetch('/api/create-google-form', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ form: formJson })
            });
            const data = await response.json();
            if (data.success && data.formUrl) {
                this.createGoogleFormText.textContent = 'Open Google Form';
                window.open(data.formUrl, '_blank');
            } else {
                this.createGoogleFormText.textContent = 'Create Google Form';
                alert('Failed to create Google Form: ' + (data.error || 'Unknown error'));
            }
        } catch (err) {
            this.createGoogleFormText.textContent = 'Create Google Form';
            alert('Error creating Google Form: ' + err.message);
        } finally {
            this.createGoogleFormBtn.disabled = false;
        }
    }

    mapFormToGoogleFormsApi() {
        // Very basic mapping: extract title and fields from the generated HTML
        // This can be improved for more complex forms
        let title = 'AI Generated Form';
        let items = [];
        // Try to extract a form title from the summary or prompt
        if (this.formSummary && this.formSummary.textContent) {
            title = this.formSummary.textContent.trim();
        }
        // Extract fields (input, select, textarea)
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = this.currentFormHTML;
        const inputs = tempDiv.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            let item = null;
            if (input.type === 'file') {
                // Google Forms API does not support file upload fields
                return; // skip file upload fields
            }
            if (input.type === 'text' || input.tagName === 'TEXTAREA') {
                item = {
                    title: input.placeholder || input.name || 'Text',
                    questionItem: {
                        question: {
                            textQuestion: { paragraph: input.tagName === 'TEXTAREA' }
                        }
                    }
                };
            } else if (input.type === 'email') {
                item = {
                    title: input.placeholder || input.name || 'Email',
                    questionItem: {
                        question: {
                            textQuestion: { paragraph: false }
                        }
                    }
                };
            } else if (input.type === 'checkbox' || input.type === 'radio') {
                // Group by name for options
                // (Not implemented in this minimal version)
            }
            if (item) items.push(item);
        });
        // TODO: Add select/options mapping
        if (items.length === 0) return null;
        return { title, items };
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AutoFormGenerator();
});
