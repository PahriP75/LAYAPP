document.addEventListener("DOMContentLoaded", async () => {
    const params = new URLSearchParams(window.location.search);
    const idParam = params.get("id");

    // ✅ Step 1: Check if ID exists
    if (!idParam) {
        document.body.innerHTML = `
            <h2 style="text-align:center; margin-top: 50px;">Tidak ada resep yang dipilih.</h2>
            <p style="text-align:center;"><a href="/index.html">Kembali ke beranda</a></p>
        `;
        return;
    }

    const id = parseInt(idParam);

    try {
        // ✅ Step 2: Fetch recipe data
        const res = await fetch("/api/recipes");
        if (!res.ok) throw new Error("Gagal memuat data resep.");

        const recipes = await res.json();
        const recipe = recipes.find(r => r.id === id);

        // ✅ Step 3: Handle recipe not found
        if (!recipe) {
            document.body.innerHTML = `
                <h2 style="text-align:center; margin-top: 50px;">Resep tidak ditemukan.</h2>
                <p style="text-align:center;"><a href="/index.html">Kembali ke beranda</a></p>
            `;
            return;
        }

        // ✅ Step 4: Populate data
        document.getElementById("recipe-title").textContent = recipe.title;
        document.getElementById("recipe-description").textContent = recipe.description;
        document.getElementById("recipe-image").src = recipe.image;
        document.getElementById("recipe-meta").textContent = recipe.category.toUpperCase();
        document.getElementById("recipe-servings").textContent = recipe.servings || "-";
        document.getElementById("recipe-time").textContent = recipe.time || "-";
        document.getElementById("recipe-difficulty").textContent = recipe.difficulty || "-";
        document.getElementById("recipe-calories").textContent = recipe.calories || "350 kcal";

        const ingredients = recipe.ingredients || [
            "1 ekor ayam utuh",
            "2 sdm minyak zaitun",
            "1 sdt garam",
            "1 sdt lada hitam",
            "Herba segar sesuai selera"
        ];

        const steps = recipe.steps || [
            "Panaskan oven pada suhu 180°C.",
            "Lumuri ayam dengan bumbu dan minyak zaitun.",
            "Panggang selama 40 menit hingga matang sempurna.",
            "Sajikan hangat dengan taburan herba segar."
        ];

        const ingredientsList = document.getElementById("ingredients-list");
        ingredients.forEach(item => {
            const li = document.createElement("li");
            li.textContent = item;
            ingredientsList.appendChild(li);
        });

        const stepsList = document.getElementById("steps-list");
        steps.forEach(step => {
            const li = document.createElement("li");
            li.textContent = step;
            stepsList.appendChild(li);
        });``

    } catch (err) {
        document.body.innerHTML = `
            <h2 style="text-align:center; margin-top: 50px;">Terjadi kesalahan saat memuat resep.</h2>
            <p style="text-align:center; color:red;">${err.message}</p>
        `;
        console.error(err);
    }
});
