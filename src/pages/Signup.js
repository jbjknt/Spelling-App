import { useState } from "react";
import { auth, db } from "../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("parent");
  const navigate = useNavigate();

  const handleSignup = async () => {
    try {
      // Create user in Firebase Auth
      await createUserWithEmailAndPassword(auth, email, password);

      // Save user role in Firestore
      await setDoc(doc(db, "users", email), {
        role,
        email,
      });

      // Redirect to correct dashboard
      role === "parent" ? navigate("/parent") : navigate("/child");
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">Sign Up</h2>
      <input
        className="w-full p-2 border mb-2"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        className="w-full p-2 border mb-2"
        placeholder="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <select
        className="w-full p-2 border mb-4"
        value={role}
        onChange={(e) => setRole(e.target.value)}
      >
        <option value="parent">Parent</option>
        <option value="child">Child</option>
      </select>
      <button
        onClick={handleSignup}
        className="w-full bg-blue-500 text-white p-2 rounded"
      >
        Sign Up
      </button>
    </div>
  );
}