import { Link, Outlet } from "react-router-dom";
import "./App.css";

function App() {
  return (
    <div className="app">
      <nav className="navbar">
        <div className="nav-container">
          <Link to="/" className="logo">
            AI Summit
          </Link>
          <ul className="nav-links">
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/register">Register</Link>
            </li>
            <li>
              <Link to="/login">Admin</Link>
            </li>
          </ul>
        </div>
      </nav>

      <main>
        <Outlet />
      </main>

      <footer className="footer">
        <p>&copy; 2025 AI Summit. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;
