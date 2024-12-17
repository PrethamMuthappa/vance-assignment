const cron = require('node-cron');
const { scrape } = require('../routes/scrapper');
const { User } = require('../routes/sqliteDB');

// Currency pairs to track
const CURRENCY_PAIRS = [
    { base: 'GBP', quote: 'INR' },
    { base: 'AED', quote: 'INR' }
];

// Time periods to fetch
const TIME_PERIODS = [
    { name: '1W', days: 7 },
    { name: '1M', months: 1 },
    { name: '3M', months: 3 },
    { name: '6M', months: 6 },
    { name: '1Y', months: 12 }
];

async function scrapeAllCurrencies() {
    console.log('Starting scheduled currency scraping...');
    
    for (const pair of CURRENCY_PAIRS) {
        for (const period of TIME_PERIODS) {
            try {
                const { fromDate, toDate } = getDateRange(period);
                console.log(`Scraping ${pair.base}/${pair.quote} for period ${period}`);
                
                const data = await scrape(
                    pair.base,
                    pair.quote,
                    fromDate,
                    toDate
                );


                const currency = pair.base + pair.quote;
                console.log(`Saving ${data.length} records for ${currency}`);
                
                for (const row of data) {
                    await User.findOrCreate({
                        where: {
                            currency: currency,
                            date: new Date(row.date)
                        },
                        defaults: {
                            open: row.open,
                            high: row.high,
                            low: row.low,
                            close: row.close,
                            adj_close: row.adj_close
                        }
                    });
                }
                
            
                await new Promise(resolve => setTimeout(resolve, 5000));
                
            } catch (error) {
                console.error(`Error processing ${pair.base}/${pair.quote} for period ${period}:`, error);
            }
        }
    }
    
    console.log('Completed scheduled currency scraping and database update');
}

cron.schedule('0 0 * * *', async () => {
    console.log('Starting scheduled forex data scraping...');
    try {
        await scrapeAllCurrencies();
        console.log('Scheduled forex data scraping completed successfully');
    } catch (error) {
        console.error('Error in scheduled forex data scraping:', error);
    }
});

console.log('Performing initial forex data scrape...');
scrapeAllCurrencies().catch(error => {
    console.error('Error in initial forex data scrape:', error);
});
