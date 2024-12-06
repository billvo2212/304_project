const express = require('express');
const router = express.Router();
const sql = require('mssql');
const moment = require('moment');

router.get('/', async function(req, res, next) {
    res.setHeader('Content-Type', 'text/html');
    res.write("<title>SNEAKER Order Processing</title>");

    res.write(`
        <style>
            body { font-family: Arial, sans-serif; text-align: center; }
            table { 
                width: 60%; 
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
            form { margin-bottom: 20px; }
        </style>
    `);
    
    let customerId = req.query.customerId; // Assuming customerId is passed via GET
    let productList = req.session.productList;
    let password = req.query.password;

    console.log(customerId);
    console.log(productList);
    console.log(password);
    
    if (!customerId ) {
        res.write("<h2>Error: Please enter a valid customer ID to complete the transaction.</h2>");
        res.end();
        return;
    }
    if (!Number.isInteger(Number(customerId))){
        res.write("<h2>Error: Please enter a valid customer ID to complete the transaction.</h2>");
        res.end();
        return;

    }



    if (!password) {
        res.write("<h2>Error: Please enter a passsword to complete the transaction.</h2>");
        res.end();
        return;
    }


    if (!productList || productList.length === 0) {
        res.write("<h2>Error: Your cart is empty. Add products to cart before placing an order.</h2>");
        res.end();
        return;
    }

    productList = productList.filter(item => item !== null);





    try {
        // Connect to the database
        let pool = await sql.connect(dbConfig);

        // Check if the customer ID exists
        let customerResult = await pool.request()
            .input('customerId', sql.Int, customerId)
            .query('SELECT * FROM customer WHERE customerId = @customerId');

        if (customerResult.recordset.length === 0) {
            res.write("<h2>Error: Invalid customer ID or password. Please try again.</h2>");
            res.end();
            return;
        }

        let customer = customerResult.recordset[0];

        if (customer.password != password){
            res.write("<h2>Error: Invalid customer ID or password. Please try again.</h2>");
            res.end();
            return;

        }

        // Insert order summary with initial values
        let orderDate = moment().format('YYYY-MM-DD HH:mm:ss');
        let totalAmount = productList.reduce((total, item) => total + item.quantity * item.price, 0).toFixed(2);

        let orderResult = await pool.request()
            .input('customerId', sql.Int, customerId)
            .input('orderDate', sql.DateTime, orderDate)
            .input('totalAmount', sql.Decimal(10, 2), totalAmount)
            .query(`INSERT INTO ordersummary (customerId, orderDate, totalAmount) 
                    OUTPUT INSERTED.orderId 
                    VALUES (@customerId, @orderDate, @totalAmount)`);
        
        let orderId = orderResult.recordset[0].orderId;

        // Insert each product in the order into the orderproduct table
        for (let product of productList) {
            await pool.request()
                .input('orderId', sql.Int, orderId)
                .input('productId', sql.Int, product.id)
                .input('quantity', sql.Int, product.quantity)
                .input('price', sql.Decimal(10, 2), product.price)
                .query(`INSERT INTO orderproduct (orderId, productId, quantity, price) 
                        VALUES (@orderId, @productId, @quantity, @price)`);
        }


        res.write(`<h1>Your Order Summary</h1>`);
        res.write(`
            <table>
                <tr>
                    <th>Product Id</th>
                    <th>Product Name</th>
                    <th>Quantity</th>
                    <th>Price</th>
                    <th>Subtotal</th>
                </tr>
        `);
        
        for (let product of productList) {
            let subtotal = (product.quantity * product.price).toFixed(2);
            res.write(`
                <tr>
                    <td>${product.id}</td>
                    <td>${product.name}</td>
                    <td>${product.quantity}</td>
                    <td>$${product.price}</td>
                    <td>$${subtotal}</td>
                </tr>
            `);
        }
        res.write(`
            <tr>
                <td colspan="4" style="text-align: right;"><strong>Order Total</strong></td>
                <td><strong>$${totalAmount}</strong></td>
            </tr>
        </table>
    `);

        // Print out the order summary
        
        res.write(`<p>Order completed. Will be shipped soon...</p>`);
        res.write(`<p>Your order reference number is: ${orderId}</p>`);
        res.write(`<p>Shipping to customer: ${customer.customerId} Name: ${customer.firstName} ${customer.lastName}</p>`);
        
        


        

        // Clear session/cart
        req.session.productList = [];

        res.end();
    } catch (err) {
        console.error("Database query error:", err);
        res.status(500).send("An error occurred while processing your request.");
    } finally {
        sql.close();
    }
});

module.exports = router;