const express = require('express');
const router = express.Router();
const sql = require('mssql');
const auth = require('../auth');

router.get('/', function (req, res, next) {
    res.setHeader('Content-Type', 'text/html');
    if (auth.checkAuthentication(req, res)){
    (async function () {

        try {
            let pool = await sql.connect(dbConfig);

            // SQL Query to fetch total order amount by day
            const query = `
                SELECT 
                    FORMAT(CAST(orderDate AS DATE), 'yyyy-MM-dd') AS [Order Date], 
                    SUM(totalAmount) AS [Total Order Amount]
                FROM ordersummary
                GROUP BY CAST(orderDate AS DATE)
                ORDER BY CAST(orderDate AS DATE);
            `;

            let result = await pool.request().query(query);

            // Build the HTML page with improved styling
            let html = `
                <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; border: 1px solid #ccc; border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
                    <h1 style="text-align: center; color: #4CAF50;">Administrator Sales Report by Day</h1>
                    <table style="border-collapse: collapse; width: 100%; margin-top: 20px; font-size: 16px;">
                        <thead>
                            <tr style="background-color: #f2f2f2;">
                                <th style="border: 1px solid #ddd; padding: 10px; text-align: left;">Order Date</th>
                                <th style="border: 1px solid #ddd; padding: 10px; text-align: left;">Total Order Amount</th>
                            </tr>
                        </thead>
                        <tbody>
            `;

            result.recordset.forEach(row => {
                html += `
                    <tr>
                        <td style="border: 1px solid #ddd; padding: 10px;">${row['Order Date']}</td>
                        <td style="border: 1px solid #ddd; padding: 10px;">$${row['Total Order Amount'].toFixed(2)}</td>
                    </tr>
                `;
            });

            html += `
                        </tbody>
                    </table>
                    <div style="text-align: center; margin-top: 20px;">
                        <a href="/" style="text-decoration: none; background-color: #4CAF50; color: white; padding: 10px 20px; border-radius: 5px; font-size: 16px;">Back to Main Page</a>
                    </div>
                </div>
            `;

            res.send(html);

        } catch (err) {
            console.error(err);
            res.status(500).send(`
                <div style="text-align: center; font-family: Arial, sans-serif;">
                    <h1 style="color: red;">An error occurred while generating the sales report.</h1>
                    <p>${err.message}</p>
                    <a href="/" style="text-decoration: none; color: blue; font-size: 16px;">Back to Main Page</a>
                </div>
            `);
        }
    })();

    }


    
});

module.exports = router;
