
const User = require('../models/User.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const MemberModel = require('../models/Member.model');
const BaseController = require('.');

class AuthController extends BaseController{
    constructor(){
        super();
        this.registerUser = this.registerUser.bind(this);
        this.loginUser = this.loginUser.bind(this);
        this.getProfile = this.getProfile.bind(this);
    }
    
    generateToken = (id) => {
        return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
    };

    async registerUser(req, res) {
        const { fullname, email, password, confirmPassword } = req.body;
        try {
            if(!fullname || !email || !password || !confirmPassword){
                return this.sendError(res, 'Please provide all the credentials', 400)
            }

            if(password !== confirmPassword){
                return this.sendError(res,"Password doesnot match", 400 )
            }

            const userExists = await User.findOne({ email });

            if (userExists){
                return this.sendError(res, 'User already exists', 400)
            }

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            const user = await User.create({ fullname, email, password: hashedPassword });

            this.sendSuccess(res, "Account was created successfully", 201)
        } catch (error) {
            this.sendError(res, error.message)
        }
    }

    async loginUser(req, res){
        const { email, password } = req.body;
        try {
            if(!email || !password){
                return this.sendError(res, "Please provide all credentials", 400)
            }
            const user = await User.findOne({ email });

            if (!user) {
                return this.sendError(res, "User with this email doesnot exist", 401)
            }
            
            const isValidPassword = await bcrypt.compare(password, user.password)
            
            if (!isValidPassword) {
                return this.sendError(res, "Credentials do not match, please try again", 401)
            }

            return this.sendSuccess(
                res,
                {
                    id: user._id,
                    fullname: user.fullname,
                    email: user.email,
                    token: this.generateToken(user._id)
                },
                "You have been logged in successfully",
                200
            )
        } catch (error) {
            return this.sendError(res, error.message)
        }
    }

    async getProfile(req, res){
        try {
            const user = await User.findById(req.user.id);
            if (!user) {
                return this.sendError(res, "User not found", 400)
            }

            const membership = await MemberModel.findOne({
                user: req.user.id,
                status: "active"
            }).populate("household");

            return this.sendSuccess(res,
                {
                    user: req.user,
                    household: membership ? membership.household : null,
                    role: membership ? membership.role : null,
                    hasHousehold: !!membership,
                    isNewUser: !membership,
                },
                "User profile fetched successfully", 200
            )
        } catch (error) {
            return this.sendError(res, error.message)
        }  
    }
}



module.exports = new AuthController;
