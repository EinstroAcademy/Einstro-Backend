const User = require("../schema/user.schema");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const googleRedirectUrl = process.env.GOOGLE_REDIRECT_URL

exports.loginSuccess = async (req, res) => {
    try {
        if (!req.user) {
            return res.json({ status: "00", message: 'User Not found' })
        };
        console.log(req.user._json);
        const { name, given_name, family_name, email, picture, id } = req.user._json
        const checkUser = await User.find({ email: email })
        if (checkUser.length > 0) {
            let token = jwt.sign({ email: email, username: name }, "einstrostudyabroad", { expiresIn: '8hr' })
            return res.redirect(`${googleRedirectUrl}/dashboard?token=${token}`)
        }
        let user = {
            fullName: name,
            userName: name,
            email: email,
            image: picture,
            role: 'user'
        }
        const createUser = await User.create(user)
        if (!createUser) {
            return res.json({ status: 0, message: "User not created" })
        }
        let token = jwt.sign({ email: email, username: name, role: 'user' }, "einstrostudyabroad", { expiresIn: '8hr' })

        return res.redirect(`${googleRedirectUrl}/dashboard?token=${token}`)

    } catch (error) {
        console.log(error);
    }
};

exports.logout = (req, res) => {
    try {
        req.logout(() => {
            res.redirect('/');
        });
    } catch (error) {
        console.log(error);
    }

};

exports.home = (req, res) => {
    try {
        res.send(`<h1>Home Page</h1><a href="/auth/google">Login with Google</a>`);
    } catch (error) {
        console.log(error);
    }

};
