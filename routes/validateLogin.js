const express = require('express');
const router = express.Router();
// const auth = require('../auth');
const sql = require('mssql');

router.post('/', function(req, res) {
    // Have to preserve async context since we make an async call
    // to the database in the validateLogin function.
    (async () => {
        let authenticatedUser = await validateLogin(req);
        if (authenticatedUser) {
            req.session.authenticatedUser = req.body.username;
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
    let authenticatedUser =  await (async function() {
        try {
            let pool = await sql.connect(dbConfig);

            const query = `
                SELECT * 
                FROM customer
                WHERE userid = @username AND password = @password
            `;
            let result = await pool.request()
                .input('username', sql.VarChar, username)
                .input('password', sql.VarChar, password)
                .query(query);

                if (result.recordset.length > 0) {
                    let user = result.recordset[0];
                    return `${user.userid}`; 
                }

                return false;

	// TODO: Check if userId and password match some customer account. 
	// If so, set authenticatedUser to be the username.
        } catch(err) {
            console.dir(err);
            return false;
        }
    })();

    return authenticatedUser;
}

module.exports = router;
