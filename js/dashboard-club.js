document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const username = localStorage.getItem('username');

    // Authorization check
    if (!token || role !== 'club') {
        window.location.href = '/html/login.html';
        return;
    }

    const formattedName = username.replace('_', ' ').toUpperCase();
    document.getElementById('welcome-msg').textContent = `Welcome, ${formattedName}!`;

    document.getElementById('logout-btn').addEventListener('click', () => {
        localStorage.clear();
        window.location.href = '/html/login.html';
    });

    const loadEvents = async () => {
        try {
            const res = await fetch('http://localhost:3000/api/events', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const events = await res.json();

            const eventsList = document.getElementById('events-list');
            eventsList.innerHTML = '';

            if (events.length === 0) {
                eventsList.innerHTML = '<p class="muted">You have not created any events yet.</p>';
                return;
            }

            events.forEach(event => {
                const item = document.createElement('div');
                item.className = 'event-item';

                const dateObj = new Date(event.date);

                let extraHtml = '';
                if (event.status === 'rejected') {
                    extraHtml = `
                        <div style="margin-top: 15px; padding: 15px; background-color: #fef2f2; border-left: 4px solid #ef4444; border-radius: 4px;">
                            <p style="color: #991b1b; font-size: 0.95rem; margin-bottom: 10px;"><strong>Rejection Reason:</strong> ${event.rejectReason || 'No reason provided by faculty.'}</p>
                            <button class="btn-outline btn-sm resubmit-btn" data-id="${event._id}" data-title="${event.title}" data-date="${event.date.split('T')[0]}" data-link="${event.registrationLink || ''}" style="border-color: #2563eb; color: #2563eb;">Edit & Resubmit</button>
                        </div>
                    `;
                }

                item.innerHTML = `
          <div style="width: 100%;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
                <div>
                   <h3 style="margin-bottom: 5px;">${event.title}</h3>
                   <p class="muted" style="font-size: 0.9rem; margin-bottom: 5px;">Date: ${dateObj.toLocaleDateString()}</p>
                   <span class="status-badge status-${event.status}">${event.status}</span>
                </div>
                <div>
                   <button class="btn-outline btn-sm delete-btn" data-id="${event._id}" style="color: #ef4444; border-color: #ef4444;">Delete</button>
                </div>
            </div>
            ${extraHtml}
          </div>
        `;
                eventsList.appendChild(item);
            });

            // Attach delete handlers
            document.querySelectorAll('.delete-btn').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    if (confirm('Are you sure you want to delete this event?')) {
                        const eventId = e.target.getAttribute('data-id');
                        await deleteEvent(eventId);
                    }
                });
            });

            // Attach resubmit handlers
            document.querySelectorAll('.resubmit-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const id = e.target.getAttribute('data-id');
                    const title = e.target.getAttribute('data-title');
                    const date = e.target.getAttribute('data-date');
                    const link = e.target.getAttribute('data-link');

                    const newTitle = prompt('Edit Title:', title);
                    if (newTitle === null) return;

                    const newDate = prompt('Edit Date (YYYY-MM-DD):', date);
                    if (newDate === null) return;

                    const newLink = prompt('Edit Registration Link (Optional):', link);
                    if (newLink === null) return;

                    updateAndResubmitEvent(id, newTitle, newDate, newLink);
                });
            });

        } catch (err) {
            console.error(err);
        }
    };

    const updateAndResubmitEvent = async (id, title, date, registrationLink) => {
        try {
            const res = await fetch(`http://localhost:3000/api/events/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ title, date, registrationLink })
            });

            if (res.ok) {
                loadEvents();
            } else {
                alert('Failed to resubmit event');
            }
        } catch (err) {
            console.error(err);
            alert('Server error');
        }
    };

    const deleteEvent = async (id) => {
        try {
            const res = await fetch(`http://localhost:3000/api/events/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                loadEvents();
            } else {
                alert('Failed to delete event');
            }
        } catch (err) {
            console.error(err);
        }
    };

    document.getElementById('create-event-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const title = document.getElementById('event-title').value;
        const date = document.getElementById('event-date').value;
        const registrationLink = document.getElementById('event-link').value;

        try {
            const res = await fetch('http://localhost:3000/api/events', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ title, date, registrationLink })
            });

            if (res.ok) {
                e.target.reset();
                loadEvents();
            } else {
                alert('Failed to create event');
            }
        } catch (err) {
            console.error(err);
            alert('Server error');
        }
    });

    loadEvents();
});
