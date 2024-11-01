import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import AediSvg from "../../../components/svgs/Aedi";
import { MdOutlineMail, MdPassword, MdVisibility, MdVisibilityOff } from "react-icons/md";
import { FaUser } from "react-icons/fa";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

const SignUpPage = () => {
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  const queryClient = useQueryClient();

  const { mutate, isError, isPending, error } = useMutation({
    mutationFn: async ({ email, username, password }) => {
      try {
        const res = await fetch("/api/auth/signup", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, username, password }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to create account");
        console.log(data);
        return data;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    onSuccess: () => {
      toast.success("Account created successfully");
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutate(formData);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen bg-black hero">
      <div className="hero-content p-0 w-full max-w-4xl">
        <div className="card w-full bg-[#1a1a1a] shadow-2xl">
          <div className="flex flex-col lg:flex-row">
            {/* Left Side - Form Section */}
            <div className="flex-1 card-body p-8 lg:p-12">
              <div className="max-w-sm mx-auto">
                <div className="lg:hidden flex justify-center mb-8">
                  <AediSvg className="w-32 h-32 fill-white" />
                </div>

                <div className="text-center mb-8">
                  <h1 className="text-3xl font-bold text-white mb-2">Hi! Let's get started</h1>
                  <p className="text-gray-400">Create your account</p>
                </div>

                <form className="space-y-6" onSubmit={handleSubmit}>
                  <div className="space-y-4">
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text text-gray-400">Email</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <MdOutlineMail className="h-5 w-5 text-gray-500" />
                        </div>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="input input-bordered w-full pl-10 bg-gray-800 text-white"
                          placeholder="Enter your email"
                        />
                      </div>
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text text-gray-400">Username</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FaUser className="h-5 w-5 text-gray-500" />
                        </div>
                        <input
                          type="text"
                          name="username"
                          value={formData.username}
                          onChange={handleInputChange}
                          className="input input-bordered w-full pl-10 bg-gray-800 text-white"
                          placeholder="Choose a username"
                        />
                      </div>
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text text-gray-400">Password</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <MdPassword className="h-5 w-5 text-gray-500" />
                        </div>
                        <input
                          type={showPassword ? "text" : "password"}
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          className="input input-bordered w-full pl-10 pr-10 bg-gray-800 text-white"
                          placeholder="Create a password"
                        />
                        <button
                          type="button"
                          onClick={togglePasswordVisibility}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-400 transition-colors"
                        >
                          {showPassword ? (
                            <MdVisibilityOff className="h-5 w-5" />
                          ) : (
                            <MdVisibility className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {isError && (
                    <div className="text-error text-sm text-center">{error.message}</div>
                  )}

                  <button
                    type="submit"
                    className="btn btn-primary w-full"
                    disabled={isPending}
                  >
                    {isPending ? "Creating account..." : "Sign up"}
                  </button>
                </form>

                <div className="mt-6 text-center">
                  <p className="text-gray-400">
                    Already have an account?{" "}
                    <Link
                      to="/login"
                      className="text-blue-500 hover:text-blue-400 font-medium transition-colors"
                    >
                      Sign in
                    </Link>
                  </p>
                </div>
              </div>
            </div>

            {/* Right Side - Logo Section */}
            <div className="hidden lg:flex flex-1 bg-gradient-to-br from-blue-600 via-blue-500 to-blue-400 rounded-r-2xl p-12">
              <div className="flex flex-col h-full items-center justify-center">
                <AediSvg className="w-48 h-48 fill-white mb-8" />
                <div className="text-white text-center space-y-4">
                  <h2 className="text-3xl font-bold">Welcome to Aedi</h2>
                  <p className="text-lg text-blue-100">
                    Where your ideas are valued, and at home
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;