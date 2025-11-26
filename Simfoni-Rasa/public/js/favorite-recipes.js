import { getRecipes } from './script.js';

document.addEventListener('DOMContentLoaded', async () => {
    const grid = document.getElementById('favorite-recipes-grid');
    const userEmail = localStorage.getItem('userEmail');

    if (!userEmail) {
        window.location.href = 'login.html';
        return;
    }

    try {
        const allRecipes = await getRecipes();
        // Get user's favorites from localStorage
        const favorites = JSON.parse(localStorage.getItem(`favorites_${userEmail}`)) || [];

        const favoriteRecipes = allRecipes.filter(recipe => favorites.includes(recipe.id));

        grid.innerHTML = '';

        if (favoriteRecipes.length === 0) {
            grid.innerHTML = '<p class="no-recipes">Anda belum memiliki resep favorite.</p>';
            return;
        }

        favoriteRecipes.forEach(recipe => {
            const card = document.createElement('div');
            card.className = 'recipe-card';
            card.innerHTML = `
                <img src="${recipe.image}" alt="${recipe.title}">
                <div class="card-content">
                    <h3>${recipe.title}</h3>
                    <p>${recipe.description.substring(0, 100)}...</p>
                    <div class="recipe-meta">
                        <span><i class="far fa-clock"></i> ${recipe.time}</span>
                        <span><i class="fas fa-user-friends"></i> ${recipe.servings} Porsi</span>
                    </div>
                    <a href="recipe.html?id=${recipe.id}" class="btn-view">Lihat Resep</a>
                </div>
            `;
            grid.appendChild(card);
        });

    } catch (error) {
        console.error('Error fetching recipes:', error);
        grid.innerHTML = '<p class="error-text">Gagal memuat resep favorite.</p>';
    }
});
