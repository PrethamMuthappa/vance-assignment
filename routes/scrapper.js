var express = require('express');
var router = express.Router();
var puppeteerCore=require('puppeteer');


async function scrape(){

const browser=await puppeteerCore.launch({
  headless:false,
  defaultViewport:null
});

const page=await browser.newPage();
await page.goto("https://finance.yahoo.com/quote/EURUSD%3DX/history/?period1=1713149515&period2=1721011871",{
  waitUntil:"networkidle0"
});

const exchagedata= await page.evaluate(()=>{
const rows=Array.from(document.querySelectorAll('table tr tbody'))
  return rows.map(row=>{
    const column=row.querySelectorAll('td');
    return {
      date: columns[0]?.textContent,
      open: columns[1]?.textContent,
      high: columns[2]?.textContent,
      low: columns[3]?.textContent,
      close: columns[4]?.textContent,
      adjClose: columns[5]?.textContent,
      volume: columns[6]?.textContent
    };
  });
});
  console.log(exchagedata)
await browser.close();
return exchagedata;
}

router.get('/', async function(req, res, next) {
try {
  const data=await scrape();
  res.json(data);
}catch (error){
  console.log(error)
}
});

module.exports = router;
