import { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css'; 

const CLUBS = [
  { name: "GDSC", image: "/img/gdsc.jpg", type: "tech", description: "Google Developers Student Club - Expanding boundaries of knowledge." },
  { name: "STUCCo", image: "img/stucco.jpg", type: "tech", description: "Student Club for Computer Engineering - Focused on coding and technology." },
  { name: "Rotaract", image: "/img/rotract.jpg", type: "arts", description: "Learn communication. Building leaders and giving back to the community." },
  { name: "Project Cell", image: "/img/project.jpg", type: "tech", description: "Turn ideas into reality. Hands-on project building." }
];

function Home() {
  const [filter, setFilter] = useState('all');
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [calendarDate, setCalendarDate] = useState(new Date());
  
  // Registration inline form state
  const [registeringFor, setRegisteringFor] = useState(null);
  const [regData, setRegData] = useState({ studentName: '', studentClass: '', div: '', rollNo: '', email: '', mobileNo: '', paymentId: '' });

  const filteredClubs = filter === 'all' ? CLUBS : CLUBS.filter(c => c.type === filter);

  useEffect(() => {
    fetch('/api/events')
      .then(res => res.text())
      .then(text => {
        const data = text ? JSON.parse(text) : [];
        setEvents(data);
        setLoadingEvents(false);
      })
      .catch(err => {
        console.error(err);
        setLoadingEvents(false);
      });
  }, []);

  const hasEvent = (date) => {
    return events.some(ev => {
      const evDate = new Date(ev.date);
      return evDate.getFullYear() === date.getFullYear() && evDate.getMonth() === date.getMonth() && evDate.getDate() === date.getDate();
    });
  };

  const handleRegister = async (e, eventId) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/events/${eventId}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(regData)
      });
      const text = await res.text();
      const data = text ? JSON.parse(text) : {};
      if (res.ok) {
        alert("Registration Successful!");
        setRegisteringFor(null);
        setRegData({ studentName: '', studentClass: '', div: '', rollNo: '', email: '', mobileNo: '', paymentId: '' });
      } else {
        alert("Error: " + data.msg);
      }
    } catch (err) {
      alert("Registration failed!");
    }
  };

  return (
    <div className="container mt-5 pt-3 mb-5">
      <div className="row mb-5">
        <div className="col-12">
          <div className="welcome-banner text-center py-5 rounded-4 shadow bg-purple-gradient text-white">
            <h2 className="display-4 fw-bold mb-3">Welcome As A Student</h2>
            <p className="lead px-3">Discover clubs, join events, and connect with your campus community.</p>
            <div className="mt-4">
               <a href="#clubs" className="btn btn-light btn-lg mx-2 text-dark fw-bold rounded-pill px-4 shadow-sm">Discover Clubs</a>
               <a href="#events" className="btn btn-outline-light btn-lg mx-2 fw-bold text-white rounded-pill px-4 border-2 shadow-sm">Upcoming Events</a>
            </div>
            <div className="mt-4 pt-3">
              <p className="small text-light mb-2">Are you a Faculty-in-Charge or a Club Coordinator?</p>
              <a href="/login" className="btn btn-sm btn-dark rounded-pill px-3 shadow">Login to your Dashboard</a>
            </div>
          </div>
        </div>
      </div>

      <div id="clubs" className="row mb-5">
        <div className="col-12">
          <h3 className="mb-4 text-center fw-bold text-gradient">Clubs Directory</h3>
          <div className="d-flex justify-content-center mb-5 gap-2">
            <button className={`btn rounded-pill px-4 ${filter === 'all' ? 'btn-gradient' : 'btn-outline-secondary'}`} onClick={() => setFilter('all')}>All</button>
            <button className={`btn rounded-pill px-4 ${filter === 'tech' ? 'btn-gradient' : 'btn-outline-secondary'}`} onClick={() => setFilter('tech')}>Tech</button>
            <button className={`btn rounded-pill px-4 ${filter === 'arts' ? 'btn-gradient' : 'btn-outline-secondary'}`} onClick={() => setFilter('arts')}>Arts & Culture</button>
          </div>
        </div>
        
        <div className="row g-4 justify-content-center">
          {filteredClubs.length === 0 ? (
             <div className="col-12 text-center text-muted">No clubs found.</div>
          ) : (
            filteredClubs.map((c, i) => (
              <div className="col-md-3 col-sm-6" key={i}>
                <div className="card h-100 shadow border-0 club-card text-center pb-2">
                  <div className="card-body">
                    <img src={c.image} alt={c.name} className="img-fluid rounded-circle mb-3 shadow-sm border border-2 border-white" style={{width: '90px', height: '90px', objectFit: 'cover'}} />
                    <h5 className="card-title fw-bold text-gradient">{c.name}</h5>
                    <span className={`badge ${c.type === 'tech' ? 'bg-primary' : 'bg-success'} mb-3 rounded-pill`}>{c.type === 'tech' ? 'Technology' : 'Arts & Culture'}</span>
                    <p className="card-text small text-muted px-2">{c.description}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div id="events" className="row mb-5 justify-content-center">
        <div className="col-12 text-center mb-4">
          <h3 className="fw-bold text-gradient">Upcoming Events</h3>
          <p className="text-muted">Check out our calendar to see what's happening!</p>
        </div>
        
        <div className="col-lg-5 mb-4">
          <div className="card shadow-sm border-0 rounded-4 overflow-hidden h-100">
            <div className="card-body d-flex flex-column align-items-center bg-white p-4">
              <Calendar 
                onChange={setCalendarDate} 
                value={calendarDate}
                tileClassName={({ date, view }) => {
                  if (view === 'month' && hasEvent(date)) return 'bg-purple-gradient text-white fw-bold rounded-pill shadow-sm';
                  return null;
                }}
              />
            </div>
          </div>
        </div>

        <div className="col-lg-7">
          <div className="row g-3">
            {loadingEvents ? (
              <div className="text-center text-muted col-12 py-5"><span className="spinner-border text-primary"></span></div>
            ) : events.length === 0 ? (
              <div className="text-center text-muted col-12 py-5 bg-white rounded-4 shadow-sm">No public events currently scheduled.</div>
            ) : (
              events.map((ev, idx) => {
                const isSelected = new Date(ev.date).toDateString() === calendarDate.toDateString();
                const isRegistering = registeringFor === ev._id;

                return (
                  <div className={`col-12 ${isSelected ? 'order-first' : ''}`} key={idx}>
                    <div className={`card shadow-sm border-0 transition-all ${isSelected ? 'border-start border-4 border-info bg-light' : 'club-card'}`}>
                      <div className="card-body p-4">
                        <div className="d-flex justify-content-between">
                           <h5 className="card-title text-gradient fw-bold mb-2">{ev.title}</h5>
                           {!isRegistering && (
                               <button className="btn btn-sm btn-gradient fw-bold shadow-sm" onClick={() => setRegisteringFor(ev._id)}>Register</button>
                           )}
                        </div>
                        <div className="d-flex gap-3 mb-2 small fw-semibold text-secondary">
                          <span><i className="fas fa-calendar-alt me-2 text-primary"></i>{new Date(ev.date).toLocaleDateString()}</span>
                        </div>
                        <p className="card-text text-muted mb-3">{ev.description || 'Join us for this exciting event!'}</p>

                        {isRegistering && (
                           <div className="bg-white p-3 rounded border">
                             <h6 className="fw-bold mb-3">Event Registration</h6>
                             <form onSubmit={(e) => handleRegister(e, ev._id)}>
                               <div className="row g-2">
                                  <div className="col-md-6"><input type="text" className="form-control form-control-sm" placeholder="Full Name" required value={regData.studentName} onChange={e => setRegData({...regData, studentName: e.target.value})} /></div>
                                  <div className="col-md-3"><input type="text" className="form-control form-control-sm" placeholder="Class" required value={regData.studentClass} onChange={e => setRegData({...regData, studentClass: e.target.value})} /></div>
                                  <div className="col-md-3"><input type="text" className="form-control form-control-sm" placeholder="Div (Opt)" value={regData.div} onChange={e => setRegData({...regData, div: e.target.value})} /></div>
                                  <div className="col-md-4"><input type="text" className="form-control form-control-sm" placeholder="Roll No" required value={regData.rollNo} onChange={e => setRegData({...regData, rollNo: e.target.value})} /></div>
                                  <div className="col-md-8"><input type="email" className="form-control form-control-sm" placeholder="Email" required value={regData.email} onChange={e => setRegData({...regData, email: e.target.value})} /></div>
                                  <div className="col-md-6"><input type="text" className="form-control form-control-sm" placeholder="Mobile Number" required value={regData.mobileNo} onChange={e => setRegData({...regData, mobileNo: e.target.value})} /></div>
                                  <div className="col-md-6"><input type="text" className="form-control form-control-sm" placeholder="Payment TXN (Opt)" value={regData.paymentId} onChange={e => setRegData({...regData, paymentId: e.target.value})} /></div>
                               </div>
                               <div className="mt-3 text-end">
                                  <button type="button" className="btn btn-sm btn-outline-secondary me-2" onClick={() => setRegisteringFor(null)}>Cancel</button>
                                  <button type="submit" className="btn btn-sm btn-success fw-bold">Submit</button>
                               </div>
                             </form>
                           </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
