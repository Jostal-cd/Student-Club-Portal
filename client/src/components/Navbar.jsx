import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary fixed-top shadow-sm">
      <div className="container-fluid">
        <Link className="navbar-brand fw-bold" to="/">Club Portal</Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <a className="nav-link" href="/#clubs">Clubs</a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="/#events">Events</a>
            </li>
          </ul>
          <div className="d-flex ms-3 gap-2">
            <Link to="/login" className="btn btn-outline-light fw-bold">Login</Link>
            <Link to="/signup" className="btn btn-light text-primary fw-bold">Sign Up</Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
