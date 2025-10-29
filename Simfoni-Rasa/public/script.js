let allRecipes = [];

// DOM references
const recipeGrid = document.getElementById("recipe-grid");
const loadingMessage = document.getElementById("loading-message");
const filterButtons = document.querySelectorAll(".filter-btn");

// ✅ Function: Create recipe card HTML
function createRecipeCard(recipe) {
    return `
    <article class="recipe-card" data-kategori="${recipe.category}" data-id="${recipe.id}">
      <div class="recipe-image">
        <img src="${recipe.image}" 
             alt="${recipe.title}"
             onerror="this.onerror=null; this.src='https://placehold.co/400x200/cccccc/000000?text=Image+Missing';">
      </div>
      <div class="card-content">
        <h3>${recipe.title}</h3>
        <p>${recipe.description}</p>
        <div class="recipe-meta">
          <span>${recipe.time}</span>
          <span>${recipe.difficulty}</span>
          <span>${recipe.servings}</span>
        </div>
        <a href="#" class="btn-view">Lihat Resep</a>
      </div>
    </article>
  `;
}


// ✅ Function: Render recipes to DOM
function renderRecipes(recipesToDisplay) {
    recipeGrid.innerHTML = "";

    if (!recipesToDisplay.length) {
        recipeGrid.innerHTML = '<p class="text-center">Tidak ada resep untuk kategori ini.</p>';
        return;
    }

    const fragment = document.createDocumentFragment();

    recipesToDisplay.forEach(recipe => {
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = createRecipeCard(recipe);
        const card = tempDiv.querySelector(".recipe-card");

        if (card) fragment.appendChild(card);
    });

    recipeGrid.appendChild(fragment);

    // Add redirect behavior

}

// ✅ Function: Filter recipes
function handleFilter(category) {
    if (category === "all" || category === "semua") {
        renderRecipes(allRecipes);
    } else {
        const filtered = allRecipes.filter(r =>
            r.category.toLowerCase().includes(category.toLowerCase())
        );
        renderRecipes(filtered);
    }
}

// ✅ Fetch recipes and initialize
async function fetchRecipes() {
    if (loadingMessage) loadingMessage.textContent = "Memuat resep...";

    try {
        const res = await fetch("/api/recipes");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        allRecipes = await res.json();

        renderRecipes(allRecipes);
    } catch (err) {
        console.error("Gagal memuat resep:", err);
        recipeGrid.innerHTML = `<p class="error-message">Gagal memuat resep (${err.message})</p>`;
    } finally {
        if (loadingMessage) loadingMessage.remove();
    }
}

// ✅ Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
    fetchRecipes();

    // Filter button logic
    filterButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            filterButtons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            const category = btn.dataset.category;
            handleFilter(category);
        });
    }); // <-- The filterButtons.forEach block ends here.

    // ✅ Add redirect behavior using event delegation
    // This should be OUTSIDE and AFTER the forEach block
    recipeGrid.addEventListener("click", e => {
        // Check if the clicked element or its parent is the button
        const button = e.target.closest(".btn-view");

        if (button) {
            e.preventDefault(); // Stop the link from navigating to "#"

            // Find the closest parent <article> tag
            const card = button.closest(".recipe-card");

            if (card) {
                // Get the id from the card's data-id attribute
                const id = card.dataset.id;
                window.location.href = `/recipe.html?id=${id}`;
            }
        }
    });
});