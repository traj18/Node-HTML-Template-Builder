//imports
var fs = require("fs-extra");
var path = require("path");
var pretty = require('pretty');

//variable
var template_path = "./template";
var outputPath = "./build";
var styleConst = "style.css";
var componentConst = "component.html";
var scriptConst = "script.js";

var getCssFromComponents = function(componentsArr){
    var cssString = "";
    for(var component of componentsArr){
        cssString += fs.readFileSync(component+"/"+styleConst);
    }
    return cssString;
}
var getJsFromComponents = function(componentsArr){
    var jsString = "";
    for(var component of componentsArr){
        jsString += fs.readFileSync(component+"/"+scriptConst);
    }
    return jsString;
}
var getHtmlFromComponents = function(pageName,pageTitle,componentsArr){
    var htmlString = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta http-equiv="X-UA-Compatible" content="ie=edge">
            <link rel="stylesheet" href="${'./css/'+pageName+'.css'}">
            <title>${pageTitle}</title>
        </head>
        <body>`;
    for(var component of componentsArr){
        htmlString += fs.readFileSync(component+"/"+componentConst);
    }
    htmlString += `<script src="${'./js/'+pageName+'.js'}"></script>
        </body>
    </html>`;
    return  pretty(htmlString)
}
//Generating Build Files
var getPagesFromTemplate = function (templateJson) {
    console.log('Generating Build Files...');
    try {
        for (var page of templateJson.pages) {
            var pageName = page.page_name;
            var pageComponentsArr = []
            pageComponentsArr = pageComponentsArr.concat(templateJson.common_from_top
                ,page.page_components
                ,templateJson.common_from_end);
            fs.writeFileSync(path.join(outputPath+"/css", pageName + '.css'),
                getCssFromComponents(pageComponentsArr));
            fs.writeFileSync(path.join(outputPath+"/js", pageName + '.js'),
                getJsFromComponents(pageComponentsArr));
            fs.writeFileSync(path.join(outputPath, pageName + '.html'),
                getHtmlFromComponents(pageName,page.title,pageComponentsArr));
        }
    }
    catch (err) {
        console.log('Error during page generation: ' + err);
        process.exit(1);
    }
}
console.log("Getting Template Data...");
try {
    for (var template of fs.readdirSync(template_path)) {
        var templateJson = JSON.parse(fs.readFileSync(path.join(template_path, template), 'utf-8'));
        getPagesFromTemplate(templateJson);
    }
}
catch (err) {
    console.log(err);
    process.exit(1);
}