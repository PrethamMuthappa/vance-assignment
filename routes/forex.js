const express = require("express");
const router = express.Router();
const { User } = require('./sqliteDB');
const { Op } = require('sequelize');

router.get("/", async (req, res) => {
    try {
        const { from, to, period } = req.query;
        
        // Validate required parameters
        if (!from || !to || !period) {
            return res.status(400).json({ 
                error: "Missing required parameters. Please provide 'from', 'to', and 'period'" 
            });
        }

        // Validate period format (should be like 1M, 3M, etc.)
        if (!/^\d+M$/.test(period)) {
            return res.status(400).json({ 
                error: "Invalid period format. Period should be in format: 1M, 3M, etc." 
            });
        }

        // First, get the latest data point to use as reference
        const latestData = await User.findOne({
            where: {
                currency: `${from}${to}`
            },
            order: [['date', 'DESC']]
        });

        if (!latestData) {
            return res.status(404).json({
                message: `No forex data found for ${from}${to}`
            });
        }

        // Calculate the date range based on the latest available data
        const endDate = new Date(latestData.date);
        const startDate = new Date(latestData.date);
        
        // Parse period (1M, 3M, etc.)
        const months = parseInt(period);
        startDate.setMonth(startDate.getMonth() - months);

        console.log('Date range:', {
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            currency: `${from}${to}`
        });

        // Query the database
        const forexData = await User.findAll({
            where: {
                currency: `${from}${to}`,
                date: {
                    [Op.between]: [startDate.toISOString(), endDate.toISOString()]
                }
            },
            order: [['date', 'ASC']]
        });

        console.log(`Found ${forexData.length} records`);
        
        if (forexData.length === 0) {
            return res.status(404).json({
                message: `No forex data found for ${from}${to} in the last ${period}`,
                debug: {
                    requestedDateRange: {
                        start: startDate.toISOString(),
                        end: endDate.toISOString()
                    }
                }
            });
        }

        res.json(forexData);
    } catch (error) {
        console.error('Error fetching forex data:', error);
        res.status(500).json({ 
            error: "Internal server error while fetching forex data",
            details: error.message 
        });
    }
});

module.exports = router;
