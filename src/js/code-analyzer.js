import * as esprima from 'esprima';
import * as escodegen from 'escodegen';

const parseCode = (codeToParse) => {
    return esprima.parseScript(codeToParse);
};

const getDataFromCode = (codeToParse) => {
    let funcInput = esprima.parseScript(codeToParse, {loc: true});
    return expTraverse(funcInput);
};

const makeRowExp = (type, line, name, value, condition = '') => {
    return {line: line, type: type, name: name, condition: condition, value: value};
};

const expConcatReducer = (acc, exp) => acc.concat(expTraverse(exp));


const expTraverse = (ast) => {
    return ast.type == 'Program' ? programTraverse(ast) :
        ast.type == 'FunctionDeclaration' ? functionTraverse(ast) : loopAndConditionTraverse(ast);

};

const loopAndConditionTraverse = (ast) => {
    return ast.type == 'WhileStatement' ? whileExpTraverse(ast) :
        ast.type == 'IfStatement' ? ifExpTraverse(ast) :
            ast.type == 'ForStatement' ? forExpTraverse(ast) : simpleTraverse(ast);

};

const simpleTraverse = (ast) => {
    return ast.type == 'VariableDeclaration' ? variableDeclTraverse(ast) :
        ast.type == 'ReturnStatement' ? returnTraverse(ast) : expressionTypeTraverse(ast);

};

const expressionTypeTraverse = (ast) => {
    return ast.type == 'ExpressionStatement' ? expTraverse(ast.expression) :
        ast.type == 'AssignmentExpression' ? assignmentExpTraverse(ast) :
            ast.type == 'UpdateExpression' ? updateExpTraverse(ast) : [];

};

const programTraverse = (ast) => {
    const programBodyRows = ast.body.reduce(expConcatReducer, []);
    return [...programBodyRows];
};

const functionTraverse = (ast) => {
    const params = ast.params.map((param) =>
        makeRowExp('variable declaration', param.loc.start.line, param.name, ''));
    const functionExp = makeRowExp(ast.type, ast.loc.start.line, ast.id.name, '');
    const funcBody = ast.body.body.reduce(expConcatReducer, []);
    return [functionExp, ...params, ...funcBody];
};

const variableDeclTraverse = (ast) => {
    return ast.declarations.reduce((acc, varDecl) =>
        acc.concat(makeRowExp(ast.type, varDecl.loc.start.line, varDecl.id.name, varDecl.init ? varDecl.init.value : '')), []);
};

const assignmentExpTraverse = (ast) => {
    const rightExpValue = escodegen.generate(ast.right);
    const assignmentExp = makeRowExp(ast.type,
        ast.loc.start.line, ast.left.name, rightExpValue);
    return [assignmentExp];
};

const whileExpTraverse = (ast) => {
    const condition = escodegen.generate(ast.test);
    const whileBodyRows = ast.body.body.reduce(expConcatReducer, []);
    const whileExp = makeRowExp(ast.type, ast.loc.start.line, '', '', condition);
    return [whileExp, ...whileBodyRows];
};

const ifExpTraverse = (ast) => {
    const condition = escodegen.generate(ast.test);
    const ifConseqRows = expTraverse(ast.consequent);
    const ifAlterRows = expTraverse(ast.alternate);
    const ifExp = makeRowExp(ast.type, ast.loc.start.line, '', '', condition);
    return [ifExp, ...ifConseqRows, ...ifAlterRows];
};

const forExpTraverse = (ast) => {
    const assignmentRow = expTraverse(ast.init);
    const conditionRow = escodegen.generate(ast.test);
    const updateRow = expTraverse(ast.update);
    const forBodyRows = ast.body.body.reduce(expConcatReducer, []);
    const forExp = makeRowExp(ast.type, ast.loc.start.line, '', '', conditionRow);
    return [forExp, ...assignmentRow, ...updateRow, ...forBodyRows];
};

const updateExpTraverse = (ast) => {
    return [makeRowExp(ast.type, ast.loc.start.line, ast.argument.name, ast.operator)];
};

const returnTraverse = (ast) => {
    const returnExp = makeRowExp(ast.type, ast.loc.start.line, '', escodegen.generate(ast.argument));
    return [returnExp];
};
export {parseCode, getDataFromCode, expTraverse};
