
const User = require('../models/User.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const MemberModel = require('../models/Member.model');
const BaseController = require('.');

class AuthController extends BaseController{
    constructor(){
        super();
        this.registerUser = this.handleAsync(this.registerUser.bind(this));
        this.loginUser = this.handleAsync(this.loginUser.bind(this));
        this.getProfile = this.handleAsync(this.getProfile.bind(this));
    }

    validateRequestBody(data, action=""){
        if(action == "REGISTER"){
            if(!data.fullname || !data.email || !data.password || !data.confirmPassword){
                return 'Please provide all the credentials'
            }
            if(data.password !== data.confirmPassword){
                return "Password doesnot match"
            }
        }
        if(action == "LOGIN"){
            if(!data.email || !data.password){
                return "Please provide all credentials"
            }
        }
        return null
    }

    generateToken = (id) => {
        return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
    };

    async registerUser(req, res) {
        const validationError = this.validateRequestBody(req.body, "REGISTER");

        if (validationError) {
            return this.sendError(res, validationError, 400);
        }

        const { fullname, email, password, confirmPassword } = req.body;

        const userExists = await User.findOne({ email });

        if (userExists){
            return this.sendError(res, 'User already exists', 400)
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({ fullname, email, password: hashedPassword });

        return this.sendSuccess(res, "Account was created successfully", 201)
    }

    async loginUser(req, res){
        const validationError = this.validateRequestBody(req.body, "LOGIN");

        if (validationError) {
            return this.sendError(res, validationError, 400);
        }

        const { email, password } = req.body;
        
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
    }

    async getProfile(req, res){
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
    }
}



module.exports = new AuthController;
