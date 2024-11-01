import React, { useState } from 'react';
import { FaTrash } from "react-icons/fa";
import { BiLike } from "react-icons/bi";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import LoadingSpinner from "./LoadingSpinner";
import { formatPostDate } from '../../utils/date';

const Post = ({ post }) => {
  const [adaptEdit, setAdaptEdit] = useState("");
  const [adaptNext, setAdaptNext] = useState("");
  const [activeSection, setActiveSection] = useState(null);
  const { data: authUser } = useQuery({ queryKey: ["authUser"] });
  const queryClient = useQueryClient();
  const [isExpanded, setIsExpanded] = useState(false);
  

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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
    onError: (error) => {
      toast.error(error.message);
      console.log(error);
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      setAdaptEdit("");
      toast.success("AdaptEdit posted successfully");
    },
    onError: (error) => {
      toast.error(error.message);
      
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
    onSuccess: (newAdaptNext) => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      setAdaptNext("");
      toast.success("AdaptNext posted successfully");
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  const { mutate: deleteAdaptEdit, isPending: isDeletingAdaptEdit } = useMutation({
    mutationFn: async (adaptEditId) => {
      try {
        const res = await fetch(`/api/posts/deleteAe/${adaptEditId}`, {
          method: "DELETE",
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      toast.success("Adapt Edit deleted successfully");
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  const { mutate: deleteAdaptNext, isPending: isDeletingAdaptNext } = useMutation({
    mutationFn: async (adaptNextId) => {
      try {
        const res = await fetch(`/api/posts/deleteAn/${adaptNextId}`, {
          method: "DELETE",
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      toast.success("Adapt Next deleted successfully");
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

  const handleDeleteAdaptEdit = (adaptEditId) => {
    if (isDeletingAdaptEdit) return;
    deleteAdaptEdit(adaptEditId);
  };

  const handleDeleteAdaptNext = (adaptNextId) => {
    if (isDeletingAdaptNext) return;
    deleteAdaptNext(adaptNextId);
  };

  const AvatarImage = ({ src, username }) => (
    <Link to={`/profile/${username}`}>
      <div className="avatar">
        <div className="w-10 h-10 rounded-lg ring ring-primary ring-offset-base-100 ring-offset-2">
          <img src={src || "/avatar-placeholder.png"} alt="Profile" />
        </div>
      </div>
    </Link>
  );

  const formatText = (text) => {
    return text.split('\n').map((line, index) => (
      <React.Fragment key={index}>
        {line}
        {index !== text.split('\n').length - 1 && <br />}
      </React.Fragment>
    ));
  };

  const TruncatedText = ({ text, maxLines = 5 }) => {
    const lines = text.split('\n');
    const needsTruncation = lines.length > maxLines;
    const displayText = isExpanded ? text : lines.slice(0, maxLines).join('\n');

    return (
      <div>
        <p className="text-lg whitespace-pre-line">{displayText}</p>
        {needsTruncation && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-primary hover:text-primary-focus text-sm mt-2 font-medium"
          >
            {isExpanded ? 'See less' : 'See more'}
          </button>
        )}
      </div>
    );
  };


  return (
    
    <div className="card bg-base-200 shadow-xl mb-4 rounded-2xl ">
      <div className="card-body p-4">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="flex gap-4">
            <AvatarImage src={post.user.profileImg} username={post.user.username} />
            <div>
              <Link to={`/profile/${post.user.username}`} className="text-lg font-bold hover:text-primary">
                {post.user.username}
                
              </Link>
              <span className="mx-2 text-sm opacity-70">•</span>
              <span className="text-sm opacity-70">{formatPostDate(post.createdAt)}</span>            
            </div>
          </div>

          {post.user._id === authUser._id && (
            <button
              onClick={() => deletePost()}
              disabled={isDeleting}
              className="btn btn-ghost btn-sm btn-square"
            >
              {isDeleting ? (
                <LoadingSpinner size="sm" />
              ) : (
                <FaTrash className="w-4 h-4 text-error" />
              )}
            </button>
          )}
        </div>
       
        <div className="mt-4 text-base-content">
          <TruncatedText text={post.text} maxLines={5} />
        </div>

        <div className="flex gap-4 mt-4">
          <button
            onClick={handleAdaptEditClick}
            className={`btn btn-sm ${
              activeSection === 'adaptEdit' 
                ? 'btn-primary' 
                : 'btn-ghost hover:btn-primary hover:btn-ghost'
            }`}
          >
            Adapt Edit
            <div className="badge badge-sm">{post.adaptEdits.length}</div>
          </button>

          <button
            onClick={handleAdaptNextClick}
            className={`btn btn-sm ${
              activeSection === 'adaptNext' 
                ? 'btn-accent' 
                : 'btn-ghost hover:btn-accent hover:btn-ghost'
            }`}
          >
            Adapt Next
            <div className="badge badge-sm">{post.adaptNexts?.length || 0}</div>
          </button>

          <div 
            className='flex gap-1 items-center group cursor-pointer' 
            onClick={handleLikePost}
          >
            {isLikingPost && <LoadingSpinner size='sm' />}
            {!post.likes.includes(authUser._id) && !isLikingPost && (
              <BiLike className='w-4 h-4 cursor-pointer text-slate-500 group-hover:text-pink-500' />
            )}
            {post.likes.includes(authUser._id) && !isLikingPost && (
              <BiLike className='w-4 h-4 cursor-pointer text-pink-500' />
            )}
            <span
              className={`text-sm group-hover:text-pink-500 ${
                post.likes.includes(authUser._id) ? "text-pink-500" : "text-slate-500"
              }`}
            >
              {post.likes.length}
            </span>
          </div>
        </div>

        {/* AdaptEdit Section */}
        {activeSection === 'adaptEdit' && (
          <div className="mt-4 divider"></div>
        )}
        {activeSection === 'adaptEdit' && (
          <div className="space-y-4">
            <form onSubmit={handlePostAdaptEdit} className="flex gap-4">
              <AvatarImage src={authUser.profileImg} username={authUser.username} />
              <div className="flex-1">
                <textarea
                  className="textarea textarea-primary w-full h-24 rounded-2xl "
                  placeholder="Share your adapt edit..."
                  value={adaptEdit}
                  onChange={(e) => setAdaptEdit(e.target.value)}
                  required
                />
                <div className="flex justify-end mt-2">
                  <button 
                    className="btn btn-primary btn-sm"
                    type="submit"
                    disabled={isAdaptingEdit || !adaptEdit.trim()}
                  >
                    {isAdaptingEdit ? <LoadingSpinner size="sm" /> : "Post Adaptation"}
                  </button>
                </div>
              </div>
            </form>

            <div className="space-y-4">
            {post.adaptEdits.map((edit) => (
              <div key={edit._id} className="card bg-base-300 rounded-2xl">
                <div className="card-body p-4">
                  <div className="flex gap-4">
                    <AvatarImage src={edit.user.profileImg} username={edit.user.username} />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Link 
                            to={`/profile/${edit.user.username}`} 
                            className="font-bold hover:text-primary"
                          >
                            {edit.user.username}
                          </Link>
                          <span className="text-sm opacity-70">
                            • {formatPostDate(edit.createdAt)}
                          </span>
                        </div>
                        {edit.user._id === authUser._id && (
                          <button
                            onClick={() => handleDeleteAdaptEdit(edit._id)}
                            disabled={isDeletingAdaptEdit}
                            className="btn btn-ghost btn-sm btn-square"
                          >
                            {isDeletingAdaptEdit ? (
                              <LoadingSpinner size="sm" />
                            ) : (
                              <FaTrash className="w-4 h-4 text-error" />
                            )}
                          </button>
                        )}
                      </div>
                      <div className="mt-2">
                          <TruncatedText text={edit.text} maxLines={5} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          </div>
        )}

        {/* AdaptNext Section */}
        {activeSection === 'adaptNext' && (
          <div className="mt-4 divider"></div>
        )}
        {activeSection === 'adaptNext' && (
          <div className="space-y-4">
            <form onSubmit={handlePostAdaptNext} className="flex gap-4">
              <AvatarImage src={authUser.profileImg} username={authUser.username} />
              <div className="flex-1">
                <textarea
                  className="textarea textarea-accent w-full h-24 rounded-2xl "
                  placeholder="What happens next..."
                  value={adaptNext}
                  onChange={(e) => setAdaptNext(e.target.value)}
                  required
                />
                <div className="flex justify-end mt-2">
                  <button 
                    className="btn btn-accent btn-sm"
                    type="submit"
                    disabled={isAdaptingNext || !adaptNext.trim()}
                  >
                    {isAdaptingNext ? <LoadingSpinner size="sm" /> : "Post Next"}
                  </button>
                </div>
              </div>
            </form>

            <div className="space-y-4">
            {post.adaptNexts?.map((next) => (
              <div key={next._id} className="card bg-base-300 rounded-2xl">
                <div className="card-body p-4">
                  <div className="flex gap-4">
                    <AvatarImage src={next.user.profileImg} username={next.user.username} />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Link 
                            to={`/profile/${next.user.username}`} 
                            className="font-bold hover:text-accent"
                          >
                            {next.user.username}
                          </Link>
                          <span className="text-sm opacity-70">
                            • {formatPostDate(next.createdAt)}
                          </span>
                        </div>
                        {next.user._id === authUser._id && (
                          <button
                            onClick={() => handleDeleteAdaptNext(next._id)}
                            disabled={isDeletingAdaptNext}
                            className="btn btn-ghost btn-sm btn-square"
                          >
                            {isDeletingAdaptNext ? (
                              <LoadingSpinner size="sm" />
                            ) : (
                              <FaTrash className="w-4 h-4 text-error" />
                            )}
                          </button>
                        )}
                      </div>
                      <div className="mt-2">
                          <TruncatedText text={next.text} maxLines={5} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Post;