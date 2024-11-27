import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    id: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
      index: true,
    },
    description: {
      type: String,
      default: '',
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    images: {
      type: [String],
      required: true,
    },
    category: {
      type: String,
      required: true,
      index: true,
    },
    subCategory: {
      type: String,
      required: true,
      index: true,
    },
    details: {
      year: {
        type: Number,
        required: true,
      },
      condition: {
        type: String,
        required: true,
        enum: ['Brand New', 'Excvelent', 'Very Good', 'Good', 'Mint'],
      },
      size: {
        type: [String],
        required: true,
        enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
      },
      brand: {
        type: String,
        required: true,
        default: '',
      },
      type: {
        type: String,
        required: true,
      },
      isAuthentic: {
        type: Boolean,
        required: true,
        default: false,
      },
      isVintage: {
        type: Boolean,
        required: true,
        default: false,
      },
      isLatest: {
        type: Boolean,
        required: true,
        default: false,
      },
    },
    metadata: {
      team: {
        type: String,
        required: true,
        index: true,
      },
      league: {
        type: String,
        required: true,
        index: true,
      },
      season: {
        type: String,
        required: true,
      },
    },
  }, {
    timestamps: true, 
    versionKey: false,
  });

const productModel = mongoose.models.product || mongoose.model('product', productSchema);

export default productModel;