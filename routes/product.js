const express = require('express');
const router = express.Router();
const sql = require('mssql');

router.get('/:id', function(req, res, next) {
    res.setHeader('Content-Type', 'text/html');
    (async function() {
        try {
            let pool = await sql.connect(dbConfig);
            let productId = req.params.id;

	        // Get product name to search for
	        // TODO: Retrieve and display info for the product
            let result = await pool.request()
                .input('productId', sql.Int, productId)
                .query('SELECT * FROM product WHERE productId = @productId');

	        // TODO: If there is a productImageURL, display using IMG tag
            if (result.recordset.length > 0) {
                let product = result.recordset[0];

                let prodPrice = parseFloat(product.productPrice).toFixed(2);
                console.log(prodPrice);
                res.write(`<h1>${product.productName}</h1>`);
                res.write(`<p>${product.productDesc}</p>`);
                res.write(`<p>Price: $${product.productPrice}</p>`);

	            // TODO: Retrieve any image stored directly in database. Note: Call displayImage.jsp with product id as parameter.
                // Display image from URL
                if (product.productImageURL) {
                    res.write(`<img src="/${product.productImageURL}" alt="${product.productName}">`);
                    // console.log(`<img src="${product.productImageURL}" alt="${product.productName}">`);    
                }

                // Display image from binary field
                if (product.productImage) {
                    res.write(`<img src="/displayImage?id=${product.productId}" alt="${product.productName}">`);
                }

	            // TODO: Add links to Add to Cart and Continue Shopping
                // Add to cart and continue shopping links
                res.write(`<br>`);
                res.write(`<br>`);

                res.write(`<a href="/addcart?id=${product.productId}&name=${product.productName}&price=${prodPrice}">Add to Cart</a>`);
                res.write(`<br>`);
                res.write(`<br>`);

                res.write(`<a href="/listprod">Continue Shopping</a>`);
            } else {
                res.write('<p>Product not found</p>');
            }

            res.end()
        } catch(err) {
            console.dir(err);
            res.write(err + "")
            res.end();
        }
    })();
});

module.exports = router;
