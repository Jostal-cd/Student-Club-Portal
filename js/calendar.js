document.addEventListener("DOMContentLoaded", () => {
    const prevMonthBtn = document.getElementById("prev-month-btn");
    const nextMonthBtn = document.getElementById("next-month-btn");
    const currentMonthDisplay = document.getElementById("current-month-display");
    const calendarDaysGrid = document.getElementById("calendar-days-grid");

    // Start with current date (align to current dates and time)
    let currentDate = new Date();

    // Events to show on the calendar
    const events = [
        { day: 1, month: 2, title: "🏃 Heart & Soul Run", class: "event-sports" },
        { day: 29, month: 2, title: "🎸 Unplug", class: "event-culture" },
        { day: 30, month: 2, title: "🎸 Unplug", class: "event-culture" },
        { day: 31, month: 2, title: "🎸 Unplug", class: "event-culture" },
        { day: 17, month: 6, title: "👋 Welcome Students!", class: "event-culture" }
    ];

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

            // Add static events if there are any
            events.forEach(evt => {
                const eventMonthMatches = evt.month === undefined || evt.month === month;
                if (evt.day === i && eventMonthMatches) {
                    const eventDiv = document.createElement("div");
                    eventDiv.className = `calendar-event ${evt.class}`;
                    eventDiv.textContent = evt.title;
                    dayCell.appendChild(eventDiv);
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
