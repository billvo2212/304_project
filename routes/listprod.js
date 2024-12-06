const express = require('express');
const router = express.Router();
const sql = require('mssql');

router.get('/', async function (req, res, next) {
    const user = req.session?.authenticatedUser || null;

    res.setHeader('Content-Type', 'text/html');
    res.write(`
        <title>Bill & Naman Grocery</title>
        <style>
            body { 
                font-family: 'Arial', sans-serif; 
                margin: 0; 
                padding: 0; 
                background-color: #f4f4f4; 
                color: #333;
            }
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
            }
            .search-form {
                display: flex;
                justify-content: center;
                align-items: center;
                padding: 20px;
                background-color: white;
                border: 1px solid #ddd;
                border-radius: 10px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                margin-bottom: 20px;
            }
            .search-form label {
                margin-right: 10px;
                font-size: 14px;
                color: #555;
            }
            .search-form input[type="text"], .search-form select {
                width: 200px;
                padding: 10px;
                margin-right: 15px;
                font-size: 14px;
                border: 1px solid #ddd;
                border-radius: 5px;
                box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
            }
            .search-form input[type="submit"], .search-form button {
                padding: 10px 20px;
                font-size: 14px;
                font-weight: bold;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                transition: background-color 0.3s ease;
            }
            .search-form input[type="submit"] {
                background-color: #4CAF50;
                color: white;
                margin-right: 10px;
            }
            .search-form input[type="submit"]:hover {
                background-color: #45A049;
            }
            .search-form button {
                background-color: #f44336;
                color: white;
            }
            .search-form button:hover {
                background-color: #e53935;
            }
            table { 
                width: 100%; 
                margin: 20px 0; 
                border-collapse: collapse; 
                background-color: white;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            th, td { 
                padding: 15px; 
                border: 1px solid #ddd; 
                text-align: center; 
            }
            th { 
                background-color: #4CAF50; 
                color: white; 
                font-size: 16px;
            }
            tr:nth-child(even) { 
                background-color: #f2f2f2; 
            }
            img {
                max-width: 100px;
                max-height: 100px;
                object-fit: cover;
                border-radius: 5px;
            }
            .action-link {
                background-color: #4CAF50;
                color: white;
                padding: 5px 10px;
                border-radius: 5px;
                text-decoration: none;
                font-size: 14px;
                transition: background-color 0.3s ease;
            }
            .action-link:hover {
                background-color: #45A049;
            }
        </style>
        <header>
            <h1>Bill & Naman Grocery</h1>
            <div class="user-info">
    `);

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
            <div class="search-form">
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
                    <button type="button" onclick="window.location.href='/listprod'">Reset</button>
                </form>
            </div>
            <table>
                <tr>
                    <th>Image</th>
                    <th>Product Name</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Action</th>
                </tr>
    `);

    const productName = req.query.productName;
    const categoryId = req.query.category;

    try {
        let pool = await sql.connect(dbConfig);
        let query = `
            SELECT p.productId, p.productName, p.productPrice, p.productImageURL, c.categoryName
            FROM product p
            JOIN category c ON p.categoryId = c.categoryId
            LEFT JOIN orderproduct op ON p.productId = op.productId
            WHERE 1=1
        `;

        let request = pool.request();

        if (productName) {
            query += ` AND p.productName LIKE @productName`;
            request.input('productName', sql.NVarChar, `%${productName}%`);
        }

        if (categoryId) {
            query += ` AND c.categoryId = @categoryId`;
            request.input('categoryId', sql.Int, categoryId);
        }

        query += `
            GROUP BY p.productId, p.productName, p.productPrice, p.productImageURL, c.categoryName
            ORDER BY SUM(op.quantity * op.price) DESC;
        `;

        let results = await request.query(query);

        results.recordset.forEach(result => {
            let prodPrice = parseFloat(result.productPrice).toFixed(2);

            res.write('<tr>');

            if (result.productImageURL) {
                res.write(`<td><img src="/${result.productImageURL}" alt="${result.productName}"></td>`);
            } else {
                res.write('<td>No Image</td>');
            }

            res.write(`<td><a href="/product/${result.productId}">${result.productName}</a></td>`);
            res.write(`<td>${result.categoryName}</td>`);
            res.write(`<td>$${prodPrice}</td>`);
            res.write(`<td><a class="action-link" href="addcart?id=${result.productId}&name=${result.productName}&price=${prodPrice}">Add to Cart</a></td>`);
            res.write('</tr>');
        });

    } catch (err) {
        res.write('<p>Error: ' + err.message + '</p>');
    }

    res.write(`
            </table>
        </div>
    `);

    res.end();
});

module.exports = router;
