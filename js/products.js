/* =========================================================
   Timmy's Yummy Bakes - product data
   Single source of truth for the menu page and enquiry form.
   To add a product, copy one object and change its values.
   image: base file name in images/ (a "-480" thumbnail must exist)
   width: pixel width of the full-size image (used for srcset)
   ========================================================= */

var PRODUCTS = [
    {
        id: "vanilla-caramel-cake",
        name: "Vanilla Sponge Cake with Caramel Filling",
        category: "cakes",
        price: 200,
        unit: "whole cake",
        description: "Light vanilla sponge layered with a smooth caramel filling. A crowd-pleasing classic for birthdays and family celebrations.",
        tags: ["birthday", "celebration", "caramel", "classic"],
        image: "vanilla-sponge-cake-layers",
        width: 736,
        alt: "Three golden vanilla sponge cake layers cooling on a wire rack"
    },
    {
        id: "chocolate-ganache-cake",
        name: "Chocolate Cake with Chocolate Ganache Filling",
        category: "cakes",
        price: 250,
        unit: "whole cake",
        description: "Rich, moist chocolate sponge filled with silky chocolate ganache. Made for serious chocolate lovers.",
        tags: ["chocolate", "birthday", "graduation", "celebration"],
        image: "chocolate-sponge-cake-layers",
        width: 736,
        alt: "Two dark chocolate sponge cake layers with scored tops on a cooling rack"
    },
    {
        id: "red-velvet-cake",
        name: "Red Velvet Cake with Cream Cheese Filling",
        category: "cakes",
        price: 280,
        unit: "whole cake",
        description: "Soft red velvet layers with a tangy cream cheese filling. A show-stopping centrepiece for baby showers and special occasions.",
        tags: ["red velvet", "cream cheese", "baby shower", "celebration"],
        image: "red-velvet-sponge-cake-layers",
        width: 736,
        alt: "Two bright red velvet sponge cake layers cooling on a wire rack"
    },
    {
        id: "vanilla-cupcakes",
        name: "Classic Vanilla Cupcakes",
        category: "cupcakes",
        price: 60,
        unit: "box of 6",
        description: "Fluffy vanilla cupcakes topped with a generous swirl of buttercream and rainbow sprinkles.",
        tags: ["vanilla", "sprinkles", "kids", "party"],
        image: "rainbow-sprinkle-vanilla-cupcakes",
        width: 736,
        alt: "Vanilla cupcakes topped with swirled white buttercream and rainbow sprinkles"
    },
    {
        id: "chocolate-cupcakes",
        name: "Chocolate Cupcakes",
        category: "cupcakes",
        price: 65,
        unit: "box of 6",
        description: "Moist chocolate cupcakes finished with glossy chocolate ganache and chocolate shavings.",
        tags: ["chocolate", "ganache", "party"],
        image: "chocolate-ganache-and-lemon-cupcakes",
        width: 566,
        alt: "Cupcakes topped with chocolate ganache and shavings beside lemon and strawberry cupcakes"
    },
    {
        id: "lemon-poppy-seed-cupcakes",
        name: "Lemon Poppy Seed Cupcakes",
        category: "cupcakes",
        price: 65,
        unit: "box of 6",
        description: "Zesty lemon cupcakes with poppy seeds and a light lemon buttercream. Fresh, bright and not too sweet.",
        tags: ["lemon", "citrus", "fruity"],
        image: "assorted-gourmet-cupcakes-gift-box",
        width: 736,
        alt: "Gift box of assorted cupcakes with lemon, strawberry, chocolate and cookies-and-cream toppings"
    },
    {
        id: "chocolate-chip-biscuits",
        name: "Chocolate Chip Biscuits",
        category: "biscuits",
        price: 100,
        unit: "dozen",
        description: "Golden, chewy-centred biscuits loaded with chocolate chips. Perfect for lunch boxes and tea time.",
        tags: ["chocolate", "cookies", "lunch box"],
        image: "chocolate-chip-and-oat-cookies",
        width: 490,
        alt: "Rows of golden chocolate chip and oat cookies on a serving platter"
    },
    {
        id: "ginger-biscuits",
        name: "Ginger Biscuits",
        category: "biscuits",
        price: 100,
        unit: "dozen",
        description: "Crunchy, gently spiced ginger biscuits. Lovely with a cup of rooibos.",
        tags: ["ginger", "spiced", "crunchy", "tea time"],
        image: "assorted-homemade-cookies-platter",
        width: 736,
        alt: "Platter of assorted homemade cookies arranged in rows"
    },
    {
        id: "coconut-biscuits",
        name: "Coconut Biscuits",
        category: "biscuits",
        price: 100,
        unit: "dozen",
        description: "Buttery biscuits packed with toasted coconut, crisp on the outside and soft inside.",
        tags: ["coconut", "buttery", "tea time"],
        image: "candy-coated-chocolate-cookies",
        width: 480,
        alt: "Cookies studded with colourful candy-coated chocolates above a row of double chocolate cookies"
    }
];

var CATEGORY_LABELS = {
    cakes: "Cakes",
    cupcakes: "Cupcakes",
    biscuits: "Biscuits"
};

function findProduct(id) {
    for (var i = 0; i < PRODUCTS.length; i++) {
        if (PRODUCTS[i].id === id) return PRODUCTS[i];
    }
    return null;
}

function formatRand(amount) {
    return "R" + amount.toLocaleString("en-ZA", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}
