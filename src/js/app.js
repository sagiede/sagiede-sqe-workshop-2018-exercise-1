import $ from 'jquery';
import {parseCode} from './code-analyzer';
import * as esprima from 'esprima';

$(document).ready(function () {
    $('#codeSubmissionButton').click(() => {
        let codeToParse = $('#codePlaceholder').val();
        let parsedCode = parseCode(codeToParse);
        astTraverse(parsedCode);
        $('#parsedCode').val(JSON.stringify(parsedCode, null, 2));
    });
});

let symbolsList = [];
symbolsList.push({line : 1 , type : 'tsttype1' , name: 'tstname1' , value : 0});
symbolsList.push({line : 1 , type : 'tsttype2' , name: 'tstname2' , value : 0});

const astTraverse = (parsedCode) => {
    if (parsedCode){
        symbolsList.push();
    }
};

//keet traversing on the tree