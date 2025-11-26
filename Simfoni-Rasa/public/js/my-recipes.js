import { getRecipes, deleteRecipe } from './script.js';

document.addEventListener('DOMContentLoaded', async () => {
    const grid = document.getElementById('my-recipes-grid');
    const userEmail = localStorage.getItem('userEmail');

    if (!userEmail) {
        window.location.href = 'login.html';
        return;
    }

    try {
        const allRecipes = await getRecipes();
        // Filter recipes where the author matches the logged-in user's email
        // Note: In a real app, this filtering should happen on the server side
        const myRecipes = allRecipes.filter(recipe => recipe.author === userEmail);

        grid.innerHTML = '';

        if (myRecipes.length === 0) {
            grid.innerHTML = '<p class="no-recipes">Anda belum menambahkan resep.</p>';
            return;
        }

        myRecipes.forEach(recipe => {
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
                    <div class="card-actions" style="display: flex; gap: 10px; margin-top: 10px;">
                         <a href="recipe.html?id=${recipe.id}" class="btn-view" style="flex: 1;">Lihat</a>
                         <button class="btn-delete" data-id="${recipe.id}" style="background: #e74c3c; color: white; border: none; padding: 10px; border-radius: 25px; cursor: pointer;">
                            <i class="fas fa-trash"></i>
                         </button>
                    </div>
                </div>
            `;
            grid.appendChild(card);
        });

        // Add event listeners for delete buttons
        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                if (confirm('Apakah Anda yakin ingin menghapus resep ini?')) {
                    const id = e.target.closest('button').dataset.id;
                    const success = await deleteRecipe(id);
                    if (success) {
                        alert('Resep berhasil dihapus');
                        location.reload();
                    } else {
                        alert('Gagal menghapus resep');
                    }
                }
            });
        });

    } catch (error) {
        console.error('Error fetching recipes:', error);
        grid.innerHTML = '<p class="error-text">Gagal memuat resep.</p>';
    }
});
