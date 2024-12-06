const express = require('express');
const router = express.Router();
const sql = require('mssql');
const auth = require('../auth');

// Helper function to check if the user is an admin
async function isAdmin(username) {
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .input('username', sql.VarChar, username)
            .query('SELECT role FROM customer WHERE userid = @username');

        return result.recordset.length > 0 && result.recordset[0].role === 'admin'; // Check if the user has 'admin' role
    } catch (err) {
        console.error('Error checking admin role:', err);
        return false; // Default to false in case of an error
    }
}


// Middleware to verify admin access
async function adminAuthMiddleware(req, res, next) {
    if (auth.checkAuthentication(req, res)) {
        const isAdminUser = await isAdmin(req.session.authenticatedUser);
        if (isAdminUser) {
            next(); // User is an admin, proceed to the route
        } else {
            req.session.alertMessage = "Unauthorized access. Admins only.";
            res.redirect('/'); // Redirect non-admins to the homepage
        }
    } else {
        req.session.alertMessage = "You must log in to access this page.";
        res.redirect('/login'); // Redirect unauthenticated users to login
    }
}

router.get('/', adminAuthMiddleware,function (req, res, next) {
    
    res.setHeader('Content-Type', 'text/html');
        // Dashboard HTML with buttons for different features
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; border: 1px solid #ccc; border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
                <h1 style="text-align: center; color: #4CAF50;">Administrator Dashboard</h1>
                <div style="display: flex; flex-direction: column; align-items: center; gap: 15px; margin-top: 20px;">
                    <a href="/admin/sales-by-date" style="text-decoration: none; background-color: #4CAF50; color: white; padding: 10px 20px; border-radius: 5px; font-size: 16px;">View Sales Report by Date</a>
                    <a href="/admin/customers" style="text-decoration: none; background-color: #4CAF50; color: white; padding: 10px 20px; border-radius: 5px; font-size: 16px;">List All Customers</a>
                    <a href="/admin/sales-report" style="text-decoration: none; background-color: #4CAF50; color: white; padding: 10px 20px; border-radius: 5px; font-size: 16px;">Total Sales by Customer</a>
                    <a href="/admin/sales-graph" style="text-decoration: none; background-color: #4CAF50; color: white; padding: 10px 20px; border-radius: 5px; font-size: 16px;">Sales Graph</a>
                    <a href="/admin/add-product" style="text-decoration: none; background-color: #4CAF50; color: white; padding: 10px 20px; border-radius: 5px; font-size: 16px;">Add New Product</a>
                    <a href="/admin/manage-products" style="text-decoration: none; background-color: #4CAF50; color: white; padding: 10px 20px; border-radius: 5px; font-size: 16px;">Manage Products</a>
                    <a href="/" style="text-decoration: none; background-color: #4CAF50; color: white; padding: 10px 20px; border-radius: 5px; font-size: 16px;">Back to Home</a>
                    
                </div>
            </div>
        `;
        res.send(html);
    
});


router.get('/sales-by-date',adminAuthMiddleware, async (req, res) => {
    res.setHeader('Content-Type', 'text/html');
    
    try {
        let pool = await sql.connect(dbConfig);
        const query = `
            SELECT 
                FORMAT(CAST(orderDate AS DATE), 'yyyy-MM-dd') AS [Order Date], 
                SUM(totalAmount) AS [Total Order Amount]
            FROM ordersummary
            GROUP BY CAST(orderDate AS DATE)
            ORDER BY CAST(orderDate AS DATE);
        `;
        let result = await pool.request().query(query);

        let html = `
            <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; border: 1px solid #ccc; border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
                <h1 style="text-align: center; color: #4CAF50;">Sales Report by Date</h1>
                <table style="border-collapse: collapse; width: 100%; margin-top: 20px; font-size: 16px;">
                    <thead>
                        <tr style="background-color: #f2f2f2;">
                            <th style="border: 1px solid #ddd; padding: 10px; text-align: left;">Order Date</th>
                            <th style="border: 1px solid #ddd; padding: 10px; text-align: left;">Total Order Amount</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        result.recordset.forEach(row => {
            html += `
                <tr>
                    <td style="border: 1px solid #ddd; padding: 10px;">${row['Order Date']}</td>
                    <td style="border: 1px solid #ddd; padding: 10px;">$${row['Total Order Amount'].toFixed(2)}</td>
                </tr>
            `;
        });
        html += `
                    </tbody>
                </table>
                <div style="text-align: center; margin-top: 20px;">
                    <a href="/admin" style="text-decoration: none; background-color: #4CAF50; color: white; padding: 10px 20px; border-radius: 5px; font-size: 16px;">Back to Admin Portal</a>
                </div>
            </div>
        `;
        res.send(html);

    } catch (err) {
        console.error(err);
        res.status(500).send('Error generating report');
    }

});
router.get('/customers',adminAuthMiddleware, async (req, res) => {
    res.setHeader('Content-Type', 'text/html');
    
        try {
            const pool = await sql.connect(dbConfig);
            const result = await pool.request().query('SELECT * FROM customer');
            let html = `
                <div style="font-family: Arial, sans-serif; max-width: 900px; margin: 50px auto; padding: 20px; border: 1px solid #ccc; border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
                    <h1 style="text-align: center; color: #4CAF50;">Customer List</h1>
                    <table style="border-collapse: collapse; width: 100%; margin-top: 20px; font-size: 16px;">
                        <thead>
                            <tr style="background-color: #f2f2f2;">
                                <th style="border: 1px solid #ddd; padding: 10px; text-align: left;">ID</th>
                                <th style="border: 1px solid #ddd; padding: 10px; text-align: left;">Name</th>
                                <th style="border: 1px solid #ddd; padding: 10px; text-align: left;">Email</th>
                                <th style="border: 1px solid #ddd; padding: 10px; text-align: left;">Phone</th>
                            </tr>
                        </thead>
                        <tbody>
            `;

            result.recordset.forEach(c => {
                html += `
                    <tr>
                        <td style="border: 1px solid #ddd; padding: 10px;">${c.customerId}</td>
                        <td style="border: 1px solid #ddd; padding: 10px;">${c.firstName} ${c.lastName}</td>
                        <td style="border: 1px solid #ddd; padding: 10px;">${c.email}</td>
                        <td style="border: 1px solid #ddd; padding: 10px;">${c.phonenum}</td>
                    </tr>
                `;
            });

            html += `
                        </tbody>
                    </table>
                    <div style="text-align: center; margin-top: 20px;">
                        <a href="/admin" style="text-decoration: none; background-color: #4CAF50; color: white; padding: 10px 20px; border-radius: 5px; font-size: 16px;">Back to Dashboard</a>
                    </div>
                </div>
            `;
            res.send(html);
        } catch (err) {
            console.error(err);
            res.status(500).send(`
                <div style="font-family: Arial, sans-serif; text-align: center; margin-top: 50px;">
                    <h1 style="color: red;">Error Fetching Customers</h1>
                    <p>${err.message}</p>
                    <a href="/" style="text-decoration: none; background-color: #4CAF50; color: white; padding: 10px 20px; border-radius: 5px; font-size: 16px;">Back to Dashboard</a>
                </div>
            `);
        }
    
});

