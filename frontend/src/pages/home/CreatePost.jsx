import { useState } from "react";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { IoClose } from "react-icons/io5";

const CreatePost = () => {
  const [text, setText] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);

  const { data: authUser } = useQuery({ queryKey: ["authUser"] });
  const queryClient = useQueryClient();

  const {
    mutate: createPost,
    isPending,
    isError,
    error,
  } = useMutation({
    mutationFn: async ({ text }) => {
      try {
        const res = await fetch("/api/posts/create", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text }),
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
      setText("");
      setIsExpanded(false);
      toast.success("Post created successfully");
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim()) {
      createPost({ text });
    }
  };

  return (
    <div className="bg-[#111827] rounded-xl p-4 mb-4 mt-4">
      <div className="flex gap-4">
        <div className="avatar">
          <div className="w-12 h-12 rounded-full ring-2 ring-blue-500/20 hover:ring-blue-700/100 transition-all duration-200">
            <img
              src={authUser?.profileImg || "/avatar-placeholder.png"}
              alt="Profile"
              className="object-cover"
            />
          </div>
        </div>
        
        <form className="flex-1" onSubmit={handleSubmit}>
          <div
            className={`bg-gray-800/40 rounded-2xl p-4 mb-2 transition-all duration-200 ${
              isExpanded ? "ring-2 ring-blue-500/20" : ""
            }`}
          >
            <textarea
              className="w-full bg-transparent border-none resize-none text-lg placeholder-gray-300 focus:outline-none min-h-[60px]"
              placeholder="What's your idea?!"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onFocus={() => setIsExpanded(true)}
              rows={isExpanded ? 3 : 2}
            />

            {isExpanded && text.length > 0 && (
              <div className="flex justify-end mt-2">
                <button
                  type="button"
                  onClick={() => setText("")}
                  className="text-gray-500 hover:text-gray-300 transition-colors p-1 rounded-full hover:bg-gray-700/50"
                >
                  <IoClose size={20} />
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end mt-4">
            <button
              type="submit"
              disabled={isPending || text.trim().length === 0}
              className={`px-6 py-2 rounded-full font-medium transition-all duration-200 
                ${
                  text.trim().length === 0
                    ? "bg-blue-500/50 text-gray-300 cursor-not-allowed"
                    : "bg-blue-500 hover:bg-blue-600 text-white"
                }
              `}
            >
              {isPending ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Posting...
                </span>
              ) : (
                "Post"
              )}
            </button>
          </div>

          {isError && (
            <div className="mt-2 text-sm text-red-500 bg-red-500/10 p-3 rounded-lg">
              {error.message}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default CreatePost;