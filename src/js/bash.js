(function (j$) {
    
    let fs, context, bash;
    
    function contains(text, char) {
        return text.indexOf(char) > -1 ? char : null;
    }
    
    function isWhitespace(character) {
        return contains(" \t", character);
    }
    function isMeta(character) {
        return contains("\n|&;<>()", character);
    }
    
    function isQuote(character) {
        return contains("\"'", character);
    }
    
    function isEscape(character) {
        return contains("\\", character);
    }
    
    function Filters() {
        this.filters = [];
        this.addFilter = function (match, action) {
            this.filters.push({match: match, action: action});
        };
        this.doFilter = function (char) {
            var i = 0, match = false;
            while (i < this.filters.length) {
                match = this.filters[i].match(char);
                if (match) {
                    this.filters[i].action(char);
                }
                i++;
            }
        };
    }

    function IncompleteInputError() {
        this.base = Error;
    }
        
    function getTokenize() {
        var index = 0, start = 0, tokens = [], text = "";
        
        function init(input) {
            if (!text) {
                index = 0;
                start = 0;
                tokens = [];
            }
            text += input;
        }
        
        function add(i) {
            if (i > start) {
                tokens.push(text.substring(start, i));
                start = i;
            }
        }
        
        function findPair(char) {
            var i = start;
            do {
                i = text.indexOf(char, i + 1);
            } while (i > -1 && isEscape(text[i - 1]));
            if (i > -1) {
                add(i + 1);
                index = i;
            } else {
                throw new IncompleteInputError();
            }
        }
        
        return function (input) {
            var filters = new Filters();
            filters.addFilter(isWhitespace, function () { add(index); start++; });
            filters.addFilter(isMeta, function () { add(index); add(index + 1); });
            filters.addFilter(isQuote, function (char) { add(index); findPair(char); });
            init(input);
            
            while (index < text.length) {
                filters.doFilter(text[index]);
                index++;
            }
            add(index);
            text = "";
            return tokens;
        };
    }

    function stripQuotes(args) {
        args.forEach(function (crt, i, array) {
            if (crt && isQuote(crt[0])) {
                array[i] = crt.substr(1, crt.length - 2);
            }
        });
    }

    function isPath(command) {
        return command.indexOf('/') > -1;
    }

    function execute(sys, executable, command, args) {
        if (executable.content instanceof Function) {
            return executable.content(args);
        } else if (executable) {
            return interpret(sys, executable.content);
        } else {
            throw new Error(command + ': command not found');
        }
    }

    function getFromPATH(sys, filename) {
        var i = 0, file, dirs = sys.context.env.PATH.split(':');
        while (i < dirs.length && !file) {
            file = sys.fs.get(dirs[i] + '/' + filename, true);
            i++;
        }
        return file;
    }

    function interpret(sys, userInput) {
        if (!userInput) {
            return;
        }
        var tokens = this.tokenize(userInput);
        stripQuotes(tokens);

        let command = tokens[0];
        if (isPath(command)) {
            return execute(sys, sys.fs.get(command), command, tokens);
        } else if (this.builtins.hasOwnProperty(command)) {
            return this.builtins[command](tokens);
        } else {
            return execute(sys, getFromPATH(sys, command), command, tokens);
        }
    }
    
    function Bash(system) {
        let [fs, context] = [system.fs, system.context];
        
        this.tokenize = getTokenize();
        this.interpret = interpret.bind(this, system);
        this.IncompleteInputError = IncompleteInputError;
        j$.__initBuiltins(this, fs, context);
    }
        
    j$.__Bash = Bash;

}(window.j$ = window.j$ || {}));