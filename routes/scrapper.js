var express = require('express');
var router = express.Router();
var puppeteerCore = require('puppeteer');


function unixdate(date){
  const data=new Date(date);
  if(isNaN(data.getTime())){
    throw new Error('Invalid date');
  }
  return Math.floor(data.getTime()/1000);
}

async function scrape(basecurrency='EUR', quotecurrency='USD',fromdate,todate) {
  let browser;

  let joincurrecncy=`${basecurrency}${quotecurrency}=x`;
  let encodedcurrency=encodeURIComponent(joincurrecncy);
  const frounixdate= fromdate ? unixdate(fromdate) : null;
 const tounixdate=todate ? unixdate(todate) : null;

  let url=`https://finance.yahoo.com/quote/${encodedcurrency}/history`
  if(fromdate && todate){
    url+=`?period1=${frounixdate}&period2=${tounixdate}`
  }
  try {
    console.log('Launching browser...');
    browser = await puppeteerCore.launch({
      headless: false,
      defaultViewport: null,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--window-size=1920,1080'
      ]
    });

    console.log('Creating new page...');
    const page = await browser.newPage();
    

    await page.setViewport({ width: 1920, height: 1080 });
    
    // Adding user agent (currently testing on chrome as dy default puppeteer uses it)
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36');

    console.log(`Navigating to Yahoo Finance ${basecurrency} and ${quotecurrency}`);
    await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: 120000
    });

    console.log('Waiting for table to load...');
    await page.waitForSelector('table tbody tr', {
      timeout: 30000
    });

    // Adding a small delay to ensure data is loaded
    await new Promise(resolve => setTimeout(resolve, 5000));

    console.log('Scraping data...');
    const exchangedata = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('table tbody tr'));
      console.log(`Found ${rows.length} rows`);
      
      return rows.map(row => {
        const columns = row.querySelectorAll('td');
        return columns.length ? {
          date: columns[0]?.innerText || '',
          open: columns[1]?.innerText || '',
          high: columns[2]?.innerText || '',
          low: columns[3]?.innerText || '',
          close:columns[4]?.innerText || '',
          adj_close:columns[5]?.innerText || '',
        } : null;
      }).filter(Boolean);
    });

    console.log(`Scraped ${exchangedata.length} rows of data`);
    await browser.close();
    return exchangedata;

  } catch (error) {
    console.error('Scraping error:', error);
    if (browser) {
      await browser.close();
    }
    throw error;
  }
}

router.get('/', async function(req, res, next) {
  try {
    const {base,quote,fromdate,todate}=req.query;
    const data = await scrape(base,quote,fromdate,todate);
    res.json(data);
  } catch (error) {
    console.error('Route error:', error);
    res.status(500).json({ 
      error: error.message,
      stack: error.stack 
    });
  }
});

module.exports = router;
