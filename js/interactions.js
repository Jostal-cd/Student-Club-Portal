document.addEventListener("DOMContentLoaded", () => {
    const filters = document.querySelectorAll('.filter-btn');
    const clubs = document.querySelectorAll('.club-card');

    filters.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();

            // Remove active styles from all
            filters.forEach(f => {
                f.style.color = '#6b7280';
                f.style.borderBottom = 'none';
                f.classList.remove('active');
            });

            // Add active style to clicked
            btn.style.color = '#2563eb';
            btn.style.borderBottom = '2px solid #2563eb';
            btn.classList.add('active');

            const filterValue = btn.getAttribute('data-filter');

            // Filter clubs
            clubs.forEach(club => {
                if (filterValue === 'All' || club.getAttribute('data-category') === filterValue) {
                    club.style.display = 'flex'; // Reset display to default style definition
                } else {
                    club.style.display = 'none';
                }
            });
        });
    });
});
