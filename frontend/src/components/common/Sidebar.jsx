import React from 'react';
import AediSvg from "../svgs/Aedi";
import { MdHomeFilled } from "react-icons/md";
import { IoNotifications } from "react-icons/io5";
import { FaUser } from "react-icons/fa";
import { Link } from "react-router-dom";
import { BiLogOut } from "react-icons/bi";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

const Sidebar = () => {
  const queryClient = useQueryClient();

  const { data: unreadCount } = useQuery({
    queryKey: ["notifications-count"],
    queryFn: async () => {
      const res = await fetch("/api/notifications/unread-count");
      if (!res.ok) throw new Error("Failed to fetch notifications count");
      const data = await res.json();
      return data.count;
    }
  });
  const { mutate: markAsRead } = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/notifications/mark-read", {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to mark notifications as read");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications-count"] });
    }
  });
  
  const { mutate: logout, isPending } = useMutation({
    mutationFn: async () => {
      try {
        const res = await fetch("/api/auth/logout", {
          method: "POST",
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Something went wrong");
        }
      } catch (error) {
        throw new Error(error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
      toast.success("Logged out successfully");
    },
    onError: () => {
      toast.error("Logged out failed");
    },
  });

  const { data: authUser } = useQuery({ queryKey: ["authUser"] });

  const handleNotificationClick = () => {
    markAsRead();
  };

  const menuItems = [
    { 
      icon: <MdHomeFilled className="w-6 h-6" />, 
      label: "Home", 
      path: "/" 
    },
    { 
      icon: <IoNotifications className="w-6 h-6" />, 
      label: "Notifications", 
      path: "/notifications",
      onClick: handleNotificationClick,
      badge: unreadCount || 0 
    },
    { 
      icon: <FaUser className="w-6 h-6" />, 
      label: "Profile", 
      path: `/profile/${authUser?.username}` 
    },
  ];

  return (
    <div className="w-20 md:w-64 sticky top-0 h-screen">
      <div className="w-20 md:w-64 h-screen">
        <div className="flex flex-col h-full p-4">
          {/* Logo Section */}
          <Link to="/" className="flex items-center justify-center md:justify-start mb-8">
            <div className="bg-primary/10 p-2 rounded-lg">
              <AediSvg className="w-10 h-10 fill-primary" />
            </div>
            <span className="hidden md:block text-xl font-bold ml-3">Aedi</span>
          </Link>

          {/* Navigation Menu */}
          <nav className="flex-1">
            <ul className="space-y-2">
              {menuItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className="flex items-center p-3 rounded-lg hover:bg-gray-800/50 transition-colors duration-200 relative"
                    onClick={item.onClick}
                  >
                    <div className="flex items-center justify-center w-6 h-6">
                      {item.icon}
                    </div>
                    <span className="hidden md:block ml-4 font-medium">
                      {item.label}
                    </span>
                    {item.badge > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* User Profile Section */}
          {authUser && (
            <div className="border-t border-gray-800 pt-4 mt-4">
              <div className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-800/50 transition-colors duration-200">
                <div className="flex items-center flex-1">
                  <div className="avatar">
                    <div className="w-10 h-10 rounded-lg">
                      <img 
                        src={authUser?.profileImg || "/avatar-placeholder.png"}
                        alt="profile"
                        className="object-cover"
                      />
                    </div>
                  </div>
                  <div className="hidden md:block ml-3">
                    <p className="font-medium">{authUser?.username}</p>
                  </div>
                </div>
                <button
                  onClick={() => logout()}
                  disabled={isPending}
                  className="btn btn-ghost btn-circle"
                >
                  <BiLogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;