router.get('/sales-report', adminAuthMiddleware,async (req, res) => {
    res.setHeader('Content-Type', 'text/html');
    
        try {
            const pool = await sql.connect(dbConfig);
            const query = `
                SELECT c.firstName + ' ' + c.lastName AS Customer, SUM(o.totalAmount) AS TotalSales
                FROM customer c
                JOIN ordersummary o ON c.customerId = o.customerId
                GROUP BY c.firstName, c.lastName
            `;
            const result = await pool.request().query(query);

            let html = `
                <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; border: 1px solid #ccc; border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
                    <h1 style="text-align: center; color: #4CAF50;">Total Sales by Customer</h1>
                    <table style="border-collapse: collapse; width: 100%; margin-top: 20px; font-size: 16px;">
                        <thead>
                            <tr style="background-color: #f2f2f2;">
                                <th style="border: 1px solid #ddd; padding: 10px; text-align: left;">Customer</th>
                                <th style="border: 1px solid #ddd; padding: 10px; text-align: left;">Total Sales</th>
                            </tr>
                        </thead>
                        <tbody>
            `;

            result.recordset.forEach(row => {
                html += `
                    <tr>
                        <td style="border: 1px solid #ddd; padding: 10px;">${row.Customer}</td>
                        <td style="border: 1px solid #ddd; padding: 10px;">$${row.TotalSales.toFixed(2)}</td>
                    </tr>
                `;
            });

            html += `
                        </tbody>
                    </table>
                    <div style="text-align: center; margin-top: 20px;">
                        <a href="/admin" style="text-decoration: none; background-color: #4CAF50; color: white; padding: 10px 20px; border-radius: 5px; font-size: 16px;">Back to Admin Portal</a>
                    </div>
                </div>
            `;
            res.send(html);
        } catch (err) {
            console.error(err);
            res.status(500).send(`
                <div style="font-family: Arial, sans-serif; text-align: center; margin-top: 50px;">
                    <h1 style="color: red;">Error Fetching Sales Report</h1>
                    <p>${err.message}</p>
                    <a href="/" style="text-decoration: none; background-color: #4CAF50; color: white; padding: 10px 20px; border-radius: 5px; font-size: 16px;">Back to Dashboard</a>
                </div>
            `);
        }
    
});


