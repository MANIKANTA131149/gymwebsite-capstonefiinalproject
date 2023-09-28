const express = require('express');
const admin = require('firebase-admin');
const { getFirestore } = require('firebase-admin/firestore');
const serviceAccount = require("./key.json");
const bcrypt = require('bcrypt');

const adminApp = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});
const firestoreDB = getFirestore(adminApp);

const app = express();

const saltRounds = 10; 

app.use(express.urlencoded({ extended: true })); 

app.get("/", function(req, res) {
    res.sendFile(__dirname + "/gym.html");
});

app.get('/redirect', (req, res) => {
    res.sendFile(__dirname + "/login.html");
});

app.get('/signup', (req, res) => {
    res.sendFile(__dirname + "/gym.html");
});

app.get('/logout', (req, res) => {
    res.sendFile(__dirname + "/gym.html");
});

app.get('/main', (req, res) => {
    res.sendFile(__dirname + "/login.html");
});

app.get('/about', (req, res) => {
    res.sendFile(__dirname + "/about.html");
});

app.get('/home', (req, res) => {
    res.sendFile(__dirname + "/api.html");
});

app.post("/sig", async function(req, res) { 
    const { email1, password1, gender1, dob1 } = req.body; 
    const email = email1;
    const password = password1;
    const gender = gender1;
    const dob = dob1;

    try {
        const existingUserQuery = await firestoreDB.collection('gym').where('Email', '==', email).get();

        if (existingUserQuery.empty) {
            bcrypt.hash(password, saltRounds, async (err, hash) => {
                if (err) {
                    console.error("Error hashing password:", err);
                    res.status(500).send("Error hashing password.");
                } else {
    
                    await firestoreDB.collection('gym').add({
                        Email: email,
                        Password: hash,
                        Gender: gender,
                        DOB: dob
                    });
                    res.sendFile(__dirname + "/succsign.html");
                }
            });
        } else {
            res.sendFile(__dirname + "/Faillogin.html");
        }
    } catch (error) {
        console.error("Error storing data:", error);
        res.status(500).send("Error storing data.");
    }
});

app.post('/log', async function(req, res) { 
    const { email2, password2 } = req.body; 
    const imail = email2;
    const iassword = password2;

    try {

        const userQuery = await firestoreDB.collection('gym').where('Email', '==', imail).get();
        if (userQuery.empty) {
            res.send("User not found. Please check your credentials and try again.");
        } else {
            const user = userQuery.docs[0].data();
         
            bcrypt.compare(iassword, user.Password, (err, result) => {
                if (err || !result) {
                    res.sendFile(__dirname + "/forgotpass.html");
                } else {
                    res.sendFile(__dirname + "/api.html");
                }
            });
        }
    } catch (error) {
        console.error("Error retrieving data:", error);
        res.status(500).send("Error retrieving data.");
    }
});

const port = 5000; 
app.listen(port, function() {
    console.log("Server started on port", port);
});
