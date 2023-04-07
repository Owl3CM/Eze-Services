const pak = require("../package.json");
const fs = require("fs");
const { promisify } = require("util");
const exec = promisify(require("child_process").exec);

async function run() {
  const versions = pak.version.split(".");
  const version = `${versions[0]}.${versions[1]}.${+versions[2] + 1}`;
  const buildDist = "yarn build";
  const addComent = "git add .";
  const publish = `yarn publish --new-version ${version} --access public`;
  const gitStage = `git commit -m "v ${version}"`;
  const gitPush = "git push";
  try {
    await exec("clear");
    await exec(addComent);
    await exec(buildDist);
    // await exec(gitStage);
    await exec(publish);
    await exec(gitPush);
    console.log("published!");
  } catch (error) {
    console.error(`Error executing commands: ${error}`);
  }
}
run();
function toggleProd(path, prod) {
  fs.readFile(path, (err, fileData) => {
    if (err) throw err;
    let fileDataArray = fileData.toString().split("\n").slice(0, -1);
    let updatedData = "";
    if (prod) {
      fileDataArray.map((line, index) => {
        updatedData += `${line.includes("clean-on-prod") && !line.startsWith("//") ? "//" : ""}${line}\n`;
      });
    } else {
      fileDataArray.map((line) => {
        updatedData += `${line.startsWith("//") && line.includes("clean-on-prod") ? line.slice(2) : line}\n`;
      });
      console.log(updatedData);
    }
    fs.writeFile(path, updatedData, (err) => {
      if (err) throw err;
      console.log(prod ? "cleaned!" : "un-cleaned!", updatedData);
    });
  });
}

function addImportForCssInDist() {
  const dataToInsert = "import './index.css';";
  insertToFile("./dist/cjs/index.ts", dataToInsert);
  insertToFile("./dist/esm/index.ts", dataToInsert);
}

function insertToFile(path, dataToInsert) {
  fs.readFile(path, (err, fileData) => {
    const updatedFile = dataToInsert + "\n" + fileData;
    if (err) throw err;
    fs.writeFile(path, updatedFile, (err) => {
      if (err) throw err;
      console.log(`[${dataToInsert}] inserted to  ${path}`);
    });
  });
}
