import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className=" px-8 py-5 flex justify-between items-center border-b">
      <Link to="/" className="text-2xl font-bold">
        <img src={"/logo-v.png"} alt="" />
      </Link>
      <div>
        {user ? (
          <div className='flex items-center gap-4'>
            <p className='text-gray-500'>{user.user.email}</p>
            <button
              onClick={handleLogout}
              className="bg-[#227F74] px-4 py-2 text-white rounded-md hover:bg-green-700"
            >
              Logout
            </button>
          </div>
        ) : (
          <div className="flex gap-3">
            <Link
              to="/login"
              className="px-5 py-2 rounded-md border border-[#227F74] text-[#227F74] hover:bg-[#227F74] hover:text-white transition"
            >
              Login
            </Link>

            <Link
              to="/register"
              className="px-5 py-2 rounded-md bg-[#227F74] text-white hover:bg-[#1c695f] transition"
            >
              Get Started
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
