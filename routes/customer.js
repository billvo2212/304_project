const express = require('express');
const router = express.Router();
const sql = require('mssql');
const auth = require('../auth');

router.get('/', function (req, res, next) {
    res.setHeader('Content-Type', 'text/html');
    if (auth.checkAuthentication(req, res)) {
    (async function () {
        try {
            let pool = await sql.connect(dbConfig);

            const userId = req.session.authenticatedUser;

            const query = `
                SELECT 
                    customerId AS Id, 
                    firstName AS [First Name],
                    lastName AS [Last Name],
                    email AS Email,
                    phoneNum AS Phone,
                    address AS Address,
                    city AS City,
                    state AS State,
                    postalCode AS [Postal Code],
                    country AS Country,
                    userid AS [User id]
                FROM customer
                WHERE userid = @userId
            `;
            let result = await pool.request()
                .input('userId', sql.VarChar, userId)
                .query(query);

            const customer = result.recordset[0];

            // Build a visually appealing HTML response
            let html = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #ccc; border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
                    <h1 style="text-align: center; color: #4CAF50;">Customer Profile</h1>
                    <table style="border-collapse: collapse; width: 100%; margin: 20px 0; font-size: 16px;">
                        <thead>
                            <tr style="background-color: #f2f2f2;">
                                <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Field</th>
                                <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Value</th>
                            </tr>
                        </thead>
                        <tbody>
            `;

            for (const key in customer) {
                html += `
                    <tr>
                        <td style="border: 1px solid #ddd; padding: 8px;">${key}</td>
                        <td style="border: 1px solid #ddd; padding: 8px;">${customer[key]}</td>
                    </tr>
                `;
            }

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
                    <h1 style="color: red;">An error occurred while retrieving customer data.</h1>
                    <p>${err.message}</p>
                    <a href="/" style="text-decoration: none; color: blue; font-size: 18px;">Back to Main Page</a>
                </div>
            `);
        }
    })();
}
});

module.exports = router;
