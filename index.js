
function searchKeywords(file){
    let keywords=[];
    let isInKeywordRange = false;
    console.log((file.split("\n")).length);
    for (let i = 0; i < (file.split("\n")).length; i++) {
        let line = file.split("\n")[i];
        if (!isInKeywordRange) {
            isInKeywordRange = /^\*\*\*+\sKeywords?\s\*\*\*/i.test(line)
            console.log(isInKeywordRange);
        }
        else {
            if (/^\*\*\*+\s[\w+\s?]+\s\*\*\*/.test(line)) {
                isInKeywordRange = false;
            }
            else {
                let match = line.match(/^((\w+\s?)+)$/);
                if (!isNullOrUndefined(match)) {
                    let keyword = match[1].replace(/\s+$/, "");
                    let args= [];
                    let ret = "";
                    let loc = 'location ';
                    do {
                        i++;
                        line = file.split("\n")[i];
                        if (!isNullOrUndefined(line)) {
                            if (/^\s{2,}\[Arguments\]/i.test(line)) {
                                args = line.split(/\s{2,}/).slice(2);
                                for (let j = 0; j < args.length; j++) {
                                    args[j] = args[j].replace("{", "").replace("}", "");
                                }
                            }
                            else if (/^\s{2,}\[Return\]/i.test(line)) {
                                let retur = line.split(/\s{2,}/)[2];
                                if (!isNullOrUndefined(retur)) {
                                    ret = retur.replace("{", "").replace("}", "");
                                }
                            }
                            match = line.match(/^((\w+\s?)+)$/);
                            isInKeywordRange = !(/^\*\*\*+\s[\w+\s?]+\s\*\*\*/.test(line));
                        }
                    } while (ret == "" && match == null && i < (file.split("\n").length - 1) && isInKeywordRange);
                    i--;
                    let key = {keyword:keyword, loc:loc, args:args, ret:ret};
                    keywords.push(key);
                }
                else{
                    // console.log(file.split("\n")[i+1]);
                }
            }

        }
    }
    console.log(keywords);
    return keywords;
}
function searchVariables(file){
    let variables=new Set();
    let isInVariableField = false;
    for (let i = 0; i < file.split("\n").length ; i++) {
        let line = file.split("\n")[i];
        if (!isInVariableField) {
            isInVariableField = /^\*\*\*+\sVariables?\s\*\*\*/i.test(line);
            if (!isInVariableField) {
                let match = line.match(/\$\{[^${}]+\}/g);
                if (match) {
                    let found = 0;
                    let end = 0;
                    for (let j = 0; j < match.length; j++) {
                        found = line.indexOf(match[j], found + end);
                        end = end + match[j].length;
                        let name = match[j].replace("${", "").replace("}", "");
                        // let variable = Variable.generateVariable(file, name, false, i, found + 2);
                        variables.add(name);
                    }
                }
            }
        }
        else {
            if (/^\*\*\*+\s[\w+\s?]+\s\*\*\*/.test(line)) {
                isInVariableField = false;
            }
            else {
                if (/^\$\{[^${}]+\}/.test(line)) {
                    let temp = line.split(/\s{2,}/);
                    let name = temp[0].replace("${", "").replace("}", "");
                    let value = temp.slice(1);
                    // let variable = Variable.generateVariable(file, name, true, i, 2);
                    // variable.value = value;
                    // variable.isGlobal = true;
                    variables.add({name,value});
                }
            }
        }
    }
    console.log(Array.from(variables));
    return Array.from(variables);
}

function searchLibraries(file){
    var libraries=new Set();
    for (let i = 0; i < file.split("\n").length ; i++) {
        let line = file.split("\n")[i];
        if (/^Library+/.test(line)) {
            let library = line.split(/\s{2,}/)[1];
            libraries.add(library);
        }   
}
    console.log(libraries);
    return libraries;
}


function formatVariables(varNamees){
    let varFormat=[];
    for (let i = 0; i < varNames.length; i++) {
        varFormat.push("{" + varNames[i] + "}");
    }
    return varFormat;
}

function isNullOrUndefined(obj){
    return typeof obj === 'undefined' || obj === null;
}

let file=`
*** Settings ****
Library  Selenium1
Library  Selenium2
Library  Selenium3

*** Variables ***
\${aa}   dsdsds   dsds     fffff
\${aaZAZA}   dsdsdsdqsdqd   dsdsdsdqsdqd    dsdsdsdqsdqd
\${aaZAZAZ}   dsdsdssdqdq

*** Keywords ***
Wait Until Page Contains Element Succeeds
    [Arguments]    \${locator}    {dsdssd}
    Wait Until  Keyword Succeeds      10x    5s    Wait Until Page Contains Element    {locator}
    
Wait Until Page Contains Succeeds
    [Arguments]    {text}
    Wait Until Keyword Succeeds    10x    5s    Wait Until Page Contains    {text}         
    
Wait Until Element Is Visible Succeeds
    [Arguments]    {locator}      
       Wait Until Keyword Succeeds    {RETRIES}      {RETRY_INTERVAL}    Wait Until Element Is Visible    {locator}     
    
Wait Until Element Is Not Visible Succeeds
    [Arguments]    {locator}
    Wait Until Keyword Succeeds    {RETRIES}      {RETRY_INTERVAL}    Wait Until Element Is Not Visible    {locator}     
    
Wait Until Page Does Not Contains Element Succeeds
    [Arguments]                    {locator}
       Wait Until Keyword Succeeds    10x    10s       Wait Until Page Does Not Contain Element        {locator}

Switch To Main Window
    Select Window     MAIN
    
Switch To The Latest Window
  Select Window        NEW    

Replace Value In XPATH
    [Arguments]    {xpath}             {name}
    {loc}=        Replace String    {xpath}    {strToReplace}      {name}   1
    [Return]       {loc}
    
Replace Values In XPATH
    [Arguments]    {xpath}          {name}     {name2}
    {loc}=        Replace String    {xpath}    {strToReplace}     {name}   1
    {loc}=        Replace String    {loc}      {strToReplace2}    {name2}  1
    Log            {loc}
    [Return]       {loc}

Check if Element Is displayed
    [arguments]    {element}
    Execute JavaScript       window.scrollBy(900, 900);
    Execute JavaScript       window.scrollBy(900, 900);
    Execute JavaScript       window.scrollBy(900, 900);
    Execute JavaScript       window.scrollBy(900, 900);
    Wait Until Page Contains Element    {element}

Table Rows Number
    [Arguments]    {tableLocator}
    Wait Until Page Contains Element    {tableLocator}
    {rows}    Get Element Count    {tableLocator}
    [Return]    {rows}
    
Change Zoom Of Page
    Execute javascript  document.body.style.zoom="80%"`;
document.addEventListener('DOMContentLoaded',function(){
    var btn=document.getElementById("handle");
    btn.addEventListener("click",function(event){
        searchKeywords(file);
        searchVariables(file);
        searchLibraries(file);
    })
});