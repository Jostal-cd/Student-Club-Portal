document.addEventListener("DOMContentLoaded", async () => {
    const prevMonthBtn = document.getElementById("prev-month-btn");
    const nextMonthBtn = document.getElementById("next-month-btn");
    const currentMonthDisplay = document.getElementById("current-month-display");
    const calendarDaysGrid = document.getElementById("calendar-days-grid");

    // Start with current date (align to current dates and time)
    let currentDate = new Date();
    let events = [];

    // Fetch live events from API
    try {
        const res = await fetch("http://localhost:3000/api/events");
        if (res.ok) {
            events = await res.json();
        }
    } catch (err) {
        console.error("Failed to load events", err);
    }

    function renderCalendar() {
        if (!calendarDaysGrid || !currentMonthDisplay) return;

        // Clear grid
        calendarDaysGrid.innerHTML = "";

        // Add headers
        const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        daysOfWeek.forEach(day => {
            const headerCell = document.createElement("div");
            headerCell.className = "calendar-day-header";
            headerCell.textContent = day;
            calendarDaysGrid.appendChild(headerCell);
        });

        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        // Update display
        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        currentMonthDisplay.textContent = `${monthNames[month]} ${year}`;

        // Get first day of month and total days
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const daysInPrevMonth = new Date(year, month, 0).getDate();

        // Previous month days
        for (let i = 0; i < firstDayOfMonth; i++) {
            const dayCell = document.createElement("div");
            dayCell.className = "calendar-day other-month";
            const daySpan = document.createElement("span");
            daySpan.className = "day-number";
            daySpan.textContent = daysInPrevMonth - firstDayOfMonth + i + 1;
            dayCell.appendChild(daySpan);
            calendarDaysGrid.appendChild(dayCell);
        }

        const today = new Date();
        const isCurrentMonthThisMonth = today.getFullYear() === year && today.getMonth() === month;

        // Current month days
        for (let i = 1; i <= daysInMonth; i++) {
            const dayCell = document.createElement("div");
            dayCell.className = "calendar-day";

            if (isCurrentMonthThisMonth && today.getDate() === i) {
                dayCell.classList.add("today");
            }

            const daySpan = document.createElement("span");
            daySpan.className = "day-number";
            daySpan.textContent = i;
            dayCell.appendChild(daySpan);

            // Add dynamic events if they match year, month, day
            events.forEach(evt => {
                const eventDate = new Date(evt.date);
                if (eventDate.getFullYear() === year && eventDate.getMonth() === month && eventDate.getDate() === i) {
                    const eventLink = document.createElement("a");
                    eventLink.className = `calendar-event event-culture`; // default styling class
                    eventLink.textContent = evt.title;
                    eventLink.style.display = 'block';
                    eventLink.style.textDecoration = 'none';
                    eventLink.style.color = 'inherit';
                    eventLink.href = evt.registrationLink ? evt.registrationLink : `register.html?id=${evt._id}`;
                    dayCell.appendChild(eventLink);
                }
            });

            calendarDaysGrid.appendChild(dayCell);
        }

        // Next month days to fill grid to consistently have a rectangular grid (usually 42 cells)
        const totalDaysRendered = firstDayOfMonth + daysInMonth;
        const remainingDays = 42 - totalDaysRendered;
        for (let i = 1; i <= remainingDays; i++) {
            const dayCell = document.createElement("div");
            dayCell.className = "calendar-day other-month";
            const daySpan = document.createElement("span");
            daySpan.className = "day-number";
            daySpan.textContent = i;
            dayCell.appendChild(daySpan);
            calendarDaysGrid.appendChild(dayCell);
        }
    }

    if (prevMonthBtn) {
        prevMonthBtn.addEventListener("click", () => {
            currentDate.setMonth(currentDate.getMonth() - 1);
            renderCalendar();
        });
    }

    if (nextMonthBtn) {
        nextMonthBtn.addEventListener("click", () => {
            currentDate.setMonth(currentDate.getMonth() + 1);
            renderCalendar();
        });
    }

    // Initial render
    renderCalendar();
});
