const express = require('express');
const router = express.Router();
const sql = require('mssql');
const moment = require('moment');

router.get('/', async function (req, res, next) {
    res.setHeader('Content-Type', 'text/html');

    const orderId = req.query.orderId;

    if (!orderId) {
        res.send(`
            <div style="text-align: center; font-family: Arial, sans-serif;">
                <h1 style="color: red;">Order ID is required</h1>
                <a href="/" style="text-decoration: none; color: blue; font-size: 18px;">
                    <h2>Back to Main Page</h2>
                </a>
            </div>
        `);
        return;
    }

    let transaction;
    try {
        let pool = await sql.connect(dbConfig);

        transaction = new sql.Transaction(pool);
        await transaction.begin();

        const orderQuery = `
            SELECT op.productId, op.quantity, pi.quantity AS inventory
            FROM orderproduct op
            JOIN productinventory pi ON op.productId = pi.productId
            WHERE op.orderId = @orderId AND pi.warehouseId = 1;
        `;
        const orderResult = await transaction.request()
            .input('orderId', sql.Int, orderId)
            .query(orderQuery);

        const orderItems = orderResult.recordset;

        if (orderItems.length === 0) {
            res.send(`
                <div style="text-align: center; font-family: Arial, sans-serif;">
                    <h1 style="color: red;">Invalid Order ID</h1>
                    <a href="/" style="text-decoration: none; color: blue; font-size: 18px;">
                        Back to Main Page
                    </a>
                </div>
            `);
            await transaction.rollback();
            return;
        }

        const shipmentDate = moment().format('YYYY-MM-DD HH:mm:ss');
        const shipmentDesc = `Shipment for Order ID: ${orderId}`;
        const insertShipmentQuery = `
            INSERT INTO shipment (shipmentDate, shipmentDesc, warehouseId)
            VALUES (@shipmentDate, @shipmentDesc, 1);
            SELECT SCOPE_IDENTITY() AS shipmentId;
        `;
        const shipmentResult = await transaction.request()
            .input('shipmentDate', sql.DateTime, shipmentDate)
            .input('shipmentDesc', sql.VarChar, shipmentDesc)
            .query(insertShipmentQuery);

        const shipmentId = shipmentResult.recordset[0].shipmentId;

        let insufficientInventory = null;
        let html = `
            <div style="font-family: Arial, sans-serif; margin: 0 auto; width: 80%;">
                <h1 style="text-align: center; color: purple;">SNEAKER Shipment</h1>
                <table style="border-collapse: collapse; width: 100%; margin: 20px auto; text-align: left;">
                    <thead>
                        <tr style="background-color: #f2f2f2;">
                            <th style="border: 1px solid #ddd; padding: 8px;">Product ID</th>
                            <th style="border: 1px solid #ddd; padding: 8px;">Quantity Ordered</th>
                            <th style="border: 1px solid #ddd; padding: 8px;">Previous Inventory</th>
                            <th style="border: 1px solid #ddd; padding: 8px;">New Inventory</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        for (const item of orderItems) {
            const { productId, quantity, inventory } = item;

            if (inventory < quantity) {
                insufficientInventory = productId;
                break;
            }

            const updateInventoryQuery = `
                UPDATE productinventory
                SET quantity = quantity - @quantity
                WHERE productId = @productId AND warehouseId = 1;
            `;
            await transaction.request()
                .input('quantity', sql.Int, quantity)
                .input('productId', sql.Int, productId)
                .query(updateInventoryQuery);

            html += `
                <tr>
                    <td style="border: 1px solid #ddd; padding: 8px;">${productId}</td>
                    <td style="border: 1px solid #ddd; padding: 8px;">${quantity}</td>
                    <td style="border: 1px solid #ddd; padding: 8px;">${inventory}</td>
                    <td style="border: 1px solid #ddd; padding: 8px;">${inventory - quantity}</td>
                </tr>
            `;
        }

        if (insufficientInventory !== null) {
            await transaction.rollback();
            html += `
                </tbody>
                </table>
                <p style="color: red; font-size: 18px; text-align: center;">
                    Shipment not done. Insufficient inventory for product ID: ${insufficientInventory}.
                </p>
                <div style="text-align: center;">
                    <a href="/" style="text-decoration: none; color: blue; font-size: 16px;">Back to Main Page</a>
                </div>
            </div>
            `;
            res.send(html);
            return;
        }

        await transaction.commit();

        html += `
                </tbody>
                </table>
                <p style="color: green; font-size: 18px; text-align: center;">
                    Shipment successfully processed.
                </p>
                <div style="text-align: center;">
                    <a href="/" style="text-decoration: none; color: blue; font-size: 16px;">Back to Main Page</a>
                </div>
            </div>
        `;

        res.send(html);

    } catch (err) {
        console.error('Error during shipment processing:', err);

        if (transaction) {
            try {
                await transaction.rollback();
            } catch (rollbackErr) {
                console.error('Error during transaction rollback:', rollbackErr);
            }
        }

        res.send(`
            <div style="text-align: center; font-family: Arial, sans-serif;">
                <h1 style="color: red;">An error occurred during shipment processing.</h1>
                <a href="/" style="text-decoration: none; color: blue; font-size: 18px;">Back to Main Page</a>
            </div>
        `);
    }
});

module.exports = router;
