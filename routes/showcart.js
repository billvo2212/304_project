const express = require('express');
const router = express.Router();

router.get('/', function (req, res, next) {
    const productList = req.session.productList || false;

    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; border: 1px solid #ccc; border-radius: 10px; box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);">
            <title>Your Shopping Cart</title>
            <h1 style="text-align: center; color: #4CAF50;">Your Shopping Cart</h1>
            
            ${
                productList && productList.some(product => product)
                    ? `
                        <table style="border-collapse: collapse; width: 100%; margin: 20px 0; font-size: 16px;">
                            <thead>
                                <tr style="background-color: #f2f2f2;">
                                    <th style="border: 1px solid #ddd; padding: 10px;">Product ID</th>
                                    <th style="border: 1px solid #ddd; padding: 10px;">Product Name</th>
                                    <th style="border: 1px solid #ddd; padding: 10px; text-align: center;">Quantity</th>
                                    <th style="border: 1px solid #ddd; padding: 10px; text-align: right;">Price</th>
                                    <th style="border: 1px solid #ddd; padding: 10px; text-align: right;">Subtotal</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${productList
                                    .filter(product => product) // Filter out null or undefined products
                                    .map(product => {
                                        const subtotal = (product.quantity * product.price).toFixed(2);
                                        return `
                                            <tr>
                                                <td style="border: 1px solid #ddd; padding: 10px;">${product.id}</td>
                                                <td style="border: 1px solid #ddd; padding: 10px;">${product.name}</td>
                                                <td style="border: 1px solid #ddd; padding: 10px; text-align: center;">${product.quantity}</td>
                                                <td style="border: 1px solid #ddd; padding: 10px; text-align: right;">$${Number(product.price).toFixed(2)}</td>
                                                <td style="border: 1px solid #ddd; padding: 10px; text-align: right;">$${subtotal}</td>
                                            </tr>
                                        `;
                                    })
                                    .join('')}
                                <tr style="background-color: #f9f9f9;">
                                    <td colspan="4" style="text-align: right; padding: 10px; font-weight: bold;">Order Total</td>
                                    <td style="text-align: right; padding: 10px; font-weight: bold;">$${productList
                                        .filter(product => product) // Exclude null products for total calculation
                                        .reduce((total, product) => total + product.quantity * product.price, 0)
                                        .toFixed(2)}</td>
                                </tr>
                            </tbody>
                        </table>
                        <div style="text-align: center; margin: 20px 0;">
                            <a href="checkout" style="text-decoration: none; background-color: #4CAF50; color: white; padding: 10px 20px; border-radius: 5px; font-size: 16px; cursor: pointer;">Check Out</a>
                        </div>
                    `
                    : `
                        <h2 style="text-align: center; color: #f44336;">Your shopping cart is empty!</h2>
                    `
            }

            <div style="text-align: center; margin-top: 20px;">
                <a href="listprod" style="text-decoration: none; color: #4CAF50; font-size: 16px;">Continue Shopping</a>
            </div>
        </div>
    `;

    res.setHeader('Content-Type', 'text/html');
    res.send(html);
});

module.exports = router;
