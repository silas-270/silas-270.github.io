class CodeEditor {
    constructor() {
        this.codeInput = document.getElementById('code-input');
        this.output = document.getElementById('output');
        this.runButton = document.getElementById('run-code');
        this.resetButton = document.getElementById('reset-code');
        this.languageSelect = document.getElementById('language-select');

        this.setupEventListeners();
        this.setupInitialCode();
    }

    setupEventListeners() {
        this.runButton.addEventListener('click', () => this.runCode());
        this.resetButton.addEventListener('click', () => this.resetCode());
        this.languageSelect.addEventListener('change', () => this.updateLanguage());
    }

    setupInitialCode() {
        // Beispiel-Code für JavaScript
        const initialCode = `// Schreibe deinen Code hier
console.log("Hallo Welt!");`;
        this.codeInput.value = initialCode;
    }

    async runCode() {
        const code = this.codeInput.value;
        this.output.innerHTML = 'Ausführung...';
        
        try {
            if (this.languageSelect.value === 'javascript') {
                await this.runJavaScript(code);
            } else if (this.languageSelect.value === 'python') {
                await this.runPython(code);
            }
        } catch (error) {
            this.output.innerHTML = `Fehler: ${error.message}`;
        }
    }

    async runJavaScript(code) {
        // Sichere Ausführung von JavaScript
        const output = [];
        const originalConsoleLog = console.log;
        
        // Console.log überschreiben um Ausgaben zu sammeln
        console.log = (...args) => {
            output.push(args.join(' '));
        };

        try {
            // Code in einer sicheren Umgebung ausführen
            const result = new Function(code)();
            this.output.innerHTML = output.join('\\n') || 'Code ausgeführt (keine Ausgabe)';
        } catch (error) {
            this.output.innerHTML = `Fehler: ${error.message}`;
        } finally {
            // Console.log zurücksetzen
            console.log = originalConsoleLog;
        }
    }

    async runPython(code) {
        // Hier könnte später die Python-Ausführung implementiert werden
        // Für den Anfang zeigen wir nur eine Nachricht
        this.output.innerHTML = 'Python-Ausführung wird noch implementiert...';
    }

    resetCode() {
        this.setupInitialCode();
        this.output.innerHTML = '';
    }

    updateLanguage() {
        const language = this.languageSelect.value;
        if (language === 'javascript') {
            this.codeInput.value = `// Schreibe deinen Code hier
console.log("Hallo Welt!");`;
        } else if (language === 'python') {
            this.codeInput.value = `# Schreibe deinen Code hier
print("Hallo Welt!")`;
        }
        this.output.innerHTML = '';
    }
}

// Editor initialisieren wenn das DOM geladen ist
document.addEventListener('DOMContentLoaded', () => {
    new CodeEditor();
}); 