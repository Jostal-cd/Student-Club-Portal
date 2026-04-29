import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function AdminDashboard() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [registrations, setRegistrations] = useState([]);
  const [viewingRegFor, setViewingRegFor] = useState(null);
  const [uploadFile, setUploadFile] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!token || user.role !== 'admin') {
      navigate('/login');
      return;
    }
    fetchEvents(token);
  }, [navigate]);

  const fetchEvents = async (token) => {
    try {
      const res = await fetch('/api/events', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const text = await res.text();
      const data = text ? JSON.parse(text) : [];
      setEvents(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleVisibility = async (eventId, currentVisibility) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/events/${eventId}/visibility`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ isVisible: !currentVisibility })
      });
      if (res.ok) setEvents(events.map(ev => ev._id === eventId ? { ...ev, isVisible: !currentVisibility } : ev));
    } catch (err) {
      console.error(err);
    }
  };

  const loadRegistrations = async (eventId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/events/${eventId}/registrations`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const text = await res.text();
      const data = text ? JSON.parse(text) : [];
      setRegistrations(data);
      setViewingRegFor(eventId);
    } catch (err) {
      console.error(err);
    }
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

  const handleFileUpload = async (eventId) => {
    if (!uploadFile) return alert("Please select a file first");
    const formData = new FormData();
    formData.append('reportFile', uploadFile);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/events/${eventId}/upload-report`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      if (res.ok) {
        const text = await res.text();
        const data = text ? JSON.parse(text) : {};
        setEvents(events.map(ev => ev._id === eventId ? { ...ev, reportFile: data.reportFile } : ev));
        setUploadFile(null);
        alert("File uploaded successfully!");
      }
    } catch (err) {
      alert("Upload failed.");
    }
  };

  return (
    <div className="container mt-5 pt-5 mb-5">
      <h2 className="mb-4 text-gradient fw-bold">Admin Dashboard</h2>
      <p className="text-muted">Manage global portal settings, event visibility, registrations, and reports.</p>

      {viewingRegFor && (
        <div className="card shadow-sm border-0 rounded-4 mb-4 border-start border-4 border-info">
          <div className="card-body p-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold m-0">Registrations ({registrations.length})</h5>
              <div>
                <button className="btn btn-success btn-sm me-2 fw-bold" onClick={downloadCSV}><i className="fas fa-file-csv me-2"></i>Export CSV</button>
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

      <div className="card border-0 shadow-sm mt-4">
        <div className="card-body">
          <h5 className="card-title fw-bold">All Events Control</h5>
          <div className="table-responsive mt-3">
            <table className="table align-middle">
              <thead className="table-light">
                <tr><th>Date</th><th>Title</th><th>Status</th><th>Visbility</th><th>Reg Data</th><th>Report Upload</th></tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="6" className="text-center text-muted">Loading...</td></tr>
                ) : events.map(ev => (
                  <tr key={ev._id}>
                    <td>{new Date(ev.date).toLocaleDateString()}</td>
                    <td className="fw-bold text-primary">{ev.title}</td>
                    <td><span className={`badge ${ev.status === 'approved' ? 'bg-success' : 'bg-warning'}`}>{ev.status}</span></td>
                    <td>
                      <button className={`btn btn-sm ${ev.isVisible !== false ? 'btn-outline-danger' : 'btn-outline-success'}`} onClick={() => toggleVisibility(ev._id, ev.isVisible !== false)}>
                        {ev.isVisible !== false ? 'Hide' : 'Show'}
                      </button>
                    </td>
                    <td><button className="btn btn-sm btn-outline-info fw-bold" onClick={() => loadRegistrations(ev._id)}>View DB</button></td>
                    <td>
                        {ev.reportFile ? (
                          <a href={ev.reportFile} target="_blank" rel="noreferrer" className="btn btn-sm btn-light text-success fw-bold">Report</a>
                        ) : (
                            <div className="d-flex"><input type="file" className="form-control form-control-sm me-1" style={{width:'150px'}} onChange={e => setUploadFile(e.target.files[0])} /><button className="btn btn-sm btn-primary" onClick={() => handleFileUpload(ev._id)}>Up</button></div>
                        )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
