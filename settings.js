// settings.js
// This file will handle all user-configurable settings, starting with Dark Mode.

document.addEventListener('DOMContentLoaded', () => {
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const THEME_KEY = 'themePreference';

    // Function to apply the theme
    const applyTheme = (theme) => {
        if (theme === 'dark') {
            document.body.classList.add('dark-mode');
            if(darkModeToggle) darkModeToggle.checked = true;
        } else {
            document.body.classList.remove('dark-mode');
            if(darkModeToggle) darkModeToggle.checked = false;
        }
    };

    // Load the saved theme on page load
    const savedTheme = localStorage.getItem(THEME_KEY);
    if (savedTheme) {
        applyTheme(savedTheme);
    }

    // Add event listener to the toggle on the profile page
    if (darkModeToggle) {
        darkModeToggle.addEventListener('change', () => {
            if (darkModeToggle.checked) {
                localStorage.setItem(THEME_KEY, 'dark');
                applyTheme('dark');
            } else {
                localStorage.setItem(THEME_KEY, 'light');
                applyTheme('light');
            }
        });
    }
});
