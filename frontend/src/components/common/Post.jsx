import React, { useState } from 'react';
import { FaRegHeart, FaTrash } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import LoadingSpinner from "./LoadingSpinner";
import { formatPostDate } from '../../utils/date';

const Post = ({ post }) => {
  const [adaptEdit, setAdaptEdit] = useState("");
  const [adaptNext, setAdaptNext] = useState("");
  const [activeSection, setActiveSection] = useState(null); // null, 'adaptEdit', or 'adaptNext'
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
        throw new Error(error.message);
      }
    },
    onMutate: async () => {
      // Cancel any outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: ["posts"] });
  
      // Get the current state of all post queries
      const previousPosts = queryClient.getQueriesData({ queryKey: ["posts"] });
  
      // Optimistically update all post queries
      queryClient.setQueriesData({ queryKey: ["posts"] }, (old) => {
        if (!old) return old;
        if (!Array.isArray(old)) return old;
  
        return old.map((p) => {
          if (p._id === post._id) {
            const isLiked = p.likes.includes(authUser._id);
            return {
              ...p,
              likes: isLiked
                ? p.likes.filter((id) => id !== authUser._id)
                : [...p.likes, authUser._id],
            };
          }
          return p;
        });
      });
  
      // Return previous posts to roll back if something goes wrong
      return { previousPosts };
    },
    onError: (error, variables, context) => {
      // Roll back all post queries to their previous values
      context.previousPosts.forEach(([queryKey, previousValue]) => {
        queryClient.setQueryData(queryKey, previousValue);
      });
      toast.error(error.message);
    },
    onSuccess: (data) => {
      // Update all post queries with the actual server response
      queryClient.setQueriesData({ queryKey: ["posts"] }, (old) => {
        if (!old) return old;
        if (!Array.isArray(old)) return old;
  
        return old.map((p) => {
          if (p._id === post._id) {
            return {
              ...p,
              likes: Array.isArray(data) ? data : data.likes || [],
            };
          }
          return p;
        });
      });
    },
    // Always refetch after error or success to ensure data consistency
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
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

  const { mutate: adaptEditPost, isPending: isAdaptingEdit } = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/posts/adaptEdit/${post._id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          text: adaptEdit.trim() 
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Something went wrong");
      }
      return data;
    },
    onMutate: async () => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["posts"] });

      // Snapshot current data
      const previousPosts = queryClient.getQueryData(["posts"]);

      // Optimistically update posts
      queryClient.setQueryData(["posts"], (old) => {
        if (!old) return old;
        return old.map((p) => {
          if (p._id === post._id) {
            const optimisticAdaptEdit = {
              _id: Date.now().toString(), // temporary ID
              text: adaptEdit.trim(),
              user: authUser,
              createdAt: new Date().toISOString(),
              likes: []
            };
            return {
              ...p,
              adaptEdits: [...(p.adaptEdits || []), optimisticAdaptEdit]
            };
          }
          return p;
        });
      });

      return { previousPosts };
    },
    onError: (err, newAdaptEdit, context) => {
      queryClient.setQueryData(["posts"], context.previousPosts);
      toast.error(err.message);
    },
    onSuccess: (newAdaptEdit) => {
      queryClient.setQueryData(["posts"], (old) => {
        if (!old) return old;
        return old.map((p) => {
          if (p._id === post._id) {
            const updatedAdaptEdits = p.adaptEdits.map((edit) => {
              // Replace our optimistic adaptEdit with the real one
              if (!edit._id.includes('-')) return edit;
              return newAdaptEdit;
            });
            return {
              ...p,
              adaptEdits: updatedAdaptEdits
            };
          }
          return p;
        });
      });
      setAdaptEdit("");
      toast.success("AdaptEdit posted successfully");
    },
    onSettled: () => {
      // Always refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    }
  });

  const { mutate: adaptNextPost, isPending: isAdaptingNext } = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/posts/adaptNext/${post._id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          text: adaptNext.trim() 
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Something went wrong");
      }
      return data;
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["posts"] });

      const previousPosts = queryClient.getQueryData(["posts"]);

      queryClient.setQueryData(["posts"], (old) => {
        if (!old) return old;
        return old.map((p) => {
          if (p._id === post._id) {
            const optimisticAdaptNext = {
              _id: Date.now().toString(), // temporary ID
              text: adaptNext.trim(),
              user: authUser,
              createdAt: new Date().toISOString(),
              likes: []
            };
            return {
              ...p,
              adaptNexts: [...(p.adaptNexts || []), optimisticAdaptNext]
            };
          }
          return p;
        });
      });

      return { previousPosts };
    },
    onError: (err, newAdaptNext, context) => {
      queryClient.setQueryData(["posts"], context.previousPosts);
      toast.error(err.message);
    },
    onSuccess: (newAdaptNext) => {
      queryClient.setQueryData(["posts"], (old) => {
        if (!old) return old;
        return old.map((p) => {
          if (p._id === post._id) {
            const updatedAdaptNexts = p.adaptNexts.map((next) => {
              // Replace our optimistic adaptNext with the real one
              if (!next._id.includes('-')) return next;
              return newAdaptNext;
            });
            return {
              ...p,
              adaptNexts: updatedAdaptNexts
            };
          }
          return p;
        });
      });
      setAdaptNext("");
      toast.success("AdaptNext posted successfully");
    },
    onSettled: () => {
      // Always refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    }
  });


  const handleLikePost = () => {
    if (isLikingPost) return;
    likePost();
  };

  const handlePostAdaptEdit = (e) => {
    e.preventDefault();
    if (!adaptEdit.trim()) {
      toast.error("Please enter some text");
      return;
    }
    if (isAdaptingEdit) return;
    adaptEditPost();
  };

  const handlePostAdaptNext = (e) => {
    e.preventDefault();
    if (!adaptNext.trim()) {
      toast.error("Please enter some text");
      return;
    }
    if (isAdaptingNext) return;
    adaptNextPost();
  };

  const handleAdaptEditClick = () => {
    setActiveSection(activeSection === 'adaptEdit' ? null : 'adaptEdit');
  };

  const handleAdaptNextClick = () => {
    setActiveSection(activeSection === 'adaptNext' ? null : 'adaptNext');
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
      <div className="flex gap-2 items-start p-4">
        <div className="avatar">
          <AvatarImage src={post.user.profileImg} username={post.user.username} />
        </div>
        
        <div className="flex flex-col flex-1">
          <div className="flex gap-2 items-center justify-between">
            <div className="flex gap-2 items-center">
              <Link to={`/profile/${post.user.username}`} className="font-bold">
                {post.user.fullName}
              </Link>
              <span className="text-gray-700 flex gap-1 text-sm">
                <Link to={`/profile/${post.user.username}`}>@{post.user.username}</Link> 
                · <span>{formatPostDate(post.createdAt)}</span>
              </span>
            </div>
            
            {/* Add delete button if the post belongs to the current user */}
            {post.user._id === authUser._id && (
              <button
                onClick={() => deletePost()}
                disabled={isDeleting}
                className="text-gray-500 hover:text-red-500"
              >
                {isDeleting ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <FaTrash className="w-3 h-3" />
                )}
              </button>
            )}
          </div>

          <div className="mt-2">
            <span>{post.text}</span>
          </div>

          <div className="flex gap-8 items-center mt-3">
            <button
              className={`flex items-center gap-1 text-sm ${
                activeSection === 'adaptEdit' ? 'text-sky-400' : 'text-gray-500 hover:text-sky-400'
              }`}
              onClick={handleAdaptEditClick}
            >
              Adapt Edit
              <span>{post.adaptEdits.length}</span>
            </button>

            <button
              className={`flex items-center gap-1 text-sm ${
                activeSection === 'adaptNext' ? 'text-green-500' : 'text-gray-500 hover:text-green-500'
              }`}
              onClick={handleAdaptNextClick}
            >
              Adapt Next
              <span>{post.adaptNexts?.length || 0}</span>
            </button>

            <LikeButton 
              isLiking={isLikingPost}
              isLiked={post.likes.includes(authUser._id)}
              likes={post.likes}
              onClick={handleLikePost}
            />
          </div>
        </div>
      </div>

      {/* AdaptEdit Section */}
      {activeSection === 'adaptEdit' && (
        <div className="px-4 pb-4">
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
                required
              />
              <div className="flex justify-end mt-2">
                <button 
                  className="bg-sky-500 hover:bg-sky-600 text-white px-4 py-1 rounded-full text-sm font-medium disabled:opacity-50"
                  type="submit"
                  disabled={isAdaptingEdit || !adaptEdit.trim()}
                >
                  {isAdaptingEdit ? <LoadingSpinner size="sm" /> : "AdaptEdit"}
                </button>
              </div>
            </div>
          </form>

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
                      @{edit.user.username} · {formatPostDate(edit.createdAt)}
                    </span>
                  </div>
                  
                  <p className="text-sm mt-1">{edit.text}</p>
                  <div className="flex gap-4 mt-2">
                    <LikeButton 
                      isLiking={isLikingAdaptEdit}
                      isLiked={edit.likes?.includes(authUser._id)}
                      likes={edit.likes || []}
                      onClick={() => handleLikeAdaptEdit(edit._id)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AdaptNext Section */}
      {activeSection === 'adaptNext' && (
        <div className="px-4 pb-4 border-t border-gray-700">
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
                required
              />
              <div className="flex justify-end mt-2">
                <button 
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-1 rounded-full text-sm font-medium disabled:opacity-50"
                  type="submit"
                  disabled={isAdaptingNext || !adaptNext.trim()}
                >
                  {isAdaptingNext ? <LoadingSpinner size="sm" /> : "AdaptNext"}
                </button>
              </div>
            </div>
          </form>

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
                      @{next.user.username} · {formatPostDate(next.createdAt)}
                    </span>
                  </div>
                 
                  <p className="text-sm mt-1">{next.text}</p>
                  <div className="flex gap-4 mt-2">
                    <LikeButton 
                      isLiking={isLikingAdaptNext}
                      isLiked={next.likes?.includes(authUser._id)}
                      likes={next.likes || []}
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