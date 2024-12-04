const express = require('express');
const router = express.Router();

router.get('/', function (req, res, next) {
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; border: 1px solid #ccc; border-radius: 10px; box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);">
            <title>Grocery CheckOut Line</title>
            <h1 style="text-align: center; color: #4CAF50;">Grocery Checkout</h1>
            <p style="text-align: center; font-size: 16px;">Enter your Customer ID and Password to complete the transaction:</p>
            
            <form method="get" action="order" style="margin-top: 20px;">
                <table style="width: 100%; font-size: 16px; margin: 0 auto;">
                    <tr>
                        <td style="text-align: right; padding: 10px;">Customer ID:</td>
                        <td><input type="text" name="customerId" size="20" style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 5px;" required></td>
                    </tr>
                    <tr>
                        <td style="text-align: right; padding: 10px;">Password:</td>
                        <td><input type="password" name="password" size="20" style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 5px;" required></td>
                    </tr>
                    <tr>
                        <td colspan="2" style="text-align: center; padding: 20px;">
                            <input type="submit" value="Submit" style="background-color: #4CAF50; color: white; padding: 10px 20px; border: none; border-radius: 5px; font-size: 16px; cursor: pointer;">
                            <input type="reset" value="Reset" style="background-color: #f44336; color: white; padding: 10px 20px; border: none; border-radius: 5px; font-size: 16px; cursor: pointer; margin-left: 10px;">
                        </td>
                    </tr>
                </table>
            </form>
        </div>
    `;

    res.setHeader('Content-Type', 'text/html');
    res.send(html);
});

module.exports = router;
