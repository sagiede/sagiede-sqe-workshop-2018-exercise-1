import * as esprima from 'esprima';

const parseCode = (codeToParse) => {
    var funcInput = esprima.parseScript(codeToParse);
    return funcInput;
};

export {parseCode};
