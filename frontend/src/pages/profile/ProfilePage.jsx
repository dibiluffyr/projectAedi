import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Posts from "../../components/common/Posts";
import ProfileHeaderSkeleton from "../../components/skeletons/ProfileHeaderSkeleton";
import EditProfileModal from "./EditProfileModal";

import { FaArrowLeft, FaLink } from "react-icons/fa";
import { IoCalendarOutline } from "react-icons/io5";
import { MdEdit } from "react-icons/md";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { formatMemberSinceDate } from "../../utils/date";
import UseFollow from "../../hooks/UseFollow";
import toast from "react-hot-toast";

const ProfilePage = () => {
  const [profileImg, setProfileImg] = useState(null);
  const [feedType, setFeedType] = useState("posts");
  const profileImgRef = useRef(null);
  const {username} = useParams();
  const navigate = useNavigate();

  const { follow, isPending } = UseFollow();
  const queryClient = useQueryClient();
  const { data: authUser } = useQuery({
    queryKey: ["authUser"],
  });

const { data: user, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["userProfile"],
    queryFn: async() => {
      try {
        const res = await fetch(`/api/users/profile/${username}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Something went wrong");
        return data;
      } catch (error) {
        throw new Error(error);
      }
    },
});

const { mutate: updateProfile, isPending: isUpdatingProfile } = useMutation({
  mutationFn: async() => {
    try {
      const res = await fetch(`/api/users/update`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          profileImg,
        }),
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
    toast.success("Profile updated successfully");
    Promise.all([
      queryClient.invalidateQueries({ queryKey: ["authUser"] }),
      queryClient.invalidateQueries({ queryKey: ["userProfile"] }),
    ])
  },
  onError: (error) => {
    toast.error(error.message);
  },
});

const { mutate: deleteProfile, isPending: isDeleting } = useMutation({
    mutationFn: async () => {
      try {
        const res = await fetch(`/api/users/delete/${user?._id}`, {
          method: "DELETE",
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Error deleting profile");

        const logoutRes = await fetch('/api/auth/logout', {
          method: 'POST',
          credentials: 'include' 
        });
        
        if (!logoutRes.ok) {
          throw new Error('Error logging out');
        }

        return data;
      } catch (error) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.setQueryData(["authUser"], null);
      queryClient.clear(); 
      toast.success("Profile deleted successfully");
      navigate('/login'); 
    },
    onError: (error) => {
      toast.error(error.message);
      navigate('/login');
    },
});



  const handleDeleteProfile = () => {
    if (window.confirm("Are you sure you want to delete your profile? This action cannot be undone.")) {
      deleteProfile();
    }
  };
  
  useEffect(() => {
    refetch();
  }, [username, refetch]);

  

  const isMyProfile = authUser._id === user?._id;
  const memberSinceDate = formatMemberSinceDate(user?.createdAt);
  const amIFollowing = authUser?.following.includes(user?._id);

  const handleImgChange = (e, state) => {
		const file = e.target.files[0];
		if (file) {
			const reader = new FileReader();
			reader.onload = () => {
				state === "profileImg" && setProfileImg(reader.result);
			};
			reader.readAsDataURL(file);
		}
	};

  

  return (
    <div className="flex-[4_4_0] min-h-screen">
      {(isLoading || isRefetching) && <ProfileHeaderSkeleton />}
      {!isLoading && !isRefetching && !user && (
        <p className="text-center text-lg mt-4">User not found</p>
      )}
      
      {!isLoading && !isRefetching && user && (
        <div className="flex flex-col">

          <div className="flex items-center px-4 py-2 border-b border-gray-700">
            <Link to="/" className="p-2 hover:bg-gray-800 rounded-full">
              <FaArrowLeft className="w-4 h-4" />
            </Link>
            <h1 className="ml-4 font-bold text-lg">{user?.username}</h1>
          </div>

          <div className="flex flex-col items-center px-4 pt-8 pb-4">

            <div className="relative group mb-6">
              <div className="avatar">
                <div className="w-28 h-28 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                  <img
                    src={profileImg || user?.profileImg || "/avatar-placeholder.png"}
                    alt="profile"
                    className="rounded-full object-cover"
                  />
                </div>
              </div>
              {isMyProfile && (
                <>
                  <div
                    className="absolute bottom-0 right-0 p-2 bg-primary rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => profileImgRef.current.click()}
                  >
                    <MdEdit className="w-4 h-4 text-white" />
                  </div>
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    ref={profileImgRef}
                    onChange={(e) => handleImgChange(e, "profileImg")}
                  />
                </>
              )}
            </div>

            <div className="flex flex-col items-center gap-2 w-full max-w-md">
              <div className="text-center">
                <h2 className="text-xl font-bold">{user?.username}</h2>
              </div>

              <div className="flex gap-6 mt-4">
                <div className="flex flex-col items-center">
                  <span className="font-bold">{user?.following.length}</span>
                  <span className="text-sm text-gray-500">Following</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="font-bold">{user?.followers.length}</span>
                  <span className="text-sm text-gray-500">Followers</span>
                </div>
              </div>

              <div className="flex flex-wrap justify-center gap-4 mt-4">
        
                <div className="flex items-center gap-1 text-gray-500">
                  <IoCalendarOutline className="w-4 h-4" />
                  <span className="text-sm">{memberSinceDate}</span>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                {isMyProfile ? (
                  <>
                    <EditProfileModal authUser={authUser} />
                    {profileImg && (
                      <button
                        className="btn btn-primary btn-sm rounded-full"
                        onClick={async () => {
                          await updateProfile({ profileImg });
                          setProfileImg(null);
                        }}
                      >
                        {isUpdatingProfile ? "Updating..." : "Update Photo"}
                      </button>
                    )}
                    <button
                      className="btn btn-error btn-sm rounded-full"
                      onClick={handleDeleteProfile}
                      disabled={isDeleting}
                    >
                      {isDeleting ? "Deleting..." : "Delete Account"}
                    </button>
                  </>
                  
                ) : (
                  <button
                    className="btn btn-primary btn-sm rounded-full"
                    onClick={() => follow(user?._id)}
                  >
                    {isPending ? "Loading..." : amIFollowing ? "Unfollow" : "Follow"}
                  </button>
                )}
              </div>
            </div>
          </div>

          <div>
            <Posts feedType={feedType} username={username} userId={user?._id} />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;