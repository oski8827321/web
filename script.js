document.addEventListener('DOMContentLoaded', () => {
    const history = document.getElementById('history');
    const commandInput = document.getElementById('command-input');
    const promptContainer = document.getElementById('prompt-container');
    const terminalContent = document.getElementById('terminal-content');

    // --- Zjednodušená bootovací sekvence ---
    const bootSequence = [
        { text: 'Booting oskihoweb.com...', delay: 100 },
        { text: 'Initializing kernel...', delay: 200 },
        { text: 'Loading user profile: user...', delay: 150 },
        { text: 'System check: <span class="output-success">OK</span>', delay: 100 },
        { text: `
<span class="ascii-art">
 ⠀⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣀⠀⠀⠀⠀⠀⠀⠀⠀⣀⣠⣶⣿⣶⡾⠁
⠠⣿⡀⠀⠀⠀⢀⣀⣤⣶⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⠀
⠀⠙⢿⣶⣶⣾⣿⠿⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⠛⠿⠃⠀
⠀⠀⠀⠀⠀⠀⠀⠀⢸⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡃⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⣰⣿⣿⢿⣿⣿⠟⠁⠀⠀⠀⠈⢿⣿⠛⠻⢿⣦⡀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⣿⠟⠁⠘⢿⣿⠀⠀⠀⠀⠀⠀⠸⣿⡀⠀⠀⠹⠷⠀⠀
⠀⠀⠀⠀⠀⠀⠀⣿⣤⠀⠀⠀⠙⠷⠶⠀⠀⠀⠀⠀⠙⠛⠁⠀⠀⠀⠀⠀
</span>`, delay: 50 },
        { text: 'Welcome to my interactive portfolio.', delay: 100 },
        { text: 'Type <span class="command-highlight">help</span> to see a list of available commands.', delay: 100 },
    ];

    async function runBootSequence() {
        history.innerHTML = '';
        for (const line of bootSequence) {
            await new Promise(resolve => setTimeout(resolve, line.delay));
            printToHistory(line.text, true);
        }
        promptContainer.style.display = 'flex';
        commandInput.focus();
    }
    
    commandInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const commandLine = commandInput.value.trim();
            const promptText = document.querySelector('.prompt').textContent;
            if (commandLine) {
                printToHistory(`${promptText} ${commandLine}`, true);
            }
            handleCommand(commandLine);
            commandInput.value = '';
            terminalContent.scrollTop = terminalContent.scrollHeight;
        }
    });

    function handleCommand(commandLine) {
        const command = commandLine.toLowerCase().split(' ')[0];

        switch(command) {
            case 'help':
                printToHistory("Available commands:");
                printToHistory("  <span class='command-highlight'>about</span>     - Navigates to the 'About Me' page.", true);
                printToHistory("  <span class='command-highlight'>projects</span>  - Navigates to the 'Projects' page.", true);
                printToHistory("  <span class='command-highlight'>blog</span>      - Navigates to the 'Blog' page.", true);
                printToHistory("  <span class='command-highlight'>clear</span>     - Clears the terminal screen.", true);
                break;
            
            case 'about':
            case 'projects':
            case 'blog':
                handleRedirect(command);
                break;
            
            case 'clear':
                runBootSequence();
                return;

            case '':
                break;
           
    
            case '.onion':
                printToHistory("Onion Service Address:", true);
                printToHistory("<span class='output-success'>http://oskiweb4x6s7p3q2r9t8....onion</span>", true);
                printToHistory("<span class='log-warn'>(offline)</span>", true);
                break;
        

            default:
                printToHistory(`<span class="output-error">Error: Command not found: ${command}</span>`, true);
        }
    }
    
    function handleRedirect(section) {
        let targetUrl = '';
        switch(section) {
            case 'about':
                targetUrl = 'about/about.html';
                break;
            case 'projects':
                targetUrl = 'projects/projects.html';
                break;
            case 'blog':
                targetUrl = 'blog/blog.html';
                break;
        }

        if (targetUrl) {
            printToHistory(`Redirecting to <span class="output-info">${section}</span> page...`, true);
            setTimeout(() => {
                window.location.href = targetUrl;
            }, 500);
        }
    }

    function printToHistory(text, isHtml = false) {
        const p = document.createElement('p');
        if (isHtml) {
            p.innerHTML = text; 
        } else {
            p.textContent = text; 
        }
        history.appendChild(p);
        terminalContent.scrollTop = terminalContent.scrollHeight;
    }

    runBootSequence();
});