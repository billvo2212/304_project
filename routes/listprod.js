const express = require('express');
const router = express.Router();
const sql = require('mssql');

router.get('/', async function(req, res, next) {
    res.setHeader('Content-Type', 'text/html');
    res.write("<title>Bill & Naman Grocery</title>");

    res.write(`
        <style>
            body { font-family: Arial, sans-serif; text-align: center; }
            header {
                background-color: #4CAF50; 
                color: white; 
                padding: 15px 20px; 
                display: flex;
                justify-content: space-between;
                align-items: center;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            header h1 {
                margin: 0; 
                font-size: 28px;
            }
            .user-info {
                font-size: 14px;
                display: flex;
                gap: 10px;
                align-items: center;
            }
            .user-info a {
                color: white; 
                text-decoration: none; 
                font-weight: bold;
            }
            nav {
                background-color: #333; 
                padding: 10px 0; 
                text-align: center;
            }
            nav a {
                color: white; 
                text-decoration: none; 
                margin: 0 15px; 
                font-size: 16px;
                padding: 5px 10px;
            }
            nav a:hover {
                background-color: #4CAF50; 
                border-radius: 5px;
            }
            .container {
                padding: 20px;
                max-width: 1200px;
                margin: 0 auto;
                display: flex;
                flex-wrap: wrap;
                justify-content: center;
            }
            .card { 
                border: 1px solid #ddd; 
                border-radius: 5px; 
                width: 300px; 
                margin: 10px; 
                box-shadow: 0 4px 8px 0 rgba(0,0,0,0.2); 
                transition: 0.3s; 
                font-family: Arial, sans-serif; 
                text-decoration: none; 
                color: inherit; 
                overflow: hidden;
            }
            .card:hover { box-shadow: 0 8px 16px 0 rgba(0,0,0,0.2); }
            .card img { 
                border-radius: 5px 5px 0 0; 
                width: 100%; 
                height: 200px; 
                object-fit: cover; 
            }
            .card-container { padding: 16px; }
            .card h4 { margin: 0; }
            .card p { margin: 5px 0; }
            .btn { 
                display: inline-block; 
                padding: 10px 20px; 
                font-size: 16px; 
                cursor: pointer; 
                text-align: center; 
                text-decoration: none; 
                outline: none; 
                color: #fff; 
                background-color: #4CAF50; 
                border: none; 
                border-radius: 5px; 
                box-shadow: 0 4px 8px 0 rgba(0,0,0,0.2); 
            }
            .btn:hover { background-color: #45a049; }
            form { margin-bottom: 20px; }
            input[type="text"], select {
                padding: 10px;
                font-size: 16px;
                border: 1px solid #ddd;
                border-radius: 5px;
                width: 200px;
                margin-right: 10px;
            }
            input[type="submit"], input[type="reset"] {
                padding: 10px 20px;
                font-size: 16px;
                cursor: pointer;
                text-align: center;
                text-decoration: none;
                outline: none;
                color: #fff;
                background-color: #4CAF50;
                border: none;
                border-radius: 5px;
                box-shadow: 0 4px 8px 0 rgba(0,0,0,0.2);
                margin-right: 10px;
            }
            input[type="submit"]:hover, input[type="reset"]:hover {
                background-color: #45a049;
            }
        </style>
        <header>
            <h1>Bill & Naman Grocery</h1>
            <div class="user-info">
    `);

    const user = req.session?.authenticatedUser || null;
    if (user) {
        res.write(`<span>Welcome, ${user}!</span> <a href="/logout">Logout</a>`);
    } else {
        res.write(`<a href="/login">Login</a>`);
    }

    res.write(`
            </div>
        </header>
        <nav>
            <a href="/">Home</a>
            <a href="/showcart">Cart</a>
            <a href="/listorder">Orders</a>
        </nav>
        <div class="container">
            <form method="GET" action="/listprod">
                <label for="productName">Product Name:</label>
                <input type="text" id="productName" name="productName" placeholder="Enter product name...">
                
                <label for="category">Category:</label>
                <select id="category" name="category">
                    <option value="">All Categories</option>
    `);

    try {
        let pool = await sql.connect(dbConfig);
        let categories = await pool.request().query(`SELECT * FROM category`);
        categories.recordset.forEach(category => {
            res.write(`<option value="${category.categoryId}">${category.categoryName}</option>`);
        });
    } catch (err) {
        res.write('<p>Error loading categories: ' + err.message + '</p>');
    }

    res.write(`
                </select>
                <input type="submit" value="Search">
                <input type="reset" value="Reset">
            </form>
        </div>
        <div class="container">
    `);

    // Get the product name and category to search for
    let name = req.query.productName;
    let category = req.query.category;

    try {
        // Connect to the database
        let pool = await sql.connect(dbConfig);
        let results;

        // Query the database
        if (!name && !category) {
            let allProd = `SELECT * FROM product`;
            results = await pool.request().query(allProd);
        } else {
            let query = `SELECT * FROM product WHERE 1=1`;
            if (name) {
                query += ` AND productName LIKE @prodname`;
            }
            if (category) {
                query += ` AND categoryId = @categoryId`;
            }
            results = await pool.request()
                .input('prodname', sql.NVarChar, `%${name}%`)
                .input('categoryId', sql.Int, category)
                .query(query);
        }

        // Print out the result
        for (let i = 0; i < results.recordset.length; i++) {
            let result = results.recordset[i];

            // Formatting currency
            let prodPrice = parseFloat(result.productPrice).toFixed(2);

            res.write(`<div class="card">`);

            // Check if the product has an image
            if (result.productImageURL || result.productImage) {
                res.write(`<img src="${result.productImageURL || result.productImage}" alt="${result.productName}">`);
            }

            res.write('<div class="card-container">');
            res.write(`<h4>${result.productName}</h4>`);
            res.write(`<p>$${prodPrice}</p>`);
            res.write(`<p><a href="addcart?id=${result.productId}&name=${result.productName}&price=${prodPrice}" class="btn">Add to Cart</a></p>`);
            res.write(`<a href="/product/${result.productId}" class="btn">View Details</a>`);
            res.write('</div></div>');
        }

        res.write('</div>');

    } catch (err) {
        res.write('<p>Error: ' + err.message + '</p>');
    }

    res.end();
});

module.exports = router;