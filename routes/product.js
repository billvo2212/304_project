// const express = require('express');
// const router = express.Router();
// const sql = require('mssql');

// router.get('/:id', function(req, res, next) {
//     res.setHeader('Content-Type', 'text/html');
//     (async function() {
//         try {
//             let pool = await sql.connect(dbConfig);
//             let productId = req.params.id;

// 	        // Get product name to search for
// 	        // TODO: Retrieve and display info for the product
//             let result = await pool.request()
//                 .input('productId', sql.Int, productId)
//                 .query('SELECT * FROM product WHERE productId = @productId');

// 	        // TODO: If there is a productImageURL, display using IMG tag
//             if (result.recordset.length > 0) {
//                 let product = result.recordset[0];

//                 let prodPrice = parseFloat(product.productPrice).toFixed(2);
//                 console.log(prodPrice);
//                 res.write(`<h1>${product.productName}</h1>`);
//                 res.write(`<p>${product.productDesc}</p>`);
//                 res.write(`<p>Price: $${product.productPrice}</p>`);

// 	            // TODO: Retrieve any image stored directly in database. Note: Call displayImage.jsp with product id as parameter.
//                 // Display image from URL
//                 if (product.productImageURL) {
//                     res.write(`<img src="/${product.productImageURL}" alt="${product.productName}">`);
//                     // console.log(`<img src="${product.productImageURL}" alt="${product.productName}">`);    
//                 }

//                 // Display image from binary field
//                 if (product.productImage) {
//                     res.write(`<img src="/displayImage?id=${product.productId}" alt="${product.productName}">`);
//                 }

// 	            // TODO: Add links to Add to Cart and Continue Shopping
//                 // Add to cart and continue shopping links
//                 res.write(`<br>`);
//                 res.write(`<br>`);

//                 res.write(`<a href="/addcart?id=${product.productId}&name=${product.productName}&price=${prodPrice}">Add to Cart</a>`);
//                 res.write(`<br>`);
//                 res.write(`<br>`);

//                 res.write(`<a href="/listprod">Continue Shopping</a>`);
//             } else {
//                 res.write('<p>Product not found</p>');
//             }

//             res.end()
//         } catch(err) {
//             console.dir(err);
//             res.write(err + "")
//             res.end();
//         }
//     })();
// });

// module.exports = router;

const express = require('express');
const router = express.Router();
const sql = require('mssql');

router.get('/:id', async function(req, res, next) {
    const productId = req.params.id;

    res.setHeader('Content-Type', 'text/html');
    res.write("<title>Product Details</title>");

    res.write(`
        <style>
            body { font-family: Arial, sans-serif; text-align: center; }
            .product-container { 
                display: flex; 
                flex-direction: column; 
                align-items: center; 
                justify-content: center; 
                max-width: 800px; 
                margin: auto; 
                padding: 20px; 
            }
            .product-card { 
                border: 1px solid #ddd; 
                border-radius: 5px; 
                padding: 20px; 
                box-shadow: 0 4px 8px 0 rgba(0,0,0,0.2); 
                transition: 0.3s; 
                text-align: center; 
                width: 100%; 
                max-width: 600px; 
            }
            .product-card img { 
                max-width: 100%; 
                height: auto; 
                border-radius: 5px; 
                margin: 10px 0; 
            }
            .product-card p.description { 
                font-style: italic; 
            }
            .product-card h1 { margin: 0; }
            .product-card p { margin: 10px 0; }
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
                margin: 10px 0; 
            }
            .btn:hover { background-color: #45a049; }
            .link { 
                display: inline-block; 
                padding: 10px 20px; 
                font-size: 16px; 
                cursor: pointer; 
                text-align: center; 
                text-decoration: none; 
                outline: none; 
                color: #4CAF50; 
                background-color: #fff; 
                border: 1px solid #4CAF50; 
                border-radius: 5px; 
                box-shadow: 0 4px 8px 0 rgba(0,0,0,0.2); 
                margin: 10px 0; 
            }
            .link:hover { background-color: #f1f1f1; }
        </style>
        <div class="product-container">
    `);

    try {
        let pool = await sql.connect(dbConfig);
        let result = await pool.request()
            .input('productId', sql.Int, productId)
            .query('SELECT * FROM product WHERE productId = @productId');

        if (result.recordset.length > 0) {
            let product = result.recordset[0];
            let prodPrice = parseFloat(product.productPrice).toFixed(2);

            res.write('<div class="product-card">');
            res.write(`<h1>${product.productName}</h1>`);
            res.write(`<p class="description">${product.productDesc}</p>`);
            

            if (product.productImageURL) {
                res.write(`<img src="/${product.productImageURL}" alt="${product.productName}"><br/>`);
            }

            if (product.productImage) {
                res.write(`<img src="/displayImage?id=${product.productId}" alt="${product.productName}"><br/>`);
            }

            res.write(`<p><strong>Price: $${prodPrice}</strong></p>`);

            res.write(`<a href="/addcart?id=${product.productId}&name=${product.productName}&price=${prodPrice}" class="btn">Add to Cart</a>`);
            res.write(`<a href="/listprod" class="link">Continue Shopping</a>`);
            res.write('</div>');
        } else {
            res.write('<p>Product not found</p>');
        }
    } catch (err) {
        res.write('<p>Error: ' + err.message + '</p>');
    }

    res.write('</div>');
    res.end();
});

module.exports = router;
