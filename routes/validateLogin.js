const express = require('express');
const router = express.Router();
const sql = require('mssql');

router.post('/', function (req, res) {
    // Preserve async context since we make async calls
    (async () => {
        let authenticatedUser = await validateLogin(req);
        if (authenticatedUser) {
            req.session.authenticatedUser = req.body.username; // Store username in session
            res.redirect("/");
        } else {
            req.session.loginMessage = "Could not connect to the system using that username/password.";
            res.redirect("/login");
        }
    })();
});

async function validateLogin(req) {
    if (!req.body || !req.body.username || !req.body.password) {
        return false;
    }

    let username = req.body.username;
    let password = req.body.password;

    try {
        let pool = await sql.connect(dbConfig);

        // Query customer table with role check
        const query = `
            SELECT userid AS username, role
            FROM customer
            WHERE userid = @username AND password = @password
        `;

        let result = await pool.request()
            .input('username', sql.VarChar, username)
            .input('password', sql.VarChar, password)
            .query(query);

        if (result.recordset.length > 0) {
            return result.recordset[0]; // Return the user and role if found
        }

        return false; // No match found
    } catch (err) {
        console.error("Error during login validation:", err);
        return false;
    }
}


module.exports = router;
