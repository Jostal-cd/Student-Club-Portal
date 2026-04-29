import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function DashboardFaculty() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [registrations, setRegistrations] = useState([]);
  const [viewingRegFor, setViewingRegFor] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const u = JSON.parse(localStorage.getItem('user') || '{}');
    if (!token || (u.role !== 'faculty' && u.role !== 'admin')) {
      navigate('/login');
      return;
    }
    fetchEvents(token);
  }, [navigate]);

  const fetchEvents = async (token) => {
    try {
      const res = await fetch('/api/events', { headers: { 'Authorization': `Bearer ${token}` } });
      const text = await res.text();
      const data = text ? JSON.parse(text) : [];
      setEvents(data);
    } catch (err) { } finally { setLoading(false); }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/events/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status })
      });
      if (res.ok) setEvents(events.map(ev => ev._id === id ? { ...ev, status } : ev));
    } catch (err) { }
  };

  const loadRegistrations = async (eventId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/events/${eventId}/registrations`, { headers: { 'Authorization': `Bearer ${token}` } });
      const text = await res.text();
      const data = text ? JSON.parse(text) : [];
      setRegistrations(data);
      setViewingRegFor(eventId);
    } catch (err) { }
  };

  const downloadCSV = () => {
    if (registrations.length === 0) return alert('No registrations yet.');
    const keys = Object.keys(registrations[0]).filter(k => k !== '_id' && k !== '__v' && k !== 'event');
    let str = keys.join(',') + '\r\n';
    for (let i = 0; i < registrations.length; i++) {
        let line = '';
        for (let index in keys) {
            if (line != '') line += ',';
            line += `"${registrations[i][keys[index]] || ''}"`;
        }
        str += line + '\r\n';
    }
    const blob = new Blob([str], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "registrations.csv";
    link.click();
  };

  return (
    <div className="container mt-5 pt-5 mb-5">
      <h2 className="mb-1 text-gradient fw-bold">Faculty Dashboard</h2>
      <p className="text-muted mb-4">Review club event requests, inspect registrations, and securely VIEW reports.</p>

      {viewingRegFor && (
        <div className="card shadow-sm border-0 rounded-4 mb-4 border-start border-4 border-info">
          <div className="card-body p-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold m-0">Registrations ({registrations.length})</h5>
              <div>
                <button className="btn btn-success btn-sm me-2 fw-bold" onClick={downloadCSV}>Export CSV</button>
                <button className="btn btn-outline-secondary btn-sm" onClick={() => setViewingRegFor(null)}>Close</button>
              </div>
            </div>
            <div className="table-responsive">
              <table className="table table-sm table-striped">
                <thead><tr><th>Name</th><th>Class</th><th>Div</th><th>Roll</th><th>Email</th><th>Mobile</th></tr></thead>
                <tbody>
                  {registrations.map(r => (
                    <tr key={r._id}>
                      <td>{r.studentName}</td><td>{r.studentClass}</td><td>{r.div}</td>
                      <td>{r.rollNo}</td><td>{r.email}</td><td>{r.mobileNo}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      <div className="card border-0 shadow-sm rounded-4">
        <div className="card-body p-4">
          <h5 className="card-title fw-bold mb-4">All Submitted Events</h5>
          <div className="table-responsive">
            <table className="table align-middle">
              <thead className="table-light">
                <tr><th>Date</th><th>Title</th><th>Club</th><th>Status</th><th>Approval</th><th>Data</th><th>Report View</th></tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="7" className="text-center py-4">Loading events...</td></tr>
                ) : (
                  events.map(ev => (
                    <tr key={ev._id}>
                      <td>{new Date(ev.date).toLocaleDateString()}</td>
                      <td className="fw-bold">{ev.title}</td>
                      <td>{ev.createdBy?.username || 'Unknown'}</td>
                      <td><span className={`badge ${ev.status === 'approved' ? 'bg-success' : ev.status === 'rejected' ? 'bg-danger' : 'bg-warning'} rounded-pill`}>{ev.status.toUpperCase()}</span></td>
                      <td>
                        {ev.status === 'pending' ? (
                          <>
                            <button className="btn btn-sm btn-success me-1" onClick={() => handleStatusUpdate(ev._id, 'approved')}>✓</button>
                            <button className="btn btn-sm btn-danger" onClick={() => handleStatusUpdate(ev._id, 'rejected')}>✗</button>
                          </>
                        ) : <span className="text-muted small">Processed</span>}
                      </td>
                      <td><button className="btn btn-sm btn-outline-info fw-bold" onClick={() => loadRegistrations(ev._id)}>Inspect</button></td>
                      <td>
                        {ev.reportFile ? (
                          <a href={ev.reportFile} target="_blank" rel="noreferrer" className="btn btn-sm btn-primary fw-bold px-3">View Report</a>
                        ) : (
                          <span className="text-muted small">Pending</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
export default DashboardFaculty;
