import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="flex items-center justify-between bg-slate-900 px-8 py-4 text-white">

      <Link to="/" className="text-2xl font-bold">
        ElectionVerify AI
      </Link>

      <div className="flex items-center gap-6">
        <Link to="/">Home</Link>
        <Link to="/login">Login</Link>
        <Link to="/signup">Sign Up</Link>
      </div>

    </nav>
  );
}

export default Navbar;