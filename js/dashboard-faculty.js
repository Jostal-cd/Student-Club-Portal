document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const username = localStorage.getItem('username');

    // Authorization check
    if (!token || role !== 'faculty') {
        window.location.href = 'login.html';
        return;
    }

    document.getElementById('welcome-msg').textContent = `Welcome, Faculty Admin!`;

    document.getElementById('logout-btn').addEventListener('click', () => {
        localStorage.clear();
        window.location.href = 'login.html';
    });

    const loadPendingEvents = async () => {
        try {
            const res = await fetch('/api/events', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const events = await res.json();

            const pendingList = document.getElementById('pending-events-list');
            const historyList = document.getElementById('history-events-list');

            pendingList.innerHTML = '';
            historyList.innerHTML = '';

            const pendingEvents = events.filter(e => e.status === 'pending');
            const historyEvents = events.filter(e => e.status !== 'pending');

            if (pendingEvents.length === 0) {
                pendingList.innerHTML = '<div class="card"><p class="muted" style="text-align: center;">No pending events to review.</p></div>';
            } else {
                pendingEvents.forEach(event => {
                    const item = createEventCard(event, true);
                    pendingList.appendChild(item);
                });
            }

            if (historyEvents.length === 0) {
                historyList.innerHTML = '<div class="card"><p class="muted" style="text-align: center;">No event history.</p></div>';
            } else {
                historyEvents.forEach(event => {
                    const item = createEventCard(event, false);
                    historyList.appendChild(item);
                });
            }

            // Attach handlers
            document.querySelectorAll('.approve-btn').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const eventId = e.target.getAttribute('data-id');
                    await updateEventStatus(eventId, 'approved');
                });
            });

            document.querySelectorAll('.reject-btn').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const reason = prompt('Please enter a reason for rejection (this will be sent to the club):');
                    if (reason !== null) {
                        const eventId = e.target.getAttribute('data-id');
                        await updateEventStatus(eventId, 'rejected', reason);
                    }
                });
            });

        } catch (err) {
            console.error(err);
            document.getElementById('pending-events-list').innerHTML = '<p class="muted">Error loading events. Backend may be offline.</p>';
        }
    };

    const createEventCard = (event, isPending) => {
        const item = document.createElement('div');
        item.className = 'event-card';
        const dateObj = new Date(event.date);
        const clubName = event.createdBy ? event.createdBy.username.replace('_', ' ').toUpperCase() : 'Unknown Club';

        let actionHtml = '';
        if (isPending) {
            actionHtml = `
            <div class="action-buttons">
              <button class="btn approve-btn" data-id="${event._id}" style="background-color: #16a34a;">Approve Event</button>
              <button class="btn-outline reject-btn" data-id="${event._id}" style="color: #ef4444; border-color: #ef4444;">Reject Event</button>
            </div>
          `;
        } else {
            const statusColor = event.status === 'approved' ? '#16a34a' : '#ef4444';
            let reasonHtml = event.status === 'rejected' && event.rejectReason ? `<p style="margin-top: 5px; color: #4b5563; font-style: italic;">Reason: ${event.rejectReason}</p>` : '';
            actionHtml = `<div style="margin-top: 15px; font-weight: 600; color: ${statusColor}; text-transform: uppercase;">Status: ${event.status}</div>${reasonHtml}`;
        }

        item.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
            <div>
                <h3 style="color: #1f2937; font-size: 1.25rem;">${event.title}</h3>
                <p class="event-detail" style="color: #4b5563; margin-top: 8px;"><strong>Club:</strong> ${clubName}</p>
                <p class="event-detail" style="color: #4b5563;"><strong>Date Requested:</strong> ${dateObj.toLocaleDateString()}</p>
                <p class="event-detail" style="color: #4b5563;"><strong>Registration Link:</strong> ${event.registrationLink ? `<a href="${event.registrationLink}" target="_blank" style="color: #2563eb;">Link</a>` : 'Walk-in or Internal Registration'}</p>
            </div>
            <div class="club-icon-wrapper" style="width: 48px; height: 48px; background-color: #f3f4f6; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.5rem;">
                📅
            </div>
        </div>
        ${actionHtml}
      `;
        return item;
    };

    const updateEventStatus = async (id, status, rejectReason = '') => {
        try {
            const res = await fetch(`/api/events/${id}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status, rejectReason })
            });
            if (res.ok) {
                loadPendingEvents(); // Refresh list
            } else {
                alert('Failed to update event status');
            }
        } catch (err) {
            console.error(err);
        }
    };

    loadPendingEvents();
});
