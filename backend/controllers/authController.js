
const User = require('../models/User.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

const registerUser = async (req, res) => {
    const { fullname, email, password, confirmPassword } = req.body;
    try {
        if(!fullname || !email || !password || !confirmPassword){
            return res.status(400).json({message: 'Please provide all the credentials'})
        }

        if(password !== confirmPassword){
            return res.status(400).json({message: "Password doesnot match"})
        }

        const userExists = await User.findOne({ email });

        if (userExists){
            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({ fullname, email, password: hashedPassword });

        res.status(201).json({ 
            message: "Account was created successfully"
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        if(!email || !password){
            return res.status(400).json({message: "Please provide all credentials"})
        }
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({
                message: "User with this email doesnot exist"
            });
        }
        
        const isValidPassword = await bcrypt.compare(password, user.password)
        
        if (!isValidPassword) {
            return res.status(401).json({
                message: "Credentials do not match, please try again"
            });
        }

        return res.status(200).json({
            data: {
                id: user._id,
                fullname: user.fullname,
                email: user.email,
                token: generateToken(user._id)
            },
            message: "You have been logged in successfully"
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



module.exports = { registerUser, loginUser};
