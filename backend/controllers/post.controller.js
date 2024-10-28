import User from "../models/user.model.js";
import Post from  "../models/post.model.js";
import Notification from "../models/notification.model.js";


export const createPost = async (req, res) => {
    try {
        const { text } = req.body;
        const userId = req.user._id.toString();

        const user = await User.findById(userId);

        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        if (!text) {
            return res.status(400).json({ message: "Post must have text" });
        }

        const newPost = new Post({
            user: userId,
            text,
        });

        await newPost.save();
        res.status(201).json(newPost);
    } catch (error) {
        console.log("Error in createPost", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export const deletePost = async (req, res) => {
    try {
        const post = await  Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ error:  "Post not found" });
        }

        if (post.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ error: "You are not authorized to delete this post" });
        }

        await Post.findByIdAndDelete(req.params.id);

        res.status(200).json({ message: "Post deleted successfully" });
    } catch (error) {
        console.log("Error in deletePost", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export const adaptEditPost = async (req, res) => {
    try {
      const { text } = req.body;
      const postId = req.params.id;
      const userId = req.user._id;
  
      if (!text) {
        return res.status(400).json({ message: "Post must have text" });
      }
  
      const post = await Post.findById(postId);
      if (!post) {
        return res.status(404).json({ error: "Post not found" });
      }
  
      const adaptEdit = {
        user: userId,
        text,
      };
  
      post.adaptEdits.push(adaptEdit);
      await User.updateOne({ _id: userId }, { $push: { adaptEdited: postId } });
      
      const notification = new Notification({
        from: userId,
        to: post.user,
        type: 'adaptEdit'
      });

      await notification.save();
      await post.save();
  
      res.status(200).json(post);
    } catch (error) {
      console.log("Error in adaptEditPost", error.message);
      res.status(500).json({ message: "Internal Server Error" });
    }
  };
  
export const adaptNextPost = async (req, res) => {
    try {
      const { text } = req.body;
      const postId = req.params.id;
      const userId = req.user._id;
  
      if (!text) {
        return res.status(400).json({ message: "Post must have text" });
      }
  
      const post = await Post.findById(postId);
      if (!post) {
        return res.status(404).json({ error: "Post not found" });
      }
  
      const adaptNext = {
        user: userId,
        text,
      };
  
      post.adaptNexts.push(adaptNext);
      await User.updateOne({ _id: userId }, { $push: { adaptNexts: postId } });

      const notification = new Notification({
        from: userId,
        to: post.user,
        type: 'adaptNext'
      });

      await notification.save();
  
      await post.save();
  
      res.status(200).json(post);
    } catch (error) {
      console.log("Error in adaptNextPost", error.message);
      res.status(500).json({ message: "Internal Server Error" });
    }
};

export const likeUnlikePost = async (req, res) => {
    try {
        const userId = req.user._id;
        const { id:postId } = req.params;

        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({ error: "Post not Found" });
        }

        const userLikedPost = post.likes.includes(userId);

        if (userLikedPost) {
            await Post.updateOne({ _id: postId }, { $pull: { likes: userId }} );
            await User.updateOne({ _id: userId }, { $pull: { likedPosts: postId }} );

            const updatedLikes = post.likes.filter((id) => id.toString() !== userId.toString());
            res.status(200).json(updatedLikes);
        } else {

            post.likes.push(userId);
            await User.updateOne({ _id: userId }, { $push: { likedPosts: postId } });
            await post.save();
            
            const notification = new Notification({
                from: userId,
                to: post.user,
                type: 'like'
            });

            await notification.save();

            const updatedLikes = post.likes;
            res.status(200).json(updatedLikes);
        }

    } catch (error) {
        console.log("Error in likeUnlikePost", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export const getAllPost = async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 }).populate({
      path: "user",
      select: "-password",
    })
    .populate({
      path: "adaptEdits.user",
      select: "-password",
    })
    .populate({
      path: "adaptNexts.user",
      select: "-password",
    });

    if (posts.length === 0) {
      return res.status(200).json([]);
    }

    res.status(200).json(posts);
  } catch (error) {
    console.log("Error in getAllPost", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export const getAdaptEdit = async (req, res) => {
  const adaptEditId = req.params.id;

  try {
    const post = await Post.findOne({
      adaptEdits: { $elemMatch: { _id: adaptEditId } }
    });

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const adaptEdit = post.adaptEdits.find((adaptEdit) => adaptEdit._id.toString() === adaptEditId);

    if (!adaptEdit) {
      return res.status(404).json({ error: "AdaptEdit not found" });
    }

    res.status(200).json(adaptEdit);
  } catch (error) {
    console.log("Error in getAdaptEdit", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export const getAdaptNext = async (req, res) => {
  const adaptNextId = req.params.id;

  try {
    const post = await Post.findOne({
      adaptNexts: { $elemMatch: { _id: adaptNextId } }
    });

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const adaptNext = post.adaptNexts.find((adaptNext) => adaptNext._id.toString() === adaptNextId);

    if (!adaptNext) {
      return res.status(404).json({ error: "AdaptEdit not found" });
    }

    res.status(200).json(adaptNext);
  } catch (error) {
    console.log("Error in getAdaptEdit", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export const deleteAdaptEdit = async (req, res) => {
  const adaptEditId = req.params.id;

  try {
    const post = await Post.findOne({
      adaptEdits: { $elemMatch: { _id: adaptEditId } }
    });

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const adaptEditIndex = post.adaptEdits.findIndex((adaptEdit) => adaptEdit._id.toString() === adaptEditId);

    if (adaptEditIndex === -1) {
      return res.status(404).json({ error: "AdaptEdit not found" });
    }

    // Remove the adaptEdit object from the post
    post.adaptEdits.splice(adaptEditIndex, 1);

    // Save the updated post
    await post.save();

    res.status(200).json({ message: "AdaptEdit deleted successfully" });
  } catch (error) {
    console.log("Error in deleteAdaptEdit", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export const deleteAdaptNext = async (req, res) => {
  const adaptNextId = req.params.id;

  try {
    const post = await Post.findOne({
      adaptNexts: { $elemMatch: { _id: adaptNextId } }
    });

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const adaptNextIndex = post.adaptNexts.findIndex((adaptNext) => adaptNext._id.toString() === adaptNextId);

    if (adaptNextIndex === -1) {
      return res.status(404).json({ error: "AdaptNext not found" });
    }

    // Remove the adaptEdit object from the post
    post.adaptNexts.splice(adaptNextIndex, 1);

    // Save the updated post
    await post.save();

    res.status(200).json({ message: "AdaptNext deleted successfully" });
  } catch (error) {
    console.log("Error in deleteAdaptNext", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export const getFollowingPosts = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const following = user.following;

    const feedPosts = await Post.find({ user: { $in: following } }).sort({ createdAt: -1 })
    .populate ({
      path: "user",
      select: "-password",
    })
    .populate ({
      path: "adaptEdits.user",
      select: "-password",
    })
    .populate ({
      path: "adaptNexts.user",
      select: "-password",
    }); 

    res.status(200).json(feedPosts);
  } catch (error) {
    console.log("Error in getFollowingPosts", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export const getUserPosts = async (req, res) => {
  try {
    const { username } = req.params;

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const posts = await Post.find({ user: user._id }).sort({ createdAt: -1 })
    .populate ({
      path: "user",
      select: "-password",
    })
    .populate ({
      path: "adaptEdits.user",
      select: "-password",
    })
    .populate ({
      path: "adaptNexts.user",
      select: "-password",
    }); 

    res.status(200).json(posts);

  } catch (error) {
    console.log("Error in getUserPosts", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export const likeUnlikeAdaptEdit = async (req, res) => {
  try {
    const userId = req.user._id;
    const adaptEditId = req.params.id;

    const post = await Post.findOne({
      "adaptEdits._id": adaptEditId
    });

    if (!post) {
      return res.status(404).json({ error: "Post or AdaptEdit not found" });
    }

    const adaptEdit = post.adaptEdits.find(
      (edit) => edit._id.toString() === adaptEditId
    );

    if (!adaptEdit) {
      return res.status(404).json({ error: "AdaptEdit not found" });
    }

    const userLikedAdaptEdit = adaptEdit.likes?.includes(userId);

    if (userLikedAdaptEdit) {
      // Unlike
      adaptEdit.likes = adaptEdit.likes.filter(
        (id) => id.toString() !== userId.toString()
      );
    } else {
      // Like
      if (!adaptEdit.likes) {
        adaptEdit.likes = [];
      }
      adaptEdit.likes.push(userId);

      // Create notification
      const notification = new Notification({
        from: userId,
        to: adaptEdit.user,
        type: 'likeAdaptEdit'
      });
      await notification.save();
    }

    await post.save();
    res.status(200).json(adaptEdit.likes);
  } catch (error) {
    console.log("Error in likeUnlikeAdaptEdit", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const likeUnlikeAdaptNext = async (req, res) => {
  try {
    const userId = req.user._id;
    const adaptNextId = req.params.id;

    const post = await Post.findOne({
      "adaptNexts._id": adaptNextId
    });

    if (!post) {
      return res.status(404).json({ error: "Post or AdaptNext not found" });
    }

    const adaptNext = post.adaptNexts.find(
      (next) => next._id.toString() === adaptNextId
    );

    if (!adaptNext) {
      return res.status(404).json({ error: "AdaptNext not found" });
    }
    const userLikedAdaptNext = adaptNext.likes?.includes(userId);

    if (userLikedAdaptNext) {
      // Unlike
      adaptNext.likes = adaptNext.likes.filter(
        (id) => id.toString() !== userId.toString()
      );
    } else {
      // Like
      if (!adaptNext.likes) {
        adaptNext.likes = [];
      }
      adaptNext.likes.push(userId);

      // Create notification
      const notification = new Notification({
        from: userId,
        to: adaptNext.user,
        type: 'likeAdaptNext'
      });
      await notification.save();
    }

    await post.save();
    res.status(200).json(adaptNext.likes);
  } catch (error) {
    console.log("Error in likeUnlikeAdaptNext", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};