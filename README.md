# Vance Assigment 

How to run

```
npm start
```

To scrape the data 

```
http://localhost:3000/scrapper?base=USD&quote=INR&fromdate=2024-01-01&todate=2024-03-15
```

The base and quote can be any currency of your choice as well as from date and to date

When this endpoint is hit, the data is scrapped and saved to sqlite database

### Task 2: to return the data from the saved database

```
http://localhost:3000/api/forex-data?from=USD&to=INR&period=1M
```
The from and to is the currecy which you want to check return from your db , the period is the how long back the data you want to extract.

This rest api endpoint will check for the data from the existing db

### Task 3

The cron job will run as per the scheduled timeline.
