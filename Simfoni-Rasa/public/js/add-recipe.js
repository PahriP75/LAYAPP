import supabase from './client.js';

document.addEventListener('DOMContentLoaded', async () => {
    // Check auth
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        window.location.href = 'login.html';
        return;
    }

    // Dynamic Ingredients
    const ingredientsList = document.getElementById('ingredients-list');
    const addIngredientBtn = document.getElementById('add-ingredient-btn');

    addIngredientBtn.addEventListener('click', () => {
        const div = document.createElement('div');
        div.className = 'dynamic-list-item';
        div.innerHTML = `
            <input type="text" name="ingredients[]" required placeholder="Bahan...">
            <button type="button" class="remove-btn"><i class="fa-solid fa-trash"></i></button>
        `;
        ingredientsList.appendChild(div);

        div.querySelector('.remove-btn').addEventListener('click', () => {
            div.remove();
        });
    });

    // Dynamic Steps
    const stepsList = document.getElementById('steps-list');
    const addStepBtn = document.getElementById('add-step-btn');

    addStepBtn.addEventListener('click', () => {
        const div = document.createElement('div');
        div.className = 'dynamic-list-item';
        div.innerHTML = `
            <input type="text" name="steps[]" required placeholder="Langkah...">
            <button type="button" class="remove-btn"><i class="fa-solid fa-trash"></i></button>
        `;
        stepsList.appendChild(div);

        div.querySelector('.remove-btn').addEventListener('click', () => {
            div.remove();
        });
    });

    // Form Submission
    const form = document.getElementById('add-recipe-form');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(form);

        // Collect ingredients and steps as arrays
        const ingredients = [];
        document.querySelectorAll('input[name="ingredients[]"]').forEach(input => {
            if (input.value.trim()) ingredients.push(input.value.trim());
        });

        const steps = [];
        document.querySelectorAll('input[name="steps[]"]').forEach(input => {
            if (input.value.trim()) steps.push(input.value.trim());
        });

        const recipeData = {
            title: formData.get('title'),
            description: formData.get('description'),
            image: formData.get('image') || 'images/default-recipe.png', // Fallback image
            category: formData.get('category'),
            time: formData.get('time'),
            servings: formData.get('servings'),
            difficulty: formData.get('difficulty'),
            ingredients: ingredients,
            steps: steps,
            calories: formData.get('calories'),
            author: user.email
        };

        try {
            const response = await fetch('/api/recipes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(recipeData)
            });

            if (response.ok) {
                alert('Resep berhasil ditambahkan!');
                window.location.href = 'profile.html';
            } else {
                const errorData = await response.json();
                alert('Gagal menambahkan resep: ' + (errorData.error || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error submitting recipe:', error);
            alert('Terjadi kesalahan saat menghubungi server.');
        }
    });
});
