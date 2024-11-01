import { Link } from "react-router-dom";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"; 
import { IoSettingsOutline } from "react-icons/io5";
import { FaUser } from "react-icons/fa";
import { FaHeart } from "react-icons/fa6";
import { BiEdit } from "react-icons/bi";
import { BsArrowRight } from "react-icons/bs";
import toast from "react-hot-toast";

const NotificationPage = () => {
  const queryClient = useQueryClient();
  
  const { data: notifications, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: async() => {
      try {
        // First, get the current user data
        const userRes = await fetch("/api/auth/me");
        const userData = await userRes.json();
        
        if (!userRes.ok) {
          throw new Error(userData.error || "Failed to get user data");
        }

        // Then get notifications
        const notifRes = await fetch("/api/notifications");
        const notifData = await notifRes.json();

        if (!notifRes.ok) {
          throw new Error(notifData.error || "Something went wrong");
        }

        // Filter out self-notifications
        const filteredNotifications = notifData.filter(
          notification => notification.from._id !== userData._id
        );

        return filteredNotifications;
      } catch (error) {
        throw new Error(error.message);
      }
    },
  });

  const { mutate: deleteNotifications } = useMutation({
    mutationFn: async () => {
      try {
        const res = await fetch("/api/notifications", {
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
      toast.success("Notifications deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const getNotificationIcon = (type) => {
    switch (type) {
      case "follow":
        return <FaUser className="w-7 h-7 text-primary" />;
      case "like":
      case "likeAdaptEdit":
      case "likeAdaptNext":
        return <FaHeart className="w-7 h-7 text-red-500" />;
      case "adaptEdit":
        return <BiEdit className="w-7 h-7 text-sky-500" />;
      case "adaptNext":
        return <BsArrowRight className="w-7 h-7 text-green-500" />;
      default:
        return null;
    }
  };

  const getNotificationText = (type) => {
    switch (type) {
      case "follow":
        return "followed you";
      case "like":
        return "liked your post";
      case "likeAdaptEdit":
        return "liked your adapt edit";
      case "likeAdaptNext":
        return "liked your adapt next";
      case "adaptEdit":
        return "adapt edited your post";
      case "adaptNext":
        return "adapt nexted your post";
      default:
        return "";
    }
  };

  return (
    <>
      <div className="flex-[4_4_0] min-h-screen">
        <div className="flex justify-between items-center p-4 ">
          <p className="font-bold">Notifications</p>
          <div className="dropdown">
            <div tabIndex={0} role="button" className="m-1">
              <IoSettingsOutline className="w-4" />
            </div>
            <ul
              tabIndex={0}
              className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52"
            >
              <li>
                <a onClick={deleteNotifications}>Delete all notifications</a>
              </li>
            </ul>
          </div>
        </div>

        {isLoading && (
          <div className="flex justify-center h-full items-center">
            <LoadingSpinner size="lg" />
          </div>
        )}

        {notifications?.length === 0 && (
          <div className="text-center p-4 font-bold">
            No notifications 🤔
          </div>
        )}

        {notifications?.map((notification) => (
          <div key={notification._id}>
            <div className="flex gap-2 p-4">
              {getNotificationIcon(notification.type)}
              <Link to={`/profile/${notification.from.username}`}>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <div className="avatar">
                      <div className="w-8 rounded-full">
                        <img 
                          src={notification.from.profileImg || "/avatar-placeholder.png"}
                          alt={`${notification.from.username}'s profile`}
                        />
                      </div>
                    </div>
                    <div className="flex gap-1 items-center">
                      <span className="font-bold">@{notification.from.username}</span>
                      <span>{getNotificationText(notification.type)}</span>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default NotificationPage;