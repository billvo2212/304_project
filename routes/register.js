const express = require('express');
const router = express.Router();
const sql = require('mssql');

// User Registration Page
router.get('/', function (req, res, next) {
    res.setHeader('Content-Type', 'text/html');
    res.write(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>User Registration</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background-color: #f4f4f9;
                    margin: 0;
                    padding: 0;
                }
                .container {
                    width: 100%;
                    max-width: 600px;
                    margin: 50px auto;
                    background: white;
                    border-radius: 10px;
                    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
                    padding: 20px 30px;
                }
                h1 {
                    text-align: center;
                    color: #333;
                }
                form {
                    display: flex;
                    flex-direction: column;
                }
                label {
                    font-weight: bold;
                    margin: 10px 0 5px;
                }
                input {
                    padding: 10px;
                    font-size: 16px;
                    border: 1px solid #ddd;
                    border-radius: 5px;
                    outline: none;
                }
                input:focus {
                    border-color: #4CAF50;
                }
                button {
                    margin-top: 20px;
                    padding: 10px;
                    background-color: #4CAF50;
                    color: white;
                    border: none;
                    border-radius: 5px;
                    font-size: 16px;
                    cursor: pointer;
                }
                button:hover {
                    background-color: #45a049;
                }
                .link {
                    display: block;
                    text-align: center;
                    margin-top: 15px;
                    font-size: 14px;
                    text-decoration: none;
                    color: #4CAF50;
                }
                .link:hover {
                    text-decoration: underline;
                }
                .error, .success {
                    margin: 10px 0;
                    padding: 10px;
                    border-radius: 5px;
                    text-align: center;
                }
                .error {
                    background-color: #ffdddd;
                    color: #a94442;
                    border: 1px solid #f5c6cb;
                }
                .success {
                    background-color: #ddffdd;
                    color: #155724;
                    border: 1px solid #c3e6cb;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>Create a New Account</h1>
                <form action="/register" method="POST">
                    <label for="firstName">First Name:</label>
                    <input type="text" id="firstName" name="firstName" placeholder="John" required>

                    <label for="lastName">Last Name:</label>
                    <input type="text" id="lastName" name="lastName" placeholder="Doe" required>

                    <label for="email">Email:</label>
                    <input type="email" id="email" name="email" placeholder="example@example.com" required>

                    <label for="phonenum">Phone Number:</label>
                    <input type="text" id="phonenum" name="phonenum" placeholder="123-456-7890" required>

                    <label for="address">Address:</label>
                    <input type="text" id="address" name="address" placeholder="123 Street Name" required>

                    <label for="city">City:</label>
                    <input type="text" id="city" name="city" placeholder="City Name" required>

                    <label for="state">State:</label>
                    <input type="text" id="state" name="state" placeholder="State/Province" required>

                    <label for="postalCode">Postal Code:</label>
                    <input type="text" id="postalCode" name="postalCode" placeholder="12345" required>

                    <label for="country">Country:</label>
                    <input type="text" id="country" name="country" placeholder="Country Name" required>

                    <label for="userid">Username:</label>
                    <input type="text" id="userid" name="userid" placeholder="Choose a username" required>

                    <label for="password">Password:</label>
                    <input type="password" id="password" name="password" placeholder="Choose a secure password" required>

                    <button type="submit">Register</button>
                </form>
                <a href="/" class="link">Home Page</a>
            </div>
        </body>
        </html>
    `);
    res.end();
});

// Handle registration submission
router.post('/', async function (req, res) {
    const { firstName, lastName, email, phonenum, address, city, state, postalCode, country, userid, password } = req.body;

    // Validate input fields
    if (!firstName || !lastName || !email || !phonenum || !address || !city || !state || !postalCode || !country || !userid || !password) {
        res.write(`
            <div class="container">
                <div class="error">Error: All fields are required.</div>
                <a href="/register" class="link">Go back to registration</a>
            </div>
        `);
        res.end();
        return;
    }

    try {
        let pool = await sql.connect(dbConfig);

        // Check if the username already exists
        let existingUser = await pool.request()
            .input('userid', sql.VarChar, userid)
            .query('SELECT userid FROM customer WHERE userid = @userid');

        if (existingUser.recordset.length > 0) {
            res.write(`
                <div class="container">
                    <div class="error">Error: Username already exists. Please choose another.</div>
                    <a href="/register" class="link">Go back to registration</a>
                </div>
            `);
            res.end();
            return;
        }

        // Insert new user into the database
        await pool.request()
            .input('firstName', sql.VarChar, firstName)
            .input('lastName', sql.VarChar, lastName)
            .input('email', sql.VarChar, email)
            .input('phonenum', sql.VarChar, phonenum)
            .input('address', sql.VarChar, address)
            .input('city', sql.VarChar, city)
            .input('state', sql.VarChar, state)
            .input('postalCode', sql.VarChar, postalCode)
            .input('country', sql.VarChar, country)
            .input('userid', sql.VarChar, userid)
            .input('password', sql.VarChar, password)
            .query(`INSERT INTO customer 
                (firstName, lastName, email, phonenum, address, city, state, postalCode, country, userid, password)
                VALUES 
                (@firstName, @lastName, @email, @phonenum, @address, @city, @state, @postalCode, @country, @userid, @password)`);

        res.write(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Registration Successful</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        background-color: #f4f4f9;
                        margin: 0;
                        padding: 0;
                    }
                    .container {
                        width: 100%;
                        max-width: 600px;
                        margin: 50px auto;
                        background: white;
                        border-radius: 10px;
                        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
                        padding: 20px 30px;
                        text-align: center;
                    }
                    h1 {
                        color: #4CAF50;
                    }
                    p {
                        font-size: 18px;
                        color: #555;
                    }
                    .link {
                        display: inline-block;
                        margin-top: 20px;
                        padding: 10px 20px;
                        background-color: #4CAF50;
                        color: white;
                        text-decoration: none;
                        border-radius: 5px;
                        font-size: 16px;
                        transition: background-color 0.3s ease;
                    }
                    .link:hover {
                        background-color: #45a049;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>Registration Successful!</h1>
                    <p>Welcome, <strong>${firstName} ${lastName}</strong>!</p>
                    <p>Your account has been created successfully. You can now log in and start shopping!</p>
                    <a href="/login" class="link">Go to Login</a>
                    <br><br>
                    <a href="/listprod" class="link">Continue Shopping</a>
                </div>
            </body>
            </html>
        `);
        res.end();
    } catch (err) {
        console.error(err);
        res.write(`
            <div class="container">
                <div class="error">Error: Unable to process registration. Please try again later.</div>
                <a href="/register" class="link">Go back to registration</a>
            </div>
        `);
        res.end();
    }
});


module.exports = router;
