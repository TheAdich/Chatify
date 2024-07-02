const User = require('../models/User')
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
require('dotenv').config()
const maxAge = 3 * 24 * 60 * 60;
const genrateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_KEY, {
        expiresIn: maxAge
    })
}

async function hashPassword(password) {
    try {
        const saltRounds = 10; // Number of salt rounds to use
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        return hashedPassword;
    } catch (error) {
        console.log(error)
    }
}

async function comparePassword(password, hashedPassword) {
    try {
        const match = await bcrypt.compare(password, hashedPassword);
        return match;
    } catch (error) {
        console.log(error)
    }
}

const register = async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).send('Please fill all the fields!')
    }

    const isUserExist = await User.findOne({ email });
    if (isUserExist) {
        return res.status(400).send('This email already exist!');
    }

    const hashed = await hashPassword(password)

    const user = await User.create({
        name,
        email,
        password: hashed,
    });
    //console.log((user._id).toString());




    if (user) {
        res.status(200).json({
            user
        });
    }
    else {
        res.status(404).json('Some error occured!')
    }

}



const login = async (req, res) => {
    const { email, password } = req.body;


    if (!email || !password) {
        return res.status(400).send('Please fill all the fields!')
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(400).send('User not found!')
    const compare = await comparePassword(password, user.password)

    if (compare) {
        const token = genrateToken(user._id.toString());
        user.token = token;
        await user.save();
        res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000, sameSite: "none", secure: true });
        res.status(200).json({
            user
        });
    }
    else {
        res.status(404).json('Password or email is incorrect');
    }

}

const findUser = async (req, res) => {
    const search = req.query.q;
    try {
        const users = await User.find({
            name: { $regex: search, $options: 'i' },

        }

        );
        res.status(200).json(users);
    }
    catch (err) {
        res.status(400).send(err);
    }
}

const updateuser = async (req, res) => {
    const { name, email, bio, pic } = req.body;
    const user = await User.findOne({email});
    try {
        const updateduser = await User.findByIdAndUpdate(user._id, { name, email, bio, pic }, { new: true });
        updateduser.save();
        res.status(200).json(updateduser);
    }
    catch (err) {
        res.status(400).send(err);
    }
}

module.exports = { login, register, findUser, updateuser };