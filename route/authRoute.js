import express from 'express';
const router = express.Router();
import { OAuth2Client } from 'google-auth-library';
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
import Users from '../model/user.js';


// getting login URL
// /auth/login
let userid;
router.post('/login', (req, res) => {
    let token = req.body.token;

    async function verify() {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        });
        const payload = ticket.getPayload();
        console.log(payload);
        userid = payload['sub'];
        let userData = await Users.findOne({ googleId: userid });
        if (userData == null) {
            let newUser = new Users({
                googleId: userid,
                firstName: payload['given_name'],
                lastName: payload['family_name'],
                displayName: payload['given_name'] + ' ' + payload['family_name'],
                image: payload['picture'],
                email: payload['email'],
                designation: "Admin"
            });
            await newUser.save();
        }
        console.log(userData);
    }
    verify()
        .then(() => {
            res.cookie('session-token', token);
            res.cookie('user-id', userid);
            res.send('success')
        })
        .catch(console.error);

})

// logout
// /auth/logout
router.get('/logout', (req, res) => {
    console.log(req.cookies['session-token']);
    res.clearCookie('session-token');
    res.send('successfol logout');
})

// getting the current user


export default router;