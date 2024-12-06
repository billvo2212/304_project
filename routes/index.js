const express = require('express');
const router = express.Router();
const sql = require('mssql');

router.get('/', async (req, res) => {
    let isAdmin = false;

    if (req.session.authenticatedUser) {
        const username = req.session.authenticatedUser;
        isAdmin = await checkIfAdmin(username); // Function to check admin status
    }

    res.render('index', {
        title: "SNEAKER-HEAD",
        username: req.session.authenticatedUser,
        isAdmin: isAdmin,
        alertMessage: req.session.alertMessage || null,
    });

    // Clear the alert message after rendering
    req.session.alertMessage = null;
});

// Check admin role function
async function checkIfAdmin(username) {
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .input('username', sql.VarChar, username)
            .query('SELECT role FROM customer WHERE userid = @username');

        return result.recordset.length > 0 && result.recordset[0].role === 'admin'; // Check if the user has 'admin' role
    } catch (err) {
        console.error(err);
        return false;
    }
}

module.exports = router;
