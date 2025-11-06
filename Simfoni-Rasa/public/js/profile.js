// Import the Supabase client, just like in auth.js
import supabase from './client.js';

// Wait for the HTML document to be fully loaded
document.addEventListener('DOMContentLoaded', async () => {

    // 1. Check who is logged in
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
        // 2. If a user is logged in, show their email
        const userEmailElement = document.getElementById('user-email');
        if (userEmailElement) {
            userEmailElement.textContent = user.email;
        }
    } else {
        // 3. If no user is logged in, send them to the login page
        console.log('Tidak ada pengguna yang login, mengalihkan ke login.html');
        window.location.href = 'login.html';
    }

    // 4. Add logic for the logout button
    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', async (e) => {
            e.preventDefault();
            
            // Sign out from Supabase
            const { error } = await supabase.auth.signOut();
            
            if (error) {
                console.error('Error saat logout:', error.message);
            } else {
                // On successful logout, send user back to the home page
                console.log('Logout berhasil, mengalihkan ke index.html');
                window.location.href = 'index.html';
            }
        });
    }
});