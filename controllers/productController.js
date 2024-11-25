import { v2 as cloudinary } from "cloudinary";
import productModel from "../models/productModel.js";
import { nanoid } from "nanoid";

const addProduct = async (req, res) => {
    try {
        // Log entire request body for debugging
        console.log('Request Body:', JSON.stringify(req.body, null, 2));
        
         // Attempt to parse details if it's a string
        let details = req.body.details;
        if (typeof details === 'string') {
            try {
                details = JSON.parse(details);
            } catch (parseError) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid details format. Must be a valid JSON object.",
                });
            }
        }

        // Attempt to parse metadata if it's a string
        let metadata = req.body.metadata;
        if (typeof metadata === 'string') {
            try {
                metadata = JSON.parse(metadata);
            } catch (parseError) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid metadata format. Must be a valid JSON object.",
                });
            }
        }

        const yearValue = details?.year ? parseInt(details.year, 10) : undefined;
        if (!yearValue || isNaN(yearValue)) {
            return res.status(400).json({
                success: false,
                message: "Year must be a valid number",
                receivedYear: details?.year,
                yearType: typeof details?.year
            });
        }

        const {
            name,
            description,
            price,
            category,
            subCategory,
            imageAlt,
        } = req.body;

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
            id: nanoid(8),
            name: name,
            description: description || '',
            price: parseFloat(price),
            images: imagesUrl,
            imageAlt: imageAlt || '',
            category: category,
            subCategory: subCategory,
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
                season: metadata.season
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
        await productModel.findByIdAndDelete(req.body.id)
        res.json({success:true, message: "Product successfully removed"})
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
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

export { addProduct, listProduct, removeProduct, singleProduct }