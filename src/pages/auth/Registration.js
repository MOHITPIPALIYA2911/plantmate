import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import loginImg from "../../assests/lbg.jpeg";
import Logo from "../../assests/logo.jpeg";
import axios from "axios";
import { triggerNotification } from "../../utils/toastUtil";

const Registration = () => {
  const [formData, setFormData] = useState({
    rePassword: "",
    first_Name: "",
    LastName: "",
    emailId: "",
    password: "",
  });

  const navigate = useNavigate();

  const isValidEmail = (email) => {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(email);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const { emailId, password, rePassword, first_Name, LastName } = formData;

    if (!emailId || !password || !rePassword || !first_Name || !LastName) {
      triggerNotification("error", "All fields are required.");
      return;
    }

    if (!isValidEmail(emailId)) {
      triggerNotification("error", "Please enter a valid email address.");
      return;
    }

    if (password !== rePassword) {
      triggerNotification("error", "Passwords do not match.");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:7777/auth/register",
        formData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 201) {
        triggerNotification("success", "Registration successful. Please login.");
        navigate("/", { replace: true });
      }
    } catch (error) {
      const errMsg = error?.response?.data?.message || "Server error";
      triggerNotification("error", errMsg);
    }
  };

  return (
    <div
      className="relative bg-no-repeat bg-cover bg-center min-h-screen"
      style={{ backgroundImage: `url(${loginImg})` }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-green-500 to-green-400 opacity-75"></div>

      <div className="flex flex-col sm:flex-row justify-center items-center min-h-screen">
        <div className="flex justify-center self-center z-10">
          <div className="p-12 bg-white mx-auto rounded-2xl w-[450px] shadow-lg">
            <div className="mb-4 text-center">
              <img
                src={Logo}
                alt="Quizero Logo"
                className="h-16 mb-3 rounded shadow-lg mx-auto"
              />
              <p className="text-gray-500">Register yourself.</p>
            </div>
            <form className="space-y-5" onSubmit={handleRegister}>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Username</label>
                <div className="flex gap-2">
                  <input
                    name="first_Name"
                    type="text"
                    placeholder="First Name"
                    value={formData.first_Name}
                    onChange={handleChange}
                    className="w-1/2 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-400"
                  />
                  <input
                    name="LastName"
                    type="text"
                    placeholder="Last Name"
                    value={formData.LastName}
                    onChange={handleChange}
                    className="w-1/2 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-400"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="emailId" className="text-sm font-medium text-gray-700">Email</label>
                <input
                  id="emailId"
                  name="emailId"
                  type="text"
                  placeholder="mail@gmail.com"
                  value={formData.emailId}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-400"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-gray-700">Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-400"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="rePassword" className="text-sm font-medium text-gray-700">Confirm Password</label>
                <input
                  id="rePassword"
                  name="rePassword"
                  type="password"
                  placeholder="Re-enter your password"
                  value={formData.rePassword}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-400"
                />
              </div>

              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Already have an account?
                  <span
                    className="text-green-500 cursor-pointer hover:underline ml-1"
                    onClick={() => navigate("/")}
                  >
                    Login
                  </span>
                </p>
              </div>

              <button
                type="submit"
                className="w-full flex justify-center bg-green-400 hover:bg-green-500 text-white p-3 rounded-full font-semibold shadow-lg transition duration-500"
              >
                Sign Up
              </button>
            </form>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default Registration;
