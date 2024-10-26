import { FaRegComment } from "react-icons/fa";
import { BiRepost } from "react-icons/bi";
import { FaRegHeart } from "react-icons/fa";
import { FaRegBookmark } from "react-icons/fa6";
import { FaTrash } from "react-icons/fa";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import LoadingSpinner from "./LoadingSpinner";

const Post = ({ post }) => {
	const [adaptEdit, setAdaptEdit] = useState("");
	const [adaptNext, setAdaptNext] = useState("");
	const {data: authUser} = useQuery({queryKey: ["authUser"]});
	const queryClient = useQueryClient();

	const {mutate:deletePost, isPending} = useMutation({
		mutationFn: async () => {
			try {
				const res = await fetch(`/api/posts/${post._id}`, {
					method: "DELETE",
					
				})
				const data = await res.json();

				if (!res.ok) {
					throw new Error(data.error || "Something went wrong");
				}

				return data
			} catch (error) {
				throw new Error(error);
			}
		},
		onSuccess: () => {
			toast.success("Post deleted successfully");
			queryClient.invalidateQueries({queryKey: ["posts"]});
			
		}
	})
	const postOwner = post.user;
	const isLiked = false;

	const isMyPost = authUser._id === postOwner._id;

	const formattedDate = "1h";

	const isAdaptEditing = false;
	const isAdaptNexting = false;

	const [showAdaptEdits, setShowAdaptEdits] = useState(false);
	const [showAdaptNexts, setShowAdaptNexts] = useState(false);

	const handleDeletePost = () => {
		deletePost();
	};

	const handlePostAdaptEdit = (e) => {
		e.preventDefault();
	};

	const handleAdaptEditPost = () => {};

	return (
		<>
			<div className='flex gap-2 items-start p-4 border-b border-gray-700'>
				<div className='avatar'>
					<Link to={`/profile/${postOwner.username}`} className='w-8 rounded-full overflow-hidden'>
						<img src={postOwner.profileImg || "/avatar-placeholder.png"} />
					</Link>
				</div>
				<div className='flex flex-col flex-1'>
					<div className='flex gap-2 items-center'>
						<Link to={`/profile/${postOwner.username}`} className='font-bold'>
							{postOwner.fullName}
						</Link>
						<span className='text-gray-700 flex gap-1 text-sm'>
							<Link to={`/profile/${postOwner.username}`}>@{postOwner.username}</Link>
							<span>·</span>
							<span>{formattedDate}</span>
						</span>
						{isMyPost && (
							<span className='flex justify-end flex-1'>
								{!isPending && (<FaTrash className='cursor-pointer hover:text-red-500' onClick=
								{handleDeletePost} />
								)}

								{isPending && (
									<LoadingSpinner size="sm" />
								)}
							</span>
						)}
					</div>
					<div className='flex flex-col gap-3 overflow-hidden'>
						<span>{post.text}</span>
						{post.img && (
							<img
								src={post.img}
								className='h-80 object-contain rounded-lg border border-gray-700'
							/>
						)}
						{showAdaptEdits && post.adaptEdits.length > 0 && (
							<div className='flex flex-col gap-2'>
								{post.adaptEdits.map((adaptEdit) => (
									<div key={adaptEdit._id}>
										<p className='text-sm text-gray-500'>{adaptEdit.text}</p>
									</div>
								))}
							</div>
						)}
						{showAdaptNexts && post.adaptNexts.length > 0 && (
							<div className='flex flex-col gap-2'>
								{post.adaptNexts.map((adaptNext) => (
									<div key={adaptNext._id}>
										<p className='text-sm text-gray-500'>{adaptNext.text}</p>
									</div>
								))}
							</div>
						)}
						<div className='flex justify-between items-center'>
							<div className='flex gap-2 items-center'>
								<Link to={`/post/${post._id}`} className='text-gray-700'>
									<FaRegComment className='text-lg' />
								</Link>
								<Link to={`/post/${post._id}`} className='text-gray-700'>
									<BiRepost className='text-lg' />
								</Link>
								<Link to={`/post/${post._id}`} className='text-gray-700'>
									<FaRegHeart className='text-lg' />
								</Link>
								<Link to={`/post/${post._id}`} className='text-gray-700'>
									<FaRegBookmark className='text-lg' />
								</Link>
							</div>
							<div className='flex gap-2 items-center'>
								<Link
									to={`/post/${post._id}`}
									className='text-gray-700'
									onClick={() => setShowAdaptEdits(!showAdaptEdits)}
								>
								</Link>
								<Link
									to={`/post/${post._id}`}
									className='text-gray-700'
									onClick={() => setShowAdaptEdits(!showAdaptEdits)}
								>
									{post.adaptEdits.length} Adapt Edits
								</Link>
								<Link
									to={`/post/${post._id}`}
									className='text-gray-700'
									onClick={() => setShowAdaptNexts(!showAdaptNexts)}
								>
									{post.adaptNexts.length} Adapt Nexts
								</Link>
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	);
};

export default Post;