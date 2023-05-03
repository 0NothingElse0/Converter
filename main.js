const fs = require("fs");
const path = require("path");

const sourceDir = __dirname + "\\source";//путь к папке с проектом
const distDir = __dirname + "\\dist";// путь к папке с результатом

// Возвращает данные для файла с заменённым require на import
const getResultFile = (path) => {
    let dataArray = fs.readFileSync(path).toString().split("\n");
    for (i in dataArray) {
        if (dataArray[i].includes("require")) {
            dataArray[i] = dataArray[i].replace("const", "import");
            dataArray[i] = dataArray[i].replace("= require", "from");
            dataArray[i] = dataArray[i].replace("(", " ");
            dataArray[i] = dataArray[i].replace(")", "");
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
        if (fs.statSync(absolutePath).isDirectory()) {
            fs.mkdirSync(resPath, { recursive: true });
            getFilesRecursively(absolutePath);//рекурсивной проверяем эту папку
        } else {
            //проверяем является ли файл .js
            if(absolutePath.substring(absolutePath.length - 3) == ".js"){
                //получаем изменённый данные и создаем файл
                let dataArray = getResultFile(absolutePath);
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