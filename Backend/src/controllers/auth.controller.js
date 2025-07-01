import User from '../models/user.model.js'
import { generateToken } from '../lib/utils.js';
import bcrypt from 'bcryptjs'
import cloudinary from '../lib/cloudinary.js'

export const signup = async (req,res) => {
    const {fullName,email,password} = req.body;
    try{
        if(!fullName){
            return res.status(400).json({message : "fullName is empty"})
        }
        if(!email ){
            return res.status(400).json({message : "Email is empty"})
        }
        if(!password){
            return res.status(400).json({message : "Password is empty"})
        }

        if(password.length < 6){
            return res.status(422).json({message : "Password must be at least 6 characters."})
        }

        const user = await User.findOne({email})
        if(user){
            return res.status(409).json({message : "User already exists."})
        }

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password,salt);

        const newUser = new User({
            email,
            fullName,
            password: hashedPassword
        })

        generateToken(newUser._id,res);
        await newUser.save();

        return res.status(201).json({
            _id : newUser._id,
            fullName : newUser.fullName,
            email : newUser.email,
            profilePic : newUser.profilePic
        })

    }catch(error){
        console.log(`Error in Signup ${error.message}`);
        res.status(500).json({message : "Internal Server Error"});
    }
}

export const login = async (req,res) => {
    const {email,password} = req.body;
    try{
        if(!email){
            return res.status(400).json({message : "Email is empty"})
        }
        if(!password){
            return res.status(400).json({message : "Password is empty"})
        }

        const user = await User.findOne({email});
        if(!user){
            return res.status(404).json({message : "User not Found."})
        }

        const isPasswordCorrect = await bcrypt.compare(password,user.password);
        if(!isPasswordCorrect){
            return res.status(401).json({message : "Invalid Password."})
        }

        generateToken(user._id,res);

        return res.status(200).json({
            _id : user._id,
            fullName : user.fullName,
            email : user.email,
            profilePic : user.profilePic,
        })
    }catch(error){
        console.log(`Error in login : ${error}`);
        return res.status(500).json({message : "Internal Server Error."})
    }
}

export const logout = (req,res) => {
    try{
        res.cookie(
            "jwt",
            "",
            {maxAge : 0}
        )

        return res.status(200).json({
            message : "Logged Out Successfully."
        })

    }catch(error){
        console.log(`Error in logout : ${error}`);
        res.status(500).json({message : "Internal Server Error."})
    }
}

export const updateProfile = async (req,res) => {
    const {profilePic} = req.body;
    try{
        if(!profilePic){
            return res.status(400).json({message : "Profile Pic Not Found."})
        }
        const userId = req.user._id;

        const uploadResponse = await cloudinary.uploader.upload(profilePic);
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                profilePic : uploadResponse.secure_url
            },
            {new : true}
        )

        return res.status(200).json(updatedUser)

    }catch(error){
        console.log(`Error in Update Profile : ${error}`);
        res.status(500).json({message : "Internal Server Error."})
    }
}

export const checkAuth = (req,res) => {
    try {
        return res.status(200).json(req.user)
    } catch (error) {
        console.log(`Error in CheckAuth : ${error}`);
        res.status(500).json({message : "Internal Server Error."})
    }
}