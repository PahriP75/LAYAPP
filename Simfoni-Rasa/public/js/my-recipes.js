import supabase from './client.js';

document.addEventListener('DOMContentLoaded', async () => {
    const grid = document.getElementById('my-recipes-grid');

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

        // Filter recipes by author
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
                <img src="${recipe.image}" alt="${recipe.title}" onerror="this.onerror=null; this.src='https://placehold.co/400x200?text=No+Image';">
                <div class="card-content">
                    <h3>${recipe.title}</h3>
                    <p>${recipe.description ? recipe.description.substring(0, 100) + '...' : ''}</p>
                    <div class="recipe-meta">
                        <span><i class="far fa-clock"></i> ${recipe.time || '-'}</span>
                        <span><i class="fas fa-user-friends"></i> ${recipe.servings || '-'}</span>
                    </div>
                    <div class="card-actions" style="display: flex; gap: 10px; margin-top: 10px;">
                         <a href="recipe.html?id=${recipe.id}" class="btn-view" style="flex: 1; text-align: center; background: var(--primary-color); color: white; padding: 10px; border-radius: 25px; text-decoration: none;">Lihat</a>
                         <button class="btn-delete" data-id="${recipe.id}" style="background: #e74c3c; color: white; border: none; padding: 10px 15px; border-radius: 25px; cursor: pointer;">
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
                    const btnElement = e.target.closest('button');
                    const id = btnElement.dataset.id;

                    try {
                        const res = await fetch(`/api/recipes?id=${id}`, { method: 'DELETE' });
                        if (res.ok) {
                            alert('Resep berhasil dihapus');
                            location.reload();
                        } else {
                            const data = await res.json();
                            alert('Gagal menghapus resep: ' + (data.error || 'Unknown error'));
                        }
                    } catch (err) {
                        console.error('Error deleting recipe:', err);
                        alert('Terjadi kesalahan saat menghapus resep.');
                    }
                }
            });
        });

    } catch (error) {
        console.error('Error fetching recipes:', error);
        grid.innerHTML = '<p class="error-text">Gagal memuat resep.</p>';
    }
});
