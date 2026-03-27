import React, { useState } from "react";
import AuthLayout from "../../components/layouts/AuthLayout";
import { Link } from "react-router-dom";
import Input from "../../components/Inputs/Input";
import { validateEmail } from "../../utils/helper";
import ProfilePhotoSelector from "../../components/Inputs/ProfilePhotoSelector";
import api from "../../utils/axios";
import { useNavigate } from "react-router-dom";

const Signup: React.FC = () => {
  const [profilePic, setProfilePic] = useState<File | null>(null);
  const [fullName, setFullName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // handle sign up form submit
  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!fullName) {
      setError("Please enter your name");
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!password) {
      setError("Please enter the password");
      return;
    }

    setError("");

    try {
      const response = await api.post("/register", {
        fullName,
        email,
        password,
      });

      const { token, user } = response.data;

      // store auth data
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      // redirect
      navigate("/dashboard"); // change route if needed
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.response?.data?.message || "Signup failed");
    }
  };

  return (
    <AuthLayout>
      <div className="lg:w-[100%] h-auto md:h-full mt-10 md:mt-0 flex flex-col justify-center">
        <h3 className="text-xl font-semibold text-black">Create an Account</h3>

        <p className="text-xs text-slate-700 mt-[5px] mb-6">
          Join us today by entering your details below.
        </p>

        <form onSubmit={handleSignUp}>
          <ProfilePhotoSelector image={profilePic} setImage={setProfilePic} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              value={fullName}
              onChange={({ target }: React.ChangeEvent<HTMLInputElement>) =>
                setFullName(target.value)
              }
              label="Full Name"
              placeholder="John"
              type="text"
            />

            <Input
              value={email}
              onChange={({ target }: React.ChangeEvent<HTMLInputElement>) =>
                setEmail(target.value)
              }
              label="Email Address"
              placeholder="john@example.com"
              type="text"
            />

            <div className="col-span-2">
              <Input
                value={password}
                onChange={({ target }: React.ChangeEvent<HTMLInputElement>) =>
                  setPassword(target.value)
                }
                label="Password"
                placeholder="Minimum 8 characters"
                type="password"
              />
            </div>
          </div>

          {error && <p className="text-red-500 text-xs pb-2.5">{error}</p>}

          <button type="submit" className="btn-primary">
            SIGN UP
          </button>

          <p className="text-[13px] text-slate-800 mt-3">
            Already have an account?{" "}
            <Link className="font-medium text-primary underline" to="/login">
              Login
            </Link>
          </p>
        </form>
      </div>
    </AuthLayout>
  );
};

export default Signup;
