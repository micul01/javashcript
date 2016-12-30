[![Stories in Ready](https://badge.waffle.io/micul01/javascriptix.png?label=ready&title=Ready)](http://waffle.io/micul01/javascriptix)

# javascriptix

A naive bash and gnu tools implementation in Javascript.

## Where to play with it?
The current version is available at [a link](https://micul01.github.io/javascriptix)

## Proof of Concept (December 2016)
The Proof of Concept version supports basic bash builtins:
- echo 
- cd
and basic binaries:
- pwd
- ls
- mkdir
- touch
- rm
- whoami
- clear
- cat
Other features (bash expansion, pipes, redirections etc.) as well as command options are not supported in this version. 


## Current development
Selective requirements extracted from the bash specification [a link](https://www.gnu.org/software/bash/manual/bash.html).
The progress can be seen [a link](https://waffle.io/micul01/javascriptix)
The underlying "operating system" features (filesystem, access management, etc.) are mocked and developed only on a need-to-test basis.
