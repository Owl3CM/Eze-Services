// this js script join the files like this
// file1.txt
// content of the file1.txt

// file2.txt
// content of the file2.txt

const fs = require("fs");
const path = require("path");
const args = process.argv.slice(2);

const folderPath = args[0];

let joinedFiles = "";

const JoinFolderContentWithNameAndContent = (folderPath) => {
  const files = fs.readdirSync(folderPath);
  let joinedFiles = "";
  files.forEach((file) => {
    const filePath = path.join(folderPath, file);
    const fileStat = fs.statSync(filePath);
    if (file === "joinedFiles.js") return;

    if (fileStat.isDirectory()) {
      joinedFiles += JoinFolderContentWithNameAndContent(filePath);
    } else {
      joinedFiles += `//Path: ${filePath} \n${file}\n${fs.readFileSync(filePath)}\n\n`;
    }
  });
  return joinedFiles;
};

joinedFiles = JoinFolderContentWithNameAndContent(folderPath);

fs.writeFileSync(path.join(folderPath, "joinedFiles.js"), joinedFiles);
console.log("Files joined successfully");