router.get('/add-product', adminAuthMiddleware,(req, res) => {
    res.setHeader('Content-Type', 'text/html');
    
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; border: 1px solid #ccc; border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
                <h1 style="text-align: center; color: #4CAF50;">Add New Product</h1>
                <form action="/admin/add-product" method="post" style="display: flex; flex-direction: column; gap: 15px; margin-top: 20px;">
                    <label for="name" style="font-size: 16px;">Product Name:</label>
                    <input type="text" id="name" name="name" placeholder="Product Name" required style="padding: 10px; font-size: 14px; border: 1px solid #ccc; border-radius: 5px;">

                    <label for="desc" style="font-size: 16px;">Product Description:</label>
                    <textarea id="desc" name="desc" placeholder="Product Description" required style="padding: 10px; font-size: 14px; border: 1px solid #ccc; border-radius: 5px;"></textarea>

                    <label for="price" style="font-size: 16px;">Price:</label>
                    <input type="number" id="price" step="0.01" name="price" placeholder="Price" required style="padding: 10px; font-size: 14px; border: 1px solid #ccc; border-radius: 5px;">

                    <label for="category" style="font-size: 16px;">Category ID:</label>
                    <input type="number" id="category" name="category" placeholder="Category ID" required style="padding: 10px; font-size: 14px; border: 1px solid #ccc; border-radius: 5px;">

                    <button type="submit" style="padding: 10px 20px; font-size: 16px; background-color: #4CAF50; color: white; border: none; border-radius: 5px; cursor: pointer;">Add Product</button>
                </form>
                <div style="text-align: center; margin-top: 20px;">
                    <a href="/admin" style="text-decoration: none; background-color: #4CAF50; color: white; padding: 10px 20px; border-radius: 5px; font-size: 16px;">Back to Admin Portal</a>
                </div>
            </div>
        `;
        res.send(html);
    
});

router.post('/add-product', adminAuthMiddleware,async (req, res) => {
    // Extract form data from the request body
    const { name, desc, price, category } = req.body;

    try {
        // Connect to the database
        const pool = await sql.connect(dbConfig);

        // Insert the new product into the database
        await pool.request()
            .input('name', sql.VarChar, name)
            .input('desc', sql.VarChar, desc)
            .input('price', sql.Decimal, price)
            .input('category', sql.Int, category)
            .query(`
                INSERT INTO product (productName, productDesc, productPrice, categoryId)
                VALUES (@name, @desc, @price, @category)
            `);

        // Redirect to the admin dashboard after adding the product
        res.redirect('/admin');
    } catch (err) {
        console.error(err);

        // Send error message to the client in case of failure
        res.status(500).send(`
            <div style="font-family: Arial, sans-serif; text-align: center; margin-top: 50px;">
                <h1 style="color: red;">Error Adding Product</h1>
                <p>${err.message}</p>
                <a href="/admin" style="text-decoration: none; background-color: #4CAF50; color: white; padding: 10px 20px; border-radius: 5px; font-size: 16px;">Back to Admin Portal</a>
            </div>
        `);
    }
});




router.post('/update-product',adminAuthMiddleware, async (req, res) => {
    const { productId, name, price } = req.body;

    try {
        const pool = await sql.connect(dbConfig);
        await pool.request()
            .input('productId', sql.Int, productId)
            .input('name', sql.VarChar, name)
            .input('price', sql.Decimal, price)
            .query(`
                UPDATE product
                SET productName = @name, productPrice = @price
                WHERE productId = @productId
            `);
        res.redirect('/');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error updating product');
    }
});

router.get('/delete-product', adminAuthMiddleware,async (req, res) => {
    res.setHeader('Content-Type', 'text/html');
    
        try {
            const pool = await sql.connect(dbConfig);
            const result = await pool.request().query('SELECT productId, productName FROM product');
            let html = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; border: 1px solid #ccc; border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
                    <h1 style="text-align: center; color: #4CAF50;">Delete Product</h1>
                    <form action="/delete-product" method="post" style="display: flex; flex-direction: column; gap: 15px;">
                        <label for="product" style="font-size: 16px;">Select Product:</label>
                        <select id="product" name="productId" style="padding: 10px; border: 1px solid #ccc; border-radius: 5px;">
            `;

            result.recordset.forEach(product => {
                html += `<option value="${product.productId}">${product.productName}</option>`;
            });

            html += `
                        </select>
                        <button type="submit" style="padding: 10px 20px; background-color: #FF6347; color: white; border: none; border-radius: 5px;">Delete Product</button>
                    </form>
                    <div style="text-align: center; margin-top: 20px;">
                        <a href="/admin" style="text-decoration: none; background-color: #4CAF50; color: white; padding: 10px 20px; border-radius: 5px; font-size: 16px;">Back to Admin Portal</a>
                    </div>
                </div>
            `;
            res.send(html);
        } catch (err) {
            console.error(err);
            res.status(500).send('Error loading products');
        
    }
});

