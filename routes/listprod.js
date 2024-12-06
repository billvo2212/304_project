const express = require('express');
const router = express.Router();
const sql = require('mssql');

router.get('/', async function(req, res, next) {
    res.setHeader('Content-Type', 'text/html');
    res.write("<title>SNEAKER-HEAD</title>");

    res.write(`
        <style>
            body { font-family: Arial, sans-serif; text-align: center; }
            .container { display: flex; flex-wrap: wrap; justify-content: center; }
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
            input[type="text"] {
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
        <form method="GET" action="/listprod">
            <label for="productName"> <h1>Search for a product: </h1></label>
            <input placeholder="Product name" type="text" id="productName" name="productName">
            <input type="submit" value="Search">
            <input type="reset" value="Reset">
        </form>
        <div class="container">
    `);

    // Get the product name to search for
    let name = req.query.productName;

    try {
        // Connect to the database
        let pool = await sql.connect(dbConfig);
        let results;

        // Query the database
        if (!name) {
            let allProd = `SELECT * FROM product`;
            results = await pool.request().query(allProd);
        } else {
            let productName_sql = `SELECT * FROM product WHERE productName LIKE @prodname`;
            results = await pool.request()
                .input('prodname', sql.NVarChar, `%${name}%`)
                .query(productName_sql);
        }

        // Print out the result
        for (let i = 0; i < results.recordset.length; i++) {
            let result = results.recordset[i];

            // Formatting currency
            let prodPrice = parseFloat(result.productPrice).toFixed(2);

            res.write('<div class="card">');

            // Check if the product has an image
            if (result.productImageURL || result.productImage) {
                res.write(`<img src="${result.productImageURL || result.productImage}" alt="${result.productName}">`);
            }

            res.write('<div class="card-container">');
            res.write(`<h4><a href="/product/${result.productId}">${result.productName}</a></h4>`);
            res.write(`<p>$${prodPrice}</p>`);
            res.write(`<p><a href="addcart?id=${result.productId}&name=${result.productName}&price=${prodPrice}" class="btn">Add to Cart</a></p>`);
            res.write('</div></div>');
        }

        res.write('</div>');

    } catch (err) {
        res.write('<p>Error: ' + err.message + '</p>');
    }

    res.end();
});

module.exports = router;

