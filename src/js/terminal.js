define(['system'], function (defaultSystem) {

    var j$Div, stdin, results, promptString;

    function readUserInput() {
        return stdin.value.trim();
    }

    function resetPrompt(context, string) {
        stdin.value = '';
        promptString.textContent = string || context.promptString();
    }

    function newElement(elementType, classList, textContent, id) {
        var element = document.createElement(elementType);
        element.textContent = textContent;
        element.id = id;
        classList.forEach(function (crt) {
            element.classList.add(crt);
        });
        return element;
    }

    function show(text, showPromptText) {
        var line = document.createElement('div');
        if (showPromptText) {
            line.appendChild(newElement('span', ['commandText', 'promptText'], promptString.textContent));
        }
        if (text) {
            line.appendChild(newElement('span', ['preformatted'], text));
        }
        results.appendChild(line);
    }

    function listen(bash, sys, e) {
        if (e.keyCode === 13) {
            processInput(bash, sys, readUserInput());
            return false;
        }
    }

    function buildUi(bash, sys) {
        let context = sys.context;
        j$Div = document.getElementById('javascriptix');
        j$Div.innerHTML = '';
        results = newElement('div', ['commandText', 'normalText'], '', 'results');
        promptString = newElement('span', ['commandText', 'promptText'], '', 'prompt-string');
        stdin = newElement('textarea', ['commandText', 'normalText'], '', 'stdin');

        stdin.addEventListener('keypress', listen.bind(null, bash, sys));
        resetPrompt(context);

        j$Div.appendChild(results);
        let commandline = newElement('div', [], '', 'command-line');
        let psWrapper = newElement('div', [], '', 'ps-wrapper');
        psWrapper.appendChild(promptString);
        commandline.appendChild(psWrapper);
        let stdinWrapper = newElement('div', [], '', 'stdin-wrapper');
        stdinWrapper.appendChild(stdin);
        commandline.appendChild(stdinWrapper);
        j$Div.appendChild(commandline);
        stdin.focus();
    }

    function processInput(bash, sys, userInput) {
        let promptString;
        show(userInput, true);
        let [input, output, error]  = [sys.getFileByDescriptor(0), sys.getFileByDescriptor(1), sys.getFileByDescriptor(2)];
        input.append(userInput);
        if (bash.process()) {
            show(error.readline());
            show(output.read());
            output.consume();
            input.consume();
        } else {
            promptString = '> ';
            input.rewind();
        }
        resetPrompt(sys.context, promptString);
    }

    function Terminal(bash, sys) {
        let system = sys || defaultSystem;
        this.init =  buildUi.bind(this, bash, system);
        this.processInput = processInput.bind(this, bash, system);
    }

    return Terminal;
});
