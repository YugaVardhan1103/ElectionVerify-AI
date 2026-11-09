import { NavLink, Link } from "react-router-dom";

function Navbar() {
  const getLinkClass = ({ isActive }) =>
    `transition-colors ${
      isActive
        ? "font-semibold text-blue-400"
        : "text-slate-300 hover:text-white"
    }`;

  return (
    <nav className="flex items-center justify-between bg-slate-900 px-8 py-4 text-white">

      <Link to="/" className="text-2xl font-bold">
        ElectionVerify AI
      </Link>

      <div className="flex items-center gap-6">
        <NavLink to="/" className={getLinkClass}>
          Home
        </NavLink>

        <NavLink to="/login" className={getLinkClass}>
          Login
        </NavLink>

        <NavLink to="/signup" className={getLinkClass}>
          Sign Up
        </NavLink>
      </div>

    </nav>
  );
}

export default Navbar;