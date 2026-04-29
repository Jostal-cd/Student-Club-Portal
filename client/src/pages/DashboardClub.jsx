import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

function DashboardClub() {
  const [myEvents, setMyEvents] = useState([]);
  const [allEvents, setAllEvents] = useState([]); // Specifically for the calendar
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState({});
  const navigate = useNavigate();

  const [showCreate, setShowCreate] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: '', date: '', registrationLink: '' });
  const [calendarDate, setCalendarDate] = useState(new Date());

  const [registrations, setRegistrations] = useState([]);
  const [viewingRegFor, setViewingRegFor] = useState(null);
  const [uploadFile, setUploadFile] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const u = JSON.parse(localStorage.getItem('user') || '{}');
    if (!token || (u.role !== 'club' && u.role !== 'club_coordinator')) {
      navigate('/login');
      return;
    }
    setUser(u);
    fetchEvents(token, u);
    fetchAllEvents(token);
  }, [navigate]);

  const fetchEvents = async (token, loggedInUser) => {
    try {
      const res = await fetch('/api/events', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const text = await res.text();
      const data = text ? JSON.parse(text) : [];
      setMyEvents(data); // These are specifically my events since route GET /api/events filters for club role
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllEvents = async (token) => {
    // Actually wait, clubs can only GET their own events natively through /api/events currently.
    // If we want clubs to see EVERYONE'S events to know schedules, we can fetch the public approved events via /api/events without auth
    try {
      const res = await fetch('/api/events'); // Fetch public view (approved only). If they need ALL pending events across clubs too, backend route tweak is needed.
      const text = await res.text();
      const data = text ? JSON.parse(text) : [];
      setAllEvents(data);
    } catch(err) {
      console.error(err);
    }
  }

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(newEvent)
      });
      const text = await res.text();
      const data = text ? JSON.parse(text) : {};
      if (!res.ok) {
         return alert(data.msg || "Failed to create event");
      }
      setMyEvents([...myEvents, data]);
      setShowCreate(false);
      setNewEvent({ title: '', date: '', registrationLink: '' });
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
        setMyEvents(myEvents.map(ev => ev._id === eventId ? { ...ev, reportFile: data.reportFile } : ev));
        setUploadFile(null);
        alert("Report uploaded successfully! Note: Only Admin and Faculty can access it.");
      }
    } catch (err) {
      alert("Upload failed.");
    }
  };
  
  const hasGlobalEvent = (date) => {
    return allEvents.some(ev => {
      const evDate = new Date(ev.date);
      return evDate.getFullYear() === date.getFullYear() && evDate.getMonth() === date.getMonth() && evDate.getDate() === date.getDate();
    });
  };

  return (
    <div className="container mt-5 pt-5 pb-5">
      <div className="row mb-4">
        <div className="col-12">
          <h2 className="mb-1 text-gradient fw-bold">Club Dashboard</h2>
          <p className="text-muted">Welcome back, {user.username}. Manage your club events here.</p>
        </div>
      </div>
      
      {/* Global Calendar */}
      <div className="row mb-4">
        <div className="col-12">
            <div className="card shadow-sm border-0 rounded-4 p-4">
              <h5 className="fw-bold mb-3 text-gradient">Global Campus Calendar (Approved Events)</h5>
              <div className="d-flex justify-content-center">
                 <Calendar 
                    value={calendarDate}
                    onChange={setCalendarDate}
                    tileClassName={({ date, view }) => {
                       if (view === 'month' && hasGlobalEvent(date)) return 'bg-purple-gradient text-white fw-bold rounded-pill shadow-sm';
                       return null;
                    }}
                 />
              </div>
              <div className="text-center mt-3 text-muted small">Max 3 events allowed per day across campus. Check dates before scheduling.</div>
            </div>
        </div>
      </div>

      {showCreate && (
        <div className="card shadow-sm border-0 rounded-4 mb-4">
          <div className="card-body p-4 bg-purple-gradient text-white rounded-4">
            <h5 className="fw-bold mb-3">Host a New Event</h5>
            <form onSubmit={handleCreateEvent}>
              <div className="row g-3">
                <div className="col-md-4">
                   <label>Event Title</label>
                   <input type="text" className="form-control" value={newEvent.title} onChange={e => setNewEvent({...newEvent, title: e.target.value})} required />
                </div>
                <div className="col-md-4">
                   <label>Event Date</label>
                   <input type="date" className="form-control" value={newEvent.date} onChange={e => setNewEvent({...newEvent, date: e.target.value})} required />
                </div>
                <div className="col-md-4">
                   <label>Custom Reg Link (Optional)</label>
                   <input type="url" className="form-control" placeholder="https://..." value={newEvent.registrationLink} onChange={e => setNewEvent({...newEvent, registrationLink: e.target.value})} />
                </div>
                <div className="col-12 mt-3">
                  <button type="submit" className="btn btn-light fw-bold text-primary shadow-sm">Submit for Approval</button>
                  <button type="button" className="btn btn-outline-light ms-2" onClick={() => setShowCreate(false)}>Cancel</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {viewingRegFor && (
        <div className="card shadow-sm border-0 rounded-4 mb-4 border-start border-4 border-info">
          <div className="card-body p-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold m-0">Student Registrations ({registrations.length})</h5>
              <div>
                <button className="btn btn-success btn-sm me-2 fw-bold shadow-sm" onClick={downloadCSV}><i className="fas fa-file-csv me-2"></i>Export CSV</button>
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
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h5 className="card-title fw-bold m-0">Your Club's Events</h5>
            {!showCreate && <button className="btn btn-gradient rounded-pill px-4 shadow-sm" onClick={() => setShowCreate(true)}>+ New Event</button>}
          </div>
          <div className="table-responsive">
            <table className="table align-middle">
              <thead className="table-light">
                <tr><th>Date</th><th>Title</th><th>Status</th><th>Actions</th><th>Report Upload</th></tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="5" className="text-center py-4">Loading events...</td></tr>
                ) : myEvents.length === 0 ? (
                  <tr><td colSpan="5" className="text-center py-4 text-muted">You haven't scheduled any events yet.</td></tr>
                ) : (
                  myEvents.map(ev => (
                    <tr key={ev._id}>
                      <td>{new Date(ev.date).toLocaleDateString()}</td>
                      <td className="fw-bold text-primary">{ev.title}</td>
                      <td><span className={`badge ${ev.status === 'approved' ? 'bg-success' : ev.status === 'rejected' ? 'bg-danger' : 'bg-warning'} rounded-pill padding-2`}>{ev.status.toUpperCase()}</span></td>
                      <td><button className="btn btn-sm btn-outline-info fw-bold me-2" onClick={() => loadRegistrations(ev._id)}>View Registrations</button></td>
                      <td>
                         <div className="d-flex align-items-center">
                            <input type="file" className="form-control form-control-sm me-2" style={{maxWidth: '180px'}} onChange={e => setUploadFile(e.target.files[0])} />
                            <button className="btn btn-sm btn-primary fw-bold px-3 shadow-sm" onClick={() => handleFileUpload(ev._id)}>Upload</button>
                            {ev.reportFile && <i className="fas fa-check-circle text-success ms-2" title="Report successfully submitted"></i>}
                          </div>
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

export default DashboardClub;
