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
        <div class="rating-actions">
            <button class="like-btn"><i class="fa-solid fa-thumbs-up"></i></button>
            <span class="like-count">0</span>

            <button class="dislike-btn"><i class="fa-solid fa-thumbs-down"></i></button>
            <span class="dislike-count">0</span>
        </div>
        <div class="comment-section">
    <textarea class="comment-input" placeholder="Tulis komentar..."></textarea>
    <button class="submit-comment">Kirim</button>
    <div class="comments-list"></div>
</div>

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
// === LIKE & DISLIKE FUNCTIONALITY ===
document.addEventListener("click", function (e) {
    const likeBtn = e.target.closest(".like-btn");
    const dislikeBtn = e.target.closest(".dislike-btn");

    // LIKE BUTTON CLICKED
    if (likeBtn) {
        const card = likeBtn.closest(".rating-actions");
        const likeCount = card.querySelector(".like-count");
        const dislikeBtnInside = card.querySelector(".dislike-btn");
        const dislikeCount = card.querySelector(".dislike-count");

        // Toggle like
        if (likeBtn.classList.contains("active-like")) {
            likeBtn.classList.remove("active-like");
            likeCount.textContent = parseInt(likeCount.textContent) - 1;
        } else {
            likeBtn.classList.add("active-like");
            likeCount.textContent = parseInt(likeCount.textContent) + 1;

            // Jika dislike aktif → matikan
            if (dislikeBtnInside.classList.contains("active-dislike")) {
                dislikeBtnInside.classList.remove("active-dislike");
                dislikeCount.textContent = parseInt(dislikeCount.textContent) - 1;
            }
        }
    }

    // DISLIKE BUTTON CLICKED
    if (dislikeBtn) {
        const card = dislikeBtn.closest(".rating-actions");
        const dislikeCount = card.querySelector(".dislike-count");
        const likeBtnInside = card.querySelector(".like-btn");
        const likeCount = card.querySelector(".like-count");

        // Toggle dislike
        if (dislikeBtn.classList.contains("active-dislike")) {
            dislikeBtn.classList.remove("active-dislike");
            dislikeCount.textContent = parseInt(dislikeCount.textContent) - 1;
        } else {
            dislikeBtn.classList.add("active-dislike");
            dislikeCount.textContent = parseInt(dislikeCount.textContent) + 1;

            // Jika like aktif → matikan
            if (likeBtnInside.classList.contains("active-like")) {
                likeBtnInside.classList.remove("active-like");
                likeCount.textContent = parseInt(likeCount.textContent) - 1;
            }
        }
    }
});
