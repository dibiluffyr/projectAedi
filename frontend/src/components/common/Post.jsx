import React, { useState } from 'react';
import { FaRegComment, FaRegHeart, FaTrash } from "react-icons/fa";
import { BiRepost } from "react-icons/bi";
import { FaRegBookmark } from "react-icons/fa6";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import LoadingSpinner from "./LoadingSpinner";

const Post = ({ post }) => {
  const [adaptEdit, setAdaptEdit] = useState("");
  const [adaptNext, setAdaptNext] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [showAdaptNext, setShowAdaptNext] = useState(false);
  const { data: authUser } = useQuery({ queryKey: ["authUser"] });
  const queryClient = useQueryClient();

  const { mutate: deletePost, isPending: isDeleting } = useMutation({
    mutationFn: async () => {
      try {
        const res = await fetch(`/api/posts/${post._id}`, {
          method: "DELETE",
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Something went wrong");
        }
        return data;
      } catch (error) {
        throw new Error(error);
      }
    },
    onSuccess: () => {
      toast.success("Post deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    }
  });

  const { mutate: likePost, isPending: isLikingPost } = useMutation({
    mutationFn: async () => {
      try {
        const res = await fetch(`/api/posts/like/${post._id}`, {
          method: "POST",
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Something went wrong");
        }
        return data;
      } catch (error) {
        throw new Error(error);
      }
    },
    onSuccess: (updatedLikes) => {
      queryClient.setQueryData(["posts"], (oldData) => {
        return oldData.map((p) => {
          if (p._id === post._id) {
            return { ...p, likes: updatedLikes || [] };  // Ensure likes is an array
          }
          return p;
        });
      });
      toast.success("Post liked successfully");
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  const { mutate: likeAdaptEdit, isPending: isLikingAdaptEdit } = useMutation({
    mutationFn: async (adaptEditId) => {
      try {
        const res = await fetch(`/api/posts/adaptEdit/like/${adaptEditId}`, {
          method: "POST",
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Something went wrong");
        }
        return data;
      } catch (error) {
        throw new Error(error);
      }
    },
    onSuccess: (updatedLikes, adaptEditId) => {
      queryClient.setQueryData(["posts"], (oldData) => {
        return oldData.map((p) => {
          if (p._id === post._id) {
            const updatedAdaptEdits = p.adaptEdits.map((edit) => {
              if (edit._id === adaptEditId) {
                return { ...edit, likes: updatedLikes };
              }
              return edit;
            });
            return { ...p, adaptEdits: updatedAdaptEdits };
          }
          return p;
        });
      });
      toast.success("AdaptEdit liked successfully");
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  const { mutate: likeAdaptNext, isPending: isLikingAdaptNext } = useMutation({
    mutationFn: async (adaptNextId) => {
      try {
        const res = await fetch(`/api/posts/adaptNext/like/${adaptNextId}`, {
          method: "POST",
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Something went wrong");
        }
        return data;
      } catch (error) {
        throw new Error(error);
      }
    },
    onSuccess: (updatedLikes, adaptNextId) => {
      queryClient.setQueryData(["posts"], (oldData) => {
        return oldData.map((p) => {
          if (p._id === post._id) {
            const updatedAdaptNexts = p.adaptNexts.map((next) => {
              if (next._id === adaptNextId) {
                return { ...next, likes: updatedLikes };
              }
              return next;
            });
            return { ...p, adaptNexts: updatedAdaptNexts };
          }
          return p;
        });
      });
      toast.success("AdaptNext liked successfully");
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  const handleLikePost = () => {
    if (isLikingPost) return;
    likePost();
  };

  const handlePostAdaptEdit = (e) => {
    e.preventDefault();
    // Add your adaptEdit posting logic here
    setAdaptEdit("");
  };

  const handlePostAdaptNext = (e) => {
    e.preventDefault();
    // Add your adaptNext posting logic here
    setAdaptNext("");
  };

  const handleLikeAdaptEdit = (adaptEditId) => {
    if (isLikingAdaptEdit) return;
    likeAdaptEdit(adaptEditId);
  };

  const handleLikeAdaptNext = (adaptNextId) => {
    if (isLikingAdaptNext) return;
    likeAdaptNext(adaptNextId);
  };

  const AvatarImage = ({ src, username }) => (
    <Link to={`/profile/${username}`} className="w-8 h-8 rounded-full overflow-hidden">
      <div className="w-full h-full">
        <img 
          src={src || "/avatar-placeholder.png"} 
          alt="Profile" 
          className="w-full h-full object-cover"
        />
      </div>
    </Link>
  );

  const LikeButton = ({ isLiking, isLiked, likes, onClick }) => {
    // Ensure likes is always an array
    const likesArray = Array.isArray(likes) ? likes : [];
    
    return (
      <button 
        className="flex items-center gap-1 text-gray-500 hover:text-pink-500 text-sm"
        onClick={onClick}
        disabled={isLiking}
      >
        {isLiking && <LoadingSpinner size="sm" />}
        {!isLiked && !isLiking && (
          <FaRegHeart className="w-3 h-3 cursor-pointer text-slate-500 group-hover:text-pink-500" />
        )}
        {isLiked && !isLiking && (
          <FaRegHeart className="w-3 h-3 cursor-pointer text-pink-500" />
        )}
        <span className={`${isLiked ? "text-pink-500" : "text-slate-500"} group-hover:text-pink-500`}>
          {post.likes.length}
        </span>
      </button>
    );
  };

  return (
    <div className="flex flex-col border-b border-gray-700">
      {/* Main Post */}
      <div className="flex gap-2 items-start p-4">
        <div className="avatar">
          <AvatarImage src={post.user.profileImg} username={post.user.username} />
        </div>
        
        <div className="flex flex-col flex-1">
          {/* Post Header */}
          <div className="flex gap-2 items-center">
            <Link to={`/profile/${post.user.username}`} className="font-bold">
              {post.user.fullName}
            </Link>
            <span className="text-gray-700 flex gap-1 text-sm">
              <Link to={`/profile/${post.user.username}`}>@{post.user.username}</Link> 
              <span>{post.formattedDate}</span>
            </span>
            {authUser._id === post.user._id && (
              <span className="flex justify-end flex-1">
                {!isDeleting ? (
                  <FaTrash 
                    className="cursor-pointer hover:text-red-500" 
                    onClick={() => deletePost()}
                  />
                ) : (
                  <LoadingSpinner size="sm" />
                )}
              </span>
            )}
          </div>

          {/* Post Content */}
          <div className="mt-2">
            <span>{post.text}</span>
          </div>

          {/* Post Actions */}
          <div className="flex justify-between mt-3">
            <div className="flex gap-8 items-center">
              <div 
                className="flex gap-1 items-center cursor-pointer group"
                onClick={() => setShowComments(!showComments)}
              >
                <FaRegComment className="w-4 h-4 text-slate-500 group-hover:text-sky-400" />
                <span className="text-sm text-slate-500 group-hover:text-sky-400">
                  {post.adaptEdits.length}
                </span>
              </div>
              <div 
                className="flex gap-1 items-center group cursor-pointer"
                onClick={() => setShowAdaptNext(!showAdaptNext)}
              >
                <BiRepost className="w-6 h-6 text-slate-500 group-hover:text-green-500" />
                <span className="text-sm text-slate-500 group-hover:text-green-500">
                  {post.adaptNexts?.length || 0}
                </span>
              </div>

              <LikeButton 
                isLiking={isLikingPost}
                isLiked={post.likes.includes(authUser._id)}
                likes={post.likes}
                onClick={handleLikePost}
              />
              <FaRegBookmark className="w-4 h-4 text-slate-500 cursor-pointer" />
            </div>
          </div>
        </div>
      </div>

      {/* AdaptEdit Section */}
      {showComments && (
        <div className="px-4 pb-4">
          {/* AdaptEdit Input */}
          <form onSubmit={handlePostAdaptEdit} className="flex gap-2 items-start mb-4 ml-10">
            <div className="avatar">
              <AvatarImage src={authUser.profileImg} username={authUser.username} />
            </div>
            <div className="flex-1">
              <textarea
                className="w-full bg-transparent border border-gray-700 rounded-lg p-2 text-sm resize-none focus:outline-none focus:border-sky-500"
                placeholder="Post your adaptEdit"
                value={adaptEdit}
                onChange={(e) => setAdaptEdit(e.target.value)}
                rows="2"
              />
              <div className="flex justify-end mt-2">
                <button 
                  className="bg-sky-500 hover:bg-sky-600 text-white px-4 py-1 rounded-full text-sm font-medium"
                  type="submit"
                >
                  AdaptEdit
                </button>
              </div>
            </div>
          </form>

          {/* AdaptEdits List */}
          <div className="flex flex-col gap-4">
            {post.adaptEdits.map((edit) => (
              <div key={edit._id} className="flex gap-2 ml-10">
                <div className="avatar">
                  <AvatarImage src={edit.user.profileImg} username={edit.user.username} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-1">
                    <Link 
                      to={`/profile/${edit.user.username}`} 
                      className="font-bold hover:underline"
                    >
                      {edit.user.fullName}
                    </Link>
                    <span className="text-gray-500 text-sm">
                      @{edit.user.username}
                    </span>
                  </div>
                  <p className="text-sm mt-1">{edit.text}</p>
                  <div className="flex gap-4 mt-2">
                    <LikeButton 
                      isLiking={isLikingPost}
                      isLiked={Array.isArray(post.likes) && post.likes.includes(authUser._id)}
                      likes={post.likes || []}  // Provide empty array as fallback
                      onClick={handleLikePost}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AdaptNext Section */}
      {showAdaptNext && (
        <div className="px-4 pb-4 border-t border-gray-700">
          {/* AdaptNext Input */}
          <form onSubmit={handlePostAdaptNext} className="flex gap-2 items-start mb-4 ml-10">
            <div className="avatar">
              <AvatarImage src={authUser.profileImg} username={authUser.username} />
            </div>
            <div className="flex-1">
              <textarea
                className="w-full bg-transparent border border-gray-700 rounded-lg p-2 text-sm resize-none focus:outline-none focus:border-sky-500"
                placeholder="Post your adaptNext"
                value={adaptNext}
                onChange={(e) => setAdaptNext(e.target.value)}
                rows="2"
              />
              <div className="flex justify-end mt-2">
                <button 
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-1 rounded-full text-sm font-medium"
                  type="submit"
                >
                  AdaptNext
                </button>
              </div>
            </div>
          </form>

          {/* AdaptNexts List */}
          <div className="flex flex-col gap-4">
            {post.adaptNexts?.map((next) => (
              <div key={next._id} className="flex gap-2 ml-10">
                <div className="avatar">
                  <AvatarImage src={next.user.profileImg} username={next.user.username} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-1">
                    <Link 
                      to={`/profile/${next.user.username}`} 
                      className="font-bold hover:underline"
                    >
                      {next.user.fullName}
                    </Link>
                    <span className="text-gray-500 text-sm">
                      @{next.user.username}
                    </span>
                  </div>
                  <p className="text-sm mt-1">{next.text}</p>
                  <div className="flex gap-4 mt-2">
                    <LikeButton 
                      isLiking={isLikingAdaptNext}
                      isLiked={next.likes?.includes(authUser._id)}
                      likes={next.likes}
                      onClick={() => handleLikeAdaptNext(next._id)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Post;