router.post('/delete-product', adminAuthMiddleware,async (req, res) => {
    const { productId } = req.body;

    try {
        const pool = await sql.connect(dbConfig);
        await pool.request()
            .input('productId', sql.Int, productId)
            .query('DELETE FROM product WHERE productId = @productId');

        res.redirect('/admin/manage-products');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error deleting product');
    }
});


router.get('/manage-products',adminAuthMiddleware, async (req, res) => {
    res.setHeader('Content-Type', 'text/html');
    
        try {
            const pool = await sql.connect(dbConfig);
            const result = await pool.request().query('SELECT * FROM product');

            let html = `
                <div style="font-family: Arial, sans-serif; max-width: 900px; margin: 50px auto; padding: 20px; border: 1px solid #ccc; border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
                    <h1 style="text-align: center; color: #4CAF50;">Manage Products</h1>
                    <table style="border-collapse: collapse; width: 100%; margin-top: 20px; font-size: 16px;">
                        <thead>
                            <tr style="background-color: #f2f2f2;">
                                <th style="border: 1px solid #ddd; padding: 10px;">Product ID</th>
                                <th style="border: 1px solid #ddd; padding: 10px;">Product Name</th>
                                <th style="border: 1px solid #ddd; padding: 10px;">Description</th>
                                <th style="border: 1px solid #ddd; padding: 10px;">Price</th>
                                <th style="border: 1px solid #ddd; padding: 10px;">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
            `;

            result.recordset.forEach(product => {
                html += `
                    <tr>
                        <td style="border: 1px solid #ddd; padding: 10px;">${product.productId}</td>
                        <td style="border: 1px solid #ddd; padding: 10px;">${product.productName}</td>
                        <td style="border: 1px solid #ddd; padding: 10px;">${product.productDesc}</td>
                        <td style="border: 1px solid #ddd; padding: 10px;">$${product.productPrice.toFixed(2)}</td>
                        <td style="border: 1px solid #ddd; padding: 10px; text-align: center;">
                            <a href="/admin/edit-product/${product.productId}" style="text-decoration: none; color: #4CAF50; margin-right: 10px;">Edit</a>
                            <form action="/admin/delete-product" method="post" style="display: inline;">
                                <input type="hidden" name="productId" value="${product.productId}">
                                <button type="submit" style="background: none; border: none; color: #FF6347; cursor: pointer;">Delete</button>
                            </form>
                        </td>
                    </tr>
                `;
            });

            html += `
                        </tbody>
                    </table>
                    <div style="text-align: center; margin-top: 20px;">
                        <a href="/admin" style="text-decoration: none; background-color: #4CAF50; color: white; padding: 10px 20px; border-radius: 5px; font-size: 16px;">Back to Admin Portal</a>
                    </div>
                </div>
            `;
            res.send(html);
        } catch (err) {
            console.error(err);
            res.status(500).send('Error loading products');
        }
    
});
router.get('/edit-product/:id', adminAuthMiddleware,async (req, res) => {
    const { id } = req.params;
    res.setHeader('Content-Type', 'text/html');
    
        try {
            const pool = await sql.connect(dbConfig);
            const result = await pool.request()
                .input('productId', sql.Int, id)
                .query('SELECT productId, productName, productDesc, productPrice FROM product WHERE productId = @productId');

            const product = result.recordset[0];
            if (!product) {
                res.status(404).send('Product not found');
                return;
            }

            const html = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; border: 1px solid #ccc; border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
                    <h1 style="text-align: center; color: #4CAF50;">Edit Product</h1>
                    <form action="/admin/edit-product/${product.productId}" method="post" style="display: flex; flex-direction: column; gap: 15px;">
                        <label for="name" style="font-size: 16px;">Product Name:</label>
                        <input type="text" id="name" name="name" value="${product.productName}" required style="padding: 10px; border: 1px solid #ccc; border-radius: 5px;">
                        <label for="desc" style="font-size: 16px;">Description:</label>
                        <textarea id="desc" name="desc" required style="padding: 10px; border: 1px solid #ccc; border-radius: 5px;">${product.productDesc}</textarea>
                        <label for="price" style="font-size: 16px;">Price:</label>
                        <input type="number" id="price" name="price" step="0.01" value="${product.productPrice}" required style="padding: 10px; border: 1px solid #ccc; border-radius: 5px;">
                        <button type="submit" style="padding: 10px 20px; background-color: #4CAF50; color: white; border: none; border-radius: 5px;">Update Product</button>
                    </form>
                    <div style="text-align: center; margin-top: 20px;">
                        <a href="/admin/manage-products" style="text-decoration: none; background-color: #4CAF50; color: white; padding: 10px 20px; border-radius: 5px; font-size: 16px;">Back to Products</a>
                    </div>
                </div>
            `;
            res.send(html);
        } catch (err) {
            console.error(err);
            res.status(500).send('Error loading product');
        
    }
});
router.post('/edit-product/:id',adminAuthMiddleware, async (req, res) => {
    const { id } = req.params;
    const { name, desc, price } = req.body;

    try {
        const pool = await sql.connect(dbConfig);
        await pool.request()
            .input('productId', sql.Int, id)
            .input('name', sql.VarChar, name)
            .input('desc', sql.VarChar, desc)
            .input('price', sql.Decimal, price)
            .query(`
                UPDATE product
                SET productName = @name, productDesc = @desc, productPrice = @price
                WHERE productId = @productId
            `);

        res.redirect('/admin/manage-products');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error updating product');
    }
});



router.get('/sales-graph', adminAuthMiddleware,async (req, res) => {
    res.setHeader('Content-Type', 'text/html');
    
        try {
            const pool = await sql.connect(dbConfig);
            const result = await pool.request().query(`
                SELECT 
                    FORMAT(orderDate, 'yyyy-MM') AS month, 
                    SUM(totalAmount) AS totalSales
                FROM ordersummary
                GROUP BY FORMAT(orderDate, 'yyyy-MM')
                ORDER BY FORMAT(orderDate, 'yyyy-MM');
            `);

            // Extract data for the graph
            const labels = result.recordset.map(row => row.month);
            const data = result.recordset.map(row => row.totalSales);

            const html = `
                <html>
                <head>
                    <title>Sales Graph</title>
                    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
                </head>
                <body style="font-family: Arial, sans-serif;">
                    <div style="max-width: 800px; margin: 50px auto; padding: 20px; border: 1px solid #ccc; border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
                        <h1 style="text-align: center; color: #4CAF50;">Sales Report with Graph</h1>
                        <canvas id="salesChart" style="max-width: 100%; height: 400px;"></canvas>
                        <div style="text-align: center; margin-top: 20px;">
                            <a href="/admin" style="text-decoration: none; background-color: #4CAF50; color: white; padding: 10px 20px; border-radius: 5px; font-size: 16px;">Back to Admin Portal</a>
                        </div>
                    </div>
                    <script>
                        const ctx = document.getElementById('salesChart').getContext('2d');
                        const salesChart = new Chart(ctx, {
                            type: 'bar', // Choose 'line', 'bar', etc.
                            data: {
                                labels: ${JSON.stringify(labels)},
                                datasets: [{
                                    label: 'Total Sales ($)',
                                    data: ${JSON.stringify(data)},
                                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                                    borderColor: 'rgba(75, 192, 192, 1)',
                                    borderWidth: 1
                                }]
                            },
                            options: {
                                responsive: true,
                                plugins: {
                                    legend: { display: true },
                                    title: { display: true, text: 'Monthly Sales' }
                                },
                                scales: {
                                    y: { beginAtZero: true }
                                }
                            }
                        });
                    </script>
                </body>
                </html>
            `;

            res.send(html);
        } catch (err) {
            console.error(err);
            res.status(500).send('Error generating sales graph');
        
    }
});







module.exports = router;
