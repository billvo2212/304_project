const express = require('express');
const router = express.Router();
const sql = require('mssql');
const moment = require('moment');


router.get('/', async function(req, res, next) {
    res.setHeader('Content-Type', 'text/html');
    res.write(`
        <h1 style="text-align: center;">Order List</h1>
        <style>
            table { 
                width: 80%; 
                margin: 20px auto; 
                border-collapse: collapse; 
                font-family: Arial, sans-serif; 
            }
            th, td { 
                padding: 10px; 
                border: 1px solid #ddd; 
                text-align: center; 
            }
            th { 
                background-color: #4CAF50; 
                color: white; 
            }
            tr:nth-child(even) { 
                background-color: #f2f2f2; 
            }
            .product-table { 
                margin-top: 10px; 
                width: 100%; 
            }
        </style>
    `);

    try {
        // Connect to the database
        let pool = await sql.connect(dbConfig);

        // Retrieve orders with customer names by joining the ordersummary and customer tables
        let orderSummary_sql = `
            SELECT os.orderId, os.orderDate, os.customerId, os.totalAmount, 
                   c.firstName, c.lastName 
            FROM ordersummary os
            JOIN customer c ON os.customerId = c.customerId
        `;
        let orders = await pool.request().query(orderSummary_sql);

        

        // Loop through each order
        for (let order of orders.recordset) {
            let orderDate = moment(order.orderDate).format('YYYY-MM-DD');
            let totalAmount = parseFloat(order.totalAmount).toFixed(2);

            res.write("<table><tr><th>Order ID</th><th>Order Date</th><th>Customer Name</th><th>Total Amount</th></tr>");

            // Display order header information with customer name and formatted values
            res.write(`
                <tr>
                    <td>${order.orderId}</td>
                    <td>${orderDate}</td>
                    <td>${order.firstName} ${order.lastName}</td>
                    <td>$${totalAmount}</td>
                </tr>
            `);

            // Retrieve products for the current order
            let products_sql = `
                SELECT p.productName, od.quantity, p.productPrice 
                FROM orderproduct od
                JOIN product p ON od.productId = p.productId
                WHERE od.orderId = @orderId
            `;
            let products = await pool.request()
                .input('orderId', sql.Int, order.orderId)
                .query(products_sql);

            // Display product details in a nested table
            res.write(`
                <tr>
                    <td colspan="4">
                        <table>
                            <tr>
                                <th style="background-color:#7EA27F">Product Name</th>
                                <th style="background-color:#7EA27F">Quantity</th>
                                <th style="background-color:#7EA27F">Product Price</th>
                            </tr>
            `);

            // Loop through each product for the current order
            for (let product of products.recordset) {
                let productPrice = parseFloat(product.productPrice).toFixed(2);
                res.write(`
                    <tr>
                        <td>${product.productName}</td>
                        <td>${product.quantity}</td>
                        <td>$${productPrice}</td>
                    </tr>
                `);
            }

            // Close the product table
            res.write(`
                        </table>
                    </td>
                </tr>
            `);
        }

        res.write("</table>");
        res.end();
    } catch (err) {
        console.error("Database query error:", err);
        res.status(500).send("An error occurred while processing your request.");
    } finally {
        // Close the database connection
        sql.close();
    }
});

module.exports = router;
