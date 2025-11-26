import supabase from './client.js';

document.addEventListener('DOMContentLoaded', async () => {
    const grid = document.getElementById('favorite-recipes-grid');

    // Check auth
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        window.location.href = 'login.html';
        return;
    }
    const userEmail = user.email;

    try {
        // Fetch all recipes
        const response = await fetch('/api/recipes');
        if (!response.ok) throw new Error('Gagal mengambil data resep');

        const allRecipes = await response.json();

        // Get user's favorites from localStorage
        // Note: Favorites are stored in localStorage for now
        const favorites = JSON.parse(localStorage.getItem(`favorites_${userEmail}`)) || [];

        const favoriteRecipes = allRecipes.filter(recipe => favorites.includes(recipe.id.toString()) || favorites.includes(recipe.id));

        grid.innerHTML = '';

        if (favoriteRecipes.length === 0) {
            grid.innerHTML = '<p class="no-recipes">Anda belum memiliki resep favorite.</p>';
            return;
        }

        favoriteRecipes.forEach(recipe => {
            const card = document.createElement('div');
            card.className = 'recipe-card';
            card.innerHTML = `
                <img src="${recipe.image}" alt="${recipe.title}" onerror="this.onerror=null; this.src='https://placehold.co/400x200?text=No+Image';">
                <div class="card-content">
                    <h3>${recipe.title}</h3>
                    <p>${recipe.description ? recipe.description.substring(0, 100) + '...' : ''}</p>
                    <div class="recipe-meta">
                        <span><i class="far fa-clock"></i> ${recipe.time || '-'}</span>
                        <span><i class="fas fa-user-friends"></i> ${recipe.servings || '-'}</span>
                    </div>
                    <a href="recipe.html?id=${recipe.id}" class="btn-view" style="display: block; text-align: center; margin-top: 10px; background: var(--primary-color); color: white; padding: 10px; border-radius: 25px; text-decoration: none;">Lihat Resep</a>
                </div>
            `;
            grid.appendChild(card);
        });

    } catch (error) {
        console.error('Error fetching recipes:', error);
        grid.innerHTML = '<p class="error-text">Gagal memuat resep favorite.</p>';
    }
});
