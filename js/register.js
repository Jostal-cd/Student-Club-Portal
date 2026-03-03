document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const eventId = urlParams.get('id');

    if (!eventId) {
        document.getElementById('event-title-display').textContent = 'No event selected. Please go back to the calendar.';
        document.getElementById('register-form').style.display = 'none';
        return;
    }

    // Optionally fetch event details to display its name
    try {
        const res = await fetch('/api/events');
        const events = await res.json();
        const event = events.find(e => e._id === eventId);
        if (event) {
            document.getElementById('event-title-display').textContent = `Registering for: ${event.title}`;
        } else {
            document.getElementById('event-title-display').textContent = 'Event not found or not approved.';
            document.getElementById('register-form').style.display = 'none';
        }
    } catch (err) {
        console.error(err);
    }

    const registerForm = document.getElementById('register-form');
    const successMsg = document.getElementById('success-message');
    const errorMsg = document.getElementById('error-message');
    const submitBtn = document.getElementById('submit-btn');

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        successMsg.style.display = 'none';
        errorMsg.style.display = 'none';
        submitBtn.disabled = true;
        submitBtn.textContent = 'Submitting...';

        const payload = {
            name: document.getElementById('name').value,
            phone: document.getElementById('phone').value,
            studentClass: document.getElementById('studentClass').value,
            rollNo: document.getElementById('rollNo').value,
            eventId: eventId
        };

        try {
            const res = await fetch('/api/registrations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                successMsg.style.display = 'block';
                registerForm.reset();
            } else {
                const data = await res.json();
                errorMsg.textContent = data.msg || 'Failed to register';
                errorMsg.style.display = 'block';
            }
        } catch (err) {
            errorMsg.textContent = 'Server Error. Please try again later.';
            errorMsg.style.display = 'block';
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Register';
        }
    });
});
