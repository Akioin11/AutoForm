class AutoFormGenerator {
    constructor() {
        this.initializeElements();
        this.bindEvents();
        this.currentFormHTML = '';
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

            this.currentFormHTML = data.form;
            this.displayForm(data.form);
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

    displayForm(formHTML) {
        // Clean the HTML and display in preview
        const cleanHTML = this.cleanFormHTML(formHTML);
        this.previewPane.innerHTML = cleanHTML;
        this.generatedCode.textContent = cleanHTML;
        
        // Show preview by default
        this.showPreview();
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
            await navigator.clipboard.writeText(this.currentFormHTML);
            
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

    downloadForm() {
        const fullHTML = this.createCompleteHTMLDocument(this.currentFormHTML);
        const blob = new Blob([fullHTML], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'generated-form.html';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    createCompleteHTMLDocument(formHTML) {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Generated Form</title>
</head>
<body>
    ${formHTML}
    
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
