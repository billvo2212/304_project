const express = require('express');
const router = express.Router();
const sql = require('mssql');


router.get('/', async function(req, res, next) {
    res.setHeader('Content-Type', 'text/html');
    res.write("<title>Bill & Naman Grocery</title>");

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
        <form method="GET" action="/listprod">
            <label for="productName"> <h1>Search for a product: </h1></label>
            <input type="text" id="productName" name="productName">
            <input type="submit" value="Search">
            <input type="reset" value="Reset">
            
        </form>
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
        res.write('<table><tr><th>Product Name</th><th>Price</th><th>Action</th></tr>');
        for (let i = 0; i < results.recordset.length; i++) {
            let result = results.recordset[i];

            // Formatting currency
            let prodPrice = parseFloat(result.productPrice).toFixed(2);
        //     res.write(`
        //         <tr>
        //             <td><a href="/product/${result.productId}">${result.productName}</a></td>
        //             <td>$${prodPrice}</td>
        //             <td><a href="addcart?id=${result.productId}&name=${result.productName}&price=${prodPrice}">Add to Cart</a></td>
        //         </tr>
        //     `);
        // }
            res.write('<tr>');

            // Check if the product has an image
            if (result.productImageURL || result.productImage) {
                res.write(`<td><a href="/product/${result.productId}">${result.productName}</a></td>`);
            } else {
                res.write(`<td>${result.productName}</td>`);
            }

            res.write(`<td>$${prodPrice}</td>`);
            res.write(`<td><a href="addcart?id=${result.productId}&name=${result.productName}&price=${prodPrice}">Add to Cart</a></td>`);
            res.write('</tr>');
        }


        res.write('</table>');

    } catch (err) {
        res.write('<p>Error: ' + err.message + '</p>');
    }

    res.end();
});

module.exports = router;
