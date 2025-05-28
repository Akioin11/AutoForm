class AutoFormGenerator {
    constructor() {
        this.initializeElements();
        this.bindEvents();
        this.currentFormHTML = '';
        this.currentFormCSS = '';
    }

    initializeElements() {
        this.promptInput = document.getElementById('promptInput');
        this.generateBtn = document.getElementById('generateBtn');
        this.btnText = this.generateBtn.querySelector('.btn-text');
        this.spinner = this.generateBtn.querySelector('.spinner');
        
        this.previewPane = document.getElementById('previewPane');
        this.codePane = document.getElementById('codePane');
        this.generatedCode = document.getElementById('generatedCode');
        
        this.previewBtn = document.getElementById('previewBtn');
        this.codeBtn = document.getElementById('codeBtn');
        this.copyCodeBtn = document.getElementById('copyCodeBtn');
        this.downloadBtn = document.getElementById('downloadBtn');
    }

    bindEvents() {
        this.generateBtn.addEventListener('click', () => this.generateForm());
        this.promptInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.ctrlKey) {
                this.generateForm();
            }
        });

        this.previewBtn.addEventListener('click', () => this.showPreview());
        this.codeBtn.addEventListener('click', () => this.showCode());
        this.copyCodeBtn.addEventListener('click', () => this.copyCode());
        this.downloadBtn.addEventListener('click', () => this.downloadForm());
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
        } catch (error) {
            console.error('Error generating form:', error);
            alert('Error generating form: ' + error.message);
        } finally {
            this.setLoading(false);
        }
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
        // Ensure HTML is wrapped in .autoform-generated-form
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
        // Show both HTML and CSS in code view
        this.generatedCode.textContent =
            `<!-- HTML -->\n` + wrappedHTML +
            `\n\n/* CSS */\n` + (formCSS || '');
        // Show preview by default
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
        this.copyCodeBtn.disabled = false;
        this.downloadBtn.disabled = false;
    }

    async copyCode() {
        try {
            const code =
                `<!-- HTML -->\n` + this.cleanFormHTML(this.currentFormHTML) +
                `\n\n/* CSS */\n` + (this.currentFormCSS || '');
            await navigator.clipboard.writeText(code);
            // Temporary feedback
            const originalText = this.copyCodeBtn.textContent;
            this.copyCodeBtn.textContent = 'Copied!';
            this.copyCodeBtn.style.background = '#28a745';
            setTimeout(() => {
                this.copyCodeBtn.textContent = originalText;
                this.copyCodeBtn.style.background = '';
            }, 2000);
        } catch (error) {
            console.error('Failed to copy:', error);
            alert('Failed to copy to clipboard');
        }
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
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AutoFormGenerator();
});
