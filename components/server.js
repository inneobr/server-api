import chromium from 'chrome-aws-lambda';

const isDev = !process.env.AWS_REGION;
let puppeteer = {};
let options = {};

if(isDev) {
  puppeteer = require('puppeteer');  
  options = {headless: true}
}

if(!isDev) {
  puppeteer.require('puppeteer-core');
  options = {
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: require('puppeteer').executablePath(),
    headless: chromium.headless,
    ignoreHTTPSErrors: true,
  }
}

function extrair(youtube){ 
  const response = [];
  youtube.map(item => {
    try{
      if(!item.title) return;
      const [part1, part2] = item.videoUrl.split('?v=');
      const [videoId] = part2.split("&");
      const title = item.title.toUpperCase();
      const [url] = item.videoUrl.split("&");
      response.push({title: title, url: url, videoId: videoId})
    }catch(error){}
  })  
  return response;
}

export const getVideos = (dados) => new Promise(async (resolve, reject) => {    
  const siteUrl = `https://www.youtube.com/results?search_query=${dados}`; 
  browser = await chromium.puppeteer.launch(options);
  const page = await browser.newPage();
  await page.goto(siteUrl);

  try {
    const youtube = await page.evaluate(() => {
      const videoList = document.querySelectorAll('.style-scope.ytd-item-section-renderer.style-scope.ytd-item-section-renderer a');
      const linkArray = [...videoList] 
            
      return linkArray.map( (item) => ({
          title: item.title,
          videoUrl: item.href,
      }));
    })    
    
    const response = extrair(youtube)
    resolve(response)

  } catch (error) {
    reject(error)
  }
  finally {
    await browser.close();
  }
})