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
        this.formSummary = document.getElementById('formSummary');
        this.fieldList = document.getElementById('fieldList');
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
            this.updateFormSummary(prompt, data.html);
            this.updateFieldList(data.html);
        } catch (error) {
            console.error('Error generating form:', error);
            alert('Error generating form: ' + error.message);
        } finally {
            this.setLoading(false);
        }
    }

    updateFormSummary(prompt, html) {
        // Try to extract a summary from the prompt
        let summary = '';
        if (prompt) {
            summary = prompt.charAt(0).toUpperCase() + prompt.slice(1);
        }
        this.formSummary.innerHTML = summary;
    }

    updateFieldList(html) {
        // Extract field names from HTML
        const fieldMatches = html.match(/<label[^>]*>(.*?)<\/label>|placeholder=["']([^"']+)["']/gi);
        let fields = [];
        if (fieldMatches && fieldMatches.length > 0) {
            fields = fieldMatches.map(m => {
                const label = m.match(/<label[^>]*>(.*?)<\/label>/i);
                if (label) return label[1];
                const ph = m.match(/placeholder=["']([^"']+)["']/i);
                if (ph) return ph[1];
                return null;
            }).filter(Boolean);
        }
        this.fieldList.innerHTML = fields.length > 0
            ? fields.map(f => `<li>${f}</li>`).join('')
            : '<li style="color:#aaa">No fields detected</li>';
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
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AutoFormGenerator();
});
