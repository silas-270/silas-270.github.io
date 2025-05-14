class CodeEditor {
    constructor() {
        this.codeInput = document.getElementById('code-input');
        this.output = document.getElementById('output');
        this.runButton = document.getElementById('run-code');
        this.exampleButton = document.getElementById('example-code');
        this.languageSelect = document.getElementById('language-select');
        this.pyodide = null;
        this.isLoadingPyodide = false;

        this.setupEventListeners();
        this.setupInitialCode();
    }

    async loadPyodide() {
        if (this.pyodide || this.isLoadingPyodide) return;
        
        this.isLoadingPyodide = true;
        this.output.innerHTML = 'Lade Python-Unterstützung...';
        
        try {
            this.pyodide = await loadPyodide({
                indexURL: "https://cdn.jsdelivr.net/pyodide/v0.24.1/full/"
            });
            this.output.innerHTML = '';
        } catch (error) {
            console.error('Fehler beim Laden von Pyodide:', error);
            this.output.innerHTML = 'Fehler beim Laden von Python-Unterstützung';
        } finally {
            this.isLoadingPyodide = false;
        }
    }

    setupEventListeners() {
        this.runButton.addEventListener('click', () => this.runCode());
        this.exampleButton.addEventListener('click', () => this.loadExample());
        this.languageSelect.addEventListener('change', () => {
            this.updateLanguage();
            if (this.languageSelect.value === 'python') {
                this.loadPyodide();
            }
        });
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
                if (!this.pyodide) {
                    await this.loadPyodide();
                }
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
            this.output.innerHTML = output.join('\n') || 'Code ausgeführt (keine Ausgabe)';
        } catch (error) {
            this.output.innerHTML = `Fehler: ${error.message}`;
        } finally {
            // Console.log zurücksetzen
            console.log = originalConsoleLog;
        }
    }

    async runPython(code) {
        if (!this.pyodide) {
            this.output.innerHTML = 'Fehler: Python-Unterstützung konnte nicht geladen werden';
            return;
        }

        try {
            // Ausgabe sammeln
            this.pyodide.runPython(`
                import sys
                from io import StringIO
                sys.stdout = StringIO()
            `);

            // Code ausführen
            await this.pyodide.runPythonAsync(code);
            const output = this.pyodide.runPython("sys.stdout.getvalue()");
            this.output.innerHTML = output || 'Code ausgeführt (keine Ausgabe)';
        } catch (error) {
            this.output.innerHTML = `Fehler: ${error.message}`;
        }
    }

    resetCode() {
        this.setupInitialCode();
        this.output.innerHTML = '';
    }

    updateLanguage() {
        const language = this.languageSelect.value;
        // Aktuellen Code speichern
        const currentCode = this.codeInput.value;
        
        // Code für die neue Sprache vorbereiten
        let newCode;
        if (language === 'javascript') {
            // JavaScript-Code aus Python-Code konvertieren
            newCode = currentCode
                .replace(/^#/gm, '//')  // Python-Kommentare zu JS-Kommentaren
                .replace(/print\((.*?)\)/g, 'console.log($1)')  // print zu console.log
                .replace(/def\s+(\w+)\s*\((.*?)\):/g, 'function $1($2) {')  // def zu function
                .replace(/^(\s*)return\s+(.*?)$/gm, '$1return $2;')  // return mit Semikolon
                .replace(/^(\s*)(.*?)$/gm, '$1$2;')  // Zeilen mit Semikolon
                .replace(/f"(.*?)"/g, '"$1"')  // f-Strings zu normalen Strings
                .replace(/;$;/g, ';')  // Doppelte Semikolons entfernen
                .replace(/;$/gm, '')  // Semikolons am Ende von Blöcken entfernen
                .replace(/\n\s*}/g, '\n}')  // Geschweifte Klammern korrigieren
                || `// Schreibe deinen Code hier
console.log("Hallo Welt!");`;
        } else if (language === 'python') {
            // Python-Code aus JavaScript-Code konvertieren
            newCode = currentCode
                .replace(/^\/\//gm, '#')  // JS-Kommentare zu Python-Kommentaren
                .replace(/console\.log\((.*?)\)/g, 'print($1)')  // console.log zu print
                .replace(/function\s+(\w+)\s*\((.*?)\)\s*{/g, 'def $1($2):')  // function zu def
                .replace(/^(\s*)return\s+(.*?);$/gm, '$1return $2')  // return ohne Semikolon
                .replace(/;$/, '')  // Semikolons am Ende entfernen
                .replace(/}$/gm, '')  // Geschweifte Klammern entfernen
                || `# Schreibe deinen Code hier
print("Hallo Welt!")`;
        }
        
        this.codeInput.value = newCode;
        this.output.innerHTML = '';
    }

    loadExample() {
        const language = this.languageSelect.value;
        if (language === 'javascript') {
            this.codeInput.value = `// Ein einfaches Beispiel
function begrüßen(name) {
    return "Hallo " + name + "!";
}

// Funktion aufrufen
console.log(begrüßen("Silas"));`;
        } else if (language === 'python') {
            this.codeInput.value = `# Ein einfaches Beispiel
def begrüßen(name):
    return f"Hallo {name}!"

# Funktion aufrufen
print(begrüßen("Silas"))`;
        }
        this.output.innerHTML = '';
    }
}

// Editor initialisieren wenn das DOM geladen ist
document.addEventListener('DOMContentLoaded', () => {
    new CodeEditor();
}); 