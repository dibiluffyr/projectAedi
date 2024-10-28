import Notification from "../models/notification.model.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { v2  as cloudinary} from "cloudinary";




export const getUserProfile = async (req, res) => {
    
    const { username } = req.params;

    try {
        const user = await User.findOne({username}).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json(user);

    } catch (error) {
        console.log("Error in getUserProfile",  error.message);
        res.status(500).json({ error: "Internal Server Error" });


    }
}

export const followUnfollowUser = async (req, res) => {
    try {
        const { id }  = req.params;
        const userToModify = await User.findById(id);
        const currentUser = await User.findById(req.user._id);

        if (id === req.user._id.toString()) {
            return res.status(400).json({ message: "You cannot follow yourself" });
        }

        if (!userToModify || !currentUser) {
            return res.status(400).json({ error: "User not found" });
        }

        const isFollowing = currentUser.following.includes(id);

        if (isFollowing) {
            await User.findByIdAndUpdate(id, { $pull: { followers: req.user._id }});
            await User.findByIdAndUpdate(req.user._id, { $pull: { following: id }});
            
            res.status(200).json({  message: "Unfollowed" });

        } else {
            await User.findByIdAndUpdate(id, { $push: { followers: req.user._id }});
            await User.findByIdAndUpdate(req.user._id, { $push: { following: id }});

            const newNotification = new Notification({
                type: "follow",
                from: req.user._id,
                to: userToModify._id,
            });
            await newNotification.save();

            res.status(200).json( { message:  "Followed" });
        }

        

    } catch (error) {
        console.log("Error in followUnfollowUser", error.message);
        res.status(500).json({ error: "Internal Server Error" });

    }
}

export const getSuggestedUsers = async (req, res) => {
    try {
        const userId = req.user._id;

        const usersFollowedByMe = await User.findById(userId).select('following');

        const users = await User.aggregate([
            {
                $match: { 
                     _id: {$ne:userId} 
                } 
            },
            {$sample:{size:10}}
        ])

        const filteredUsers = users.filter(user=>!usersFollowedByMe.following.includes(user._id))
        const  suggestedUsers = filteredUsers.splice(0, 4);

        suggestedUsers.forEach(user=>user.password=null);

        res.status(200).json(suggestedUsers);

    } catch (error) {
        console.log("Error in getSuggestedUsers: ", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

export const updateUser = async (req, res) => {
    const { username, email, currentPassword, newPassword } = req.body;
    let { profileImg } = req.body;

    const userId = req.user._id;

    try {

        let user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if((!newPassword &&  currentPassword) || (newPassword && !currentPassword)){
            return res.status(400).json({ message: "Please enter both current and new password"});
        }

        if (currentPassword  && newPassword) {
            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if (!isMatch) {
                return res.status(400).json({ message: "Current password does not match" });
            }
            const passwordFormat = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+[\]{};':"\\|,.<>\/?~`-])[A-Za-z\d!@#$%^&*()_+[\]{};':"\\|,.<>\/?~`-]{8,}$/;
            if (!passwordFormat.test(newPassword)) {
                return res.status(400).json({ message: "Password must be at least 8 characters with 1 uppercase, 1 lowercase, 1 number, and 1 special character" });
            }
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(newPassword, salt);
        }

        if (profileImg) {
            if (user.profileImg) {
                await cloudinary.uploader.destroy(user.profileImg.split("/").pop().split(".")[0]);
            }

            const uploadedResponse = await cloudinary.uploader.upload(profileImg);
            profileImg = uploadedResponse.secure_url;
        }

        user.username = username ||  user.username;
        user.email = email || user.email;
        user.profileImg = profileImg || user.profileImg;

        user = await user.save();

        user.password = null;

        return res.status(200).json(user);

    } catch (error) {
        console.log("Error in updateUser", error.message);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}