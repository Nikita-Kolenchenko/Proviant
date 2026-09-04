import Product from "#models/Products.js";

export const getProducts = async (req, res, next) => {
    try {
        const {category, minPrice, maxPrice, sortBy} = req.query;

        const filter = {}

        if (category) filter.categorySlug = category;

        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = Number(minPrice);
            if (maxPrice) filter.price.$lte = Number(maxPrice);
        }

        const sortConfig = {}

        switch (sortBy) {
            case "price_asc":
                sortConfig.price = 1;
                break;
            case "price_desc":
                sortConfig.price = -1;
                break;
            case "discount_asc":
                sortConfig.newPrice = -1;
                break;
            case "newest":
                sortConfig.createdAt = -1;
                break
            case "oldest":
                sortConfig.updatedAt = 1;
                break
            default:
                sortConfig.createdAt = -1;
        }

        const products = await Product.find(filter).sort(sortConfig);

        res.status(200).send({results: products.length, data: products.map((item) => ({
                name: item.name,
                price: item.price,
                newPrice: item.newPrice,
                imageUrl: item.imageUrl
            }))});
    } catch (error) {
        next(error)
    }
}