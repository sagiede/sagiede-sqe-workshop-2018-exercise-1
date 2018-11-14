import * as esprima from 'esprima';
import * as escodegen from 'escodegen';

const parseCode = (codeToParse) => {
    var funcInput = esprima.parseScript(codeToParse, {loc: true});
    console.log(expTraverse(funcInput));
    return funcInput;
};

const makeRowExp = (type, line, name, value, condition ='') => {
    return {line: line,type: type, name: name,condition:condition, value: value};
};

const expConcatReducer = (acc, exp) => acc.concat(expTraverse(exp));


const expTraverse = (ast) => {
    return ast.type == 'Program' ? programTraverse(ast) :
        ast.type == 'FunctionDeclaration' ? functionTraverse(ast) :
            ast.type == 'variable declaration' ? variableDeclTraverse(ast) :
                ast.type == 'ExpressionStatement' ? assignmentExpTraverse(ast) :
                    ast.type == 'WhileStatement' ? whileExpTraverse(ast) :
                        ast.type == 'IfStatement' ? ifExpTraverse(ast) :
                            ast.type == 'ReturnStatement' ? returnTraverse(ast) : [] ;

};

const programTraverse = (ast) => {
    const programExp = makeRowExp(ast.type, ast.loc.start.line, '', '');
    const programBodyRows = ast.body.reduce(expConcatReducer, []);
    return [programExp, ...programBodyRows];
};

const functionTraverse = (ast) => {
    const params = ast.params.map((param) =>
        makeRowExp('variable declaration', param.loc.start.line, param.name, ''));
    const functionExp = makeRowExp(ast.type, ast.loc.start.line, ast.id.name, '');
    const funcBody = ast.body.body.reduce(expConcatReducer, []);
    return [functionExp, ...params, ...funcBody];
};

const variableDeclTraverse = (ast) => {
    const varDeclRows = ast.declarations.reduce((acc, varDecl) =>
        acc.concat(makeRowExp(ast.type, varDecl.loc.start.line, varDecl.id.name, '')), []);
    return varDeclRows;
};

const assignmentExpTraverse = (ast) => {
    const rightExpValue= escodegen.generate(ast.expression.right);
    const assignmentExp = makeRowExp(ast.expression.type,
        ast.expression.loc.start.line, ast.expression.left.name, rightExpValue);
    return [assignmentExp];
};

const whileExpTraverse = (ast) => {
    const condition = escodegen.generate(ast.test);
    const whileBodyRows = ast.body.body.reduce(expConcatReducer, []);
    const whileExp = makeRowExp(ast.type, ast.loc.start.line,'', '',condition);
    return [whileExp,...whileBodyRows];
};

const ifExpTraverse = (ast) => {
    const condition = escodegen.generate(ast.test);
    const ifConseqRows = expTraverse(ast.consequent);
    const ifAlterRows = expTraverse(ast.alternate);
    const ifExp = makeRowExp(ast.type, ast.loc.start.line,'', '',condition);
    return [ifExp,...ifConseqRows,...ifAlterRows];
};

const returnTraverse = (ast) => {
    const returnExp = makeRowExp(ast.type, ast.loc.start.line, '', escodegen.generate(ast.argument));
    return [returnExp];
};
export {parseCode};
