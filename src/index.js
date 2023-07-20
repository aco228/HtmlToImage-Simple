// const nodeHtmlToImage = require('node-html-to-image')
const puppeteer = require('puppeteer');
const fs = require('fs');

let filepath = '';
let savePath = '';
let width = 0;
let height = 0;
let imageType = 'png';
let omitBackground = false;

const arguments = process.argv.slice(2);
for(const arg of arguments) {
  const argSplit = arg.split('=');
  if (argSplit.length !== 2)
    continue;

  const parameter = argSplit[0].trim();
  const value = argSplit[1].trim();

  if(parameter === 'filePath')
    filepath = value;

  if(parameter === 'savePath')
    savePath = value;

  if(parameter === 'width')
    width = parseInt(value);

  if(parameter === 'height')
    height = parseInt(value);

  if(parameter === 'imageType')
    imageType = parseInt(value);

  if(parameter === 'omitBackground')
    omitBackground = value === 'true' ? true : false;

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

  page.on('console', async (msg) => {
    const msgArgs = msg.args();
    const logValues = await Promise.all(msgArgs.map(async arg => await arg.jsonValue()));
    console.log('FROM PAGE:: ', ...logValues);
  });
  await page.setViewport({
    width: width,
    height: height,
    deviceScaleFactor: 1,
  });

  await page.setContent(data);
  await page.evaluate(() => document.body.style.background = 'transparent');
  await page.evaluate('fromPuppeteer()');

  let index = 0;
  for(;;) {
    if (index !== 0)
      await timeout(15);

    index++;
    console.log('index', index);
    if (index > 2000)
      break;

    const isReady = await page.evaluate('isReady()');
    if (isReady !== 'ready')
      continue;

    console.log('isReady', isReady);
    await timeout(200);

    await page.screenshot({
      path: savePath,
      type: imageType,
      encoding: 'binary',
      captureBeyondViewport: false,
      omitBackground: omitBackground,
    });
    break;
  }

  await browser.close();
});


function exitWith(text){
  console.error('filePath missing');
  process.exit(1);
  return false;
}

const timeout = (ms) =>
  new Promise(resolve => {
    setTimeout(resolve, ms)
  })