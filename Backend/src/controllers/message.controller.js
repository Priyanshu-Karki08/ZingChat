import User from "../models/user.model.js";
import cloudinary from "../lib/cloudinary.js"
import Message from "../models/message.model.js"
import { getReceiverSocketId } from "../lib/socket.js";
import { io } from "../lib/socket.js";

export const getUsersForSidebar = async (req,res) => {
    try{
        const {loggedInUserId} = req.user._id;
        const filteredUser = await User.find({_id : {$ne : loggedInUserId}}).select("-password");

        return res.status(200).json(filteredUser);

    }catch(error){
        console.log(`Error in User SideBar : ${error}`)
        return res.status(500).json({message : "Internal Server Error."})
    }
}

export const getMessages = async (req,res) => {
    try {
        const {id:userToChatId} = req.params;
        const myId = req.user?._id;

        if(!userToChatId){
            return res.status(400).json({message : "Missing userTochatId."})
        }

        if(!myId){
            return res.status(400).json({message : "Missing myId."})
        }

        const message = await Message.find(
            {
                $or : [
                    {senderId : myId,receiverId:userToChatId},
                    {senderId : userToChatId,receiverId : myId}
                ]
            }
        )

        return res.status(200).json(message);
        
    } catch (error) {
        console.log(`Error in Getting Messages : ${error}`)
        return res.status(500).json({message : "Internal Server Error."})
    }
}

export const sendMessage = async (req,res) => {
    try {
        const {text,image} = req.body;
        const{id:receiverId} = req.params;
        const senderId = req.user._id;

        let imageURL;
        if(image){
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageURL = uploadResponse.secure_url;
        }

        const newMessage = new Message({
            senderId,
            receiverId,
            text,
            image : imageURL
        })

        await newMessage.save();

        //real time communication using socket.io
        const receiverSocketId = getReceiverSocketId(receiverId)
        if(receiverSocketId){
            io.to(receiverSocketId).emit("newMessage",newMessage)
        }

        return res.status(201).json(newMessage)
        
    } catch (error) {
        console.log(`Error in Sending Messages : ${error}`)
        return res.status(500).json({message : "Internal Server Error."})
    }
}