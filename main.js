const fs = require("fs");
const path = require("path");

const sourceDir = __dirname + "\\source";//путь к папке с проектом
const distDir = __dirname + "\\dist";// путь к папке с результатом

//1 вариант миграции
const firtsVariant = (line) => {
    let sIndex, eIndex;
    let res;
    res = "import";
    sIndex = line.indexOf(" ");
    eIndex = line.indexOf(" ", sIndex + 1);
    res += line.substring(sIndex, eIndex) + " from ";
    sIndex = line.indexOf("'");
    eIndex = line.indexOf("'", sIndex + 1);
    res += line.substring(sIndex, eIndex) + "';";
    res = res.replace(/\\/g, '');
    res += "\r";
    return res;
};

//2 вариант миграции
const secondVariant = (line) => {
    let sIndex, eIndex;
    let res;
    res = "import ";
    sIndex = line.indexOf(" ");
    eIndex = line.indexOf(" ", sIndex + 1);
    res += "{" + line.substring(sIndex + 1, eIndex) + "}" + " from ";
    sIndex = line.indexOf("'");
    eIndex = line.indexOf("'", sIndex + 1);
    res += line.substring(sIndex, eIndex) + "';";
    res = res.replace(/\\/g, '');
    res += "\r";
    return res;
};

// Возвращает данные для файла с заменённым require на import
const getResultFile = (path) => {
    let dataArray = fs.readFileSync(path).toString().split("\n");
    for(i in dataArray) {
        if(dataArray[i].includes("require")) {
            if((dataArray[i].startsWith("const") || dataArray[i].startsWith("var")) 
            && (dataArray[i].endsWith(";") || dataArray[i].endsWith(";\r"))){
                if(dataArray[i].endsWith(");") || dataArray[i].endsWith(");\r"))
                    dataArray[i] = firtsVariant(dataArray[i]);
                else
                    dataArray[i] = secondVariant(dataArray[i]);  
            }
        }
    }
    return dataArray;
};

//рекурсивная проверка директории
const getFilesRecursively = (directory) => {
    const filesInDirectory = fs.readdirSync(directory);//Получаем список файлов в директории
    for (const file of filesInDirectory) {
        let absolutePath = path.join(directory, file);//получаем абсолютный путь к объекту
        let resPath = absolutePath.replace(sourceDir, distDir);//получаем абсолютный путь к результирующему объекту
        //если объект - папка, создаем папку в результирующей директории
        if(fs.statSync(absolutePath).isDirectory()) {
            fs.mkdirSync(resPath, { recursive: true });
            getFilesRecursively(absolutePath);//рекурсивной проверяем эту папку
        } else {
            //проверяем является ли файл .js
            if(absolutePath.substring(absolutePath.length - 3) == ".js"){
                //получаем изменённый данные и создаем файл
                let dataArray = getResultFile(absolutePath);
                fs.writeFileSync(resPath, "", {encoding: "utf-8"});
                for(i in dataArray)
                    fs.writeFileSync(resPath, dataArray[i], {encoding: "utf-8", flag: "a"});
            }else{
                fs.copyFile(absolutePath, resPath, (err) => {});// все не .js файлы копируем без изменений
            }
        }
    }
};

getFilesRecursively(sourceDir);
console.log("Migration success");
