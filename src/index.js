// const nodeHtmlToImage = require('node-html-to-image')
const puppeteer = require('puppeteer');
const fs = require('fs');

let filepath = '';
let savePath = '';
let width = 0;
let height = 0;

const arguments = process.argv.slice(2);
for(const arg of arguments) {
  const argSplit = arg.split('=');
  if (argSplit.length !== 2)
    continue;

  if(argSplit[0] === 'filePath')
    filepath = argSplit[1];

  if(argSplit[0] === 'savePath')
    savePath = argSplit[1];

  if(argSplit[0] === 'width')
    width = parseInt(argSplit[1]);

  if(argSplit[0] === 'height')
    height = parseInt(argSplit[1]);

  console.log('arg ' + arg)
}

if (!filepath)
  return exitWith('missing filePath');
if (!savePath)
  return exitWith('missing savePath');
if (!width)
  return exitWith('missing width');
if (!height)
  return exitWith('missing height');


fs.readFile(filepath, 'utf8', async (err, data) => {
  if (err) {
    console.error(err);
    return;
  }

  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({
    width: width,
    height: height,
    deviceScaleFactor: 1,
  });
  await page.setContent(data);
  await page.screenshot({path: savePath});
  await browser.close();
});


function exitWith(text){
  console.error('filePath missing');
  process.exit(1);
  return false;
}