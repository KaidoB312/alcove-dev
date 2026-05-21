// Dark mode logic
const darkModeToggle = document.getElementById('darkModeToggle');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

function setDarkMode(isDark) {
    if (isDark) {
        document.body.classList.add('dark');
        localStorage.setItem('darkMode', 'enabled');
        if (darkModeToggle) darkModeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    } else {
        document.body.classList.remove('dark');
        localStorage.setItem('darkMode', 'disabled');
        if (darkModeToggle) darkModeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    }
}

// Check for saved preference
const savedDarkMode = localStorage.getItem('darkMode');
if (savedDarkMode === 'enabled') {
    setDarkMode(true);
} else if (savedDarkMode === 'disabled') {
    setDarkMode(false);
} else if (prefersDark) {
    setDarkMode(true);
} else {
    setDarkMode(false);
}

if (darkModeToggle) {
    darkModeToggle.addEventListener('click', () => {
        const isDark = document.body.classList.contains('dark');
        setDarkMode(!isDark);
    });
}