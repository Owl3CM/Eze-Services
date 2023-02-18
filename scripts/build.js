const fs = require('fs')
const { promisify } = require('util')
const exec = promisify(require('child_process').exec)

async function run() {
  // toggleProd('./src/index.js', true)
  const removeDist = 'rm -rf dist'
  const buildDist = 'rollup -c --exports auto'
  const copyCss = 'cp -rp src/css dist'
  try {
    await exec('clear')
    await exec(removeDist)
    await exec(buildDist)
    await exec(copyCss)
    // toggleProd('./src/index.js', false)
    // addImportForCssInDist()
  } catch (error) {
    console.error(`Error executing commands: ${error}`)
  }
}

run()

function toggleProd(path, prod) {
  fs.readFile(path, (err, fileData) => {
    if (err) throw err
    let fileDataArray = fileData.toString().split('\n').slice(0, -1)
    let updatedData = ''
    if (prod) {
      fileDataArray.map((line, index) => {
        updatedData += `${
          line.includes('clean-on-prod') && !line.startsWith('//') ? '//' : ''
        }${line}\n`
      })
    } else {
      fileDataArray.map((line) => {
        // console.log(
        //   line.startsWith('//') && line.includes('clean-on-prod'),
        //   line,
        //   line.slice(2)
        // )
        updatedData += `${
          line.startsWith('//') && line.includes('clean-on-prod')
            ? line.slice(2)
            : line
        }\n`
      })
      console.log(updatedData)
    }
    fs.writeFile(path, updatedData, (err) => {
      if (err) throw err
      console.log(prod ? 'cleaned!' : 'un-cleaned!', updatedData)
    })
  })
}

function addImportForCssInDist() {
  const dataToInsert = "import './css/index.css';"
  insertToFile('./dist/index.js', dataToInsert)
  insertToFile('./dist/index.es.js', dataToInsert)
}

function insertToFile(path, dataToInsert) {
  fs.readFile(path, (err, fileData) => {
    const updatedFile = dataToInsert + '\n' + fileData
    if (err) throw err
    fs.writeFile(path, updatedFile, (err) => {
      if (err) throw err
      console.log(`[${dataToInsert}] inserted to  ${path}`)
    })
  })
}
