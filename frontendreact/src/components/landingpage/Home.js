import React from "react";
import { Link } from "react-router-dom";
import lenx from "../../img/lenx.png";

export default function Home() {
  return (
    <div className="home-container">
      <img src={lenx} alt="lenx" />
      <p>lorem ipsum</p>
      <h1>Create an account or Login</h1>
      <div className="home-action-btn">
        <button>
          <Link to="register">Register</Link>
        </button>
        <button>
          <Link to="/login">Login</Link>
        </button>
      </div>
    </div>
  );
}
