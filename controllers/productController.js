import { v2 as cloudinary } from "cloudinary";
import productModel from "../models/productModel.js";
import { nanoid } from "nanoid";

const addProduct = async (req, res) => {
    try {
        // Log entire request body for debugging
        console.log('Request Body:', JSON.stringify(req.body, null, 2));
        console.log('Uploaded Files:', req.files);
        
        let details = JSON.parse(req.body.details);

        const yearValue = details?.year ? parseInt(details.year, 10) : undefined;
        if (!yearValue || isNaN(yearValue)) {
            return res.status(400).json({
                success: false,
                message: "Year must be a valid number",
                receivedYear: details?.year,
                yearType: typeof details?.year
            });
        }

        const metadata = JSON.parse(req.body.metadata);

        // Handle image uploads
        const image1 = req.files.image1 && req.files.image1[0];
        const image2 = req.files.image2 && req.files.image2[0];
        const image3 = req.files.image3 && req.files.image3[0];
        const image4 = req.files.image4 && req.files.image4[0];
        
        // Filter out undefined images
        const images = [image1, image2, image3, image4].filter(item => item !== undefined);

        // Upload images to Cloudinary and get URLs
        const imagesUrl = await Promise.all(
            images.map(async (item) => {
                const result = await cloudinary.uploader.upload(item.path, {
                    resource_type: "image"
                });
                return result.secure_url;
            })
        );

        // Validate required details and metadata
        const requiredDetailsFields = ['condition', 'type', 'brand'];
        const missingDetailsFields = requiredDetailsFields.filter(field => !details[field]);
        if (missingDetailsFields.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Missing required details fields: ${missingDetailsFields.join(', ')}`
            });
        }

        const requiredMetadataFields = ['team', 'league', 'season'];
        const missingMetadataFields = requiredMetadataFields.filter(field => !metadata[field]);
        if (missingMetadataFields.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Missing required metadata fields: ${missingMetadataFields.join(', ')}`
            });
        }

        // Create new product document
        const newProduct = new productModel({
            id: `PRD-${nanoid(4)}-${nanoid(4)}`,
            name: req.body.name,
            description: req.body.description || '',
            price: parseFloat(req.body.price),
            images: imagesUrl,
            category: req.body.category,
            subCategory: req.body.subCategory,
            details: {
                year: yearValue,
                condition: details.condition,
                size: details.size,
                brand: details.brand,
                type: details.type,
                isAuthentic: Boolean(details.isAuthentic),
                isVintage: Boolean(details.isVintage),
                isLatest: Boolean(details.isLatest)
            },
            metadata: {
                team: metadata.team,
                league: metadata.league,
                season: metadata.season,
            }
        });

        // Save the product to database
        const savedProduct = await newProduct.save();

        // Send success response
        res.status(201).json({
            success: true,
            message: "Product added successfully",
            product: savedProduct
        });

    } catch (error) {
        console.error('Error in addProduct:', error);
        // Handle other errors
        res.status(500).json({
            success: false,
            message: error.message,
            stack: error.stack
        });
    }
};

const listProduct = async (req, res) => {
    try {
        const product = await productModel.find({});
        res.json({success:true, product});
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}

const removeProduct = async (req, res) => {
    try {
        console.log('Received product ID to remove:', req.body.id);
        const deletedProduct = await productModel.findOneAndDelete({ id: req.body.id });
        
        if (!deletedProduct) {
            return res.status(404).json({
                success: false, 
                message: "Product not found"
            });
        }
        res.json({success:true, message: "Product successfully removed"})
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}

const updateProduct = async (req, res) => {
    try {
        const{id} = req.params;
        let updateData = { ...req.body };

        if (typeof updateData.details === 'string') {
            updateData.details = JSON.parse(updateData.details);
        }
        if (typeof updateData.metadata === 'string') {
            updateData.metadata = JSON.parse(updateData.metadata);
        }

        if (updateData.details && updateData.details.condition) {
            updateData.details.condition = updateData.details.condition
                .split(' ')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                .join(' ');
        }

        const newImages = [];
        for (let i = 1; i <= 4; i++) {
            const image = req.files[`image${i}`] && req.files[`image${i}`][0];
            if (image) {
                const result = await cloudinary.uploader.upload(image.path, {
                    resource_type: 'image'
                });
                newImages.push(result.secure_url);
            }
        }

        // Only update images if new images were uploaded
        if (newImages.length > 0) {
            updateData.images = newImages;
        }

        const updatedProduct = await productModel.findOneAndUpdate(
            { id: id },
            updateData,
            { new: true, runValidators: true }
        );

        if (!updatedProduct) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        res.json({
            success: true,
            message: "Product updated successfully",
            product: updatedProduct
        });
        
    } catch (error) {
        console.error('Error in updateProduct:', error);
        res.status(500).json({
            success: false,
            message: error.message,
            stack: error.stack
        });
    }
}

const singleProduct = async (req, res) => {
    try {
        const { productId } = req.body
        const product = await productModel.findById(productId)
        res.json({success: true, product})
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}

const searchProducts = async (req, res) => {
    try {
        const { q } = req.query;

        if (!q){
            return res.status(400).json({
                success: false,
                message: "Search query is required"
            })
        }

        const searchRegex = new RegExp(q, 'i');

        const products = await productModel.find({
            $or: [
                { name: searchRegex },
                { description: searchRegex },
                { category: searchRegex },
                { subCategory: searchRegex },
                { 'details.brand': searchRegex },
                { 'details.type': searchRegex },
                { 'metadata.team': searchRegex },
                { 'metadata.league': searchRegex },
            ]
        });

        res.json({
            success: true,
            products: products,
            resultCount: products.length
        });
    } catch (error) {
        console.error('Error in searchProducts:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

export { 
    addProduct,
    listProduct,
    removeProduct,
    updateProduct,
    searchProducts,
    singleProduct,
}