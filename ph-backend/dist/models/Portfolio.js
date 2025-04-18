"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
// Schema for image objects
const ImageObjectSchema = new mongoose_1.Schema({
    url: { type: String, required: true },
    publicId: { type: String, required: true },
}, { _id: false });
const PortfolioSchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true,
        maxlength: 100,
    },
    subtitle: {
        type: String,
        trim: true,
        maxlength: 200,
    },
    subdomain: {
        type: String,
        required: [true, 'Subdomain is required'],
        trim: true,
        lowercase: true,
        unique: true,
        match: [/^[a-z0-9-]{3,30}$/, 'Subdomain can only contain lowercase letters, numbers, and hyphens'],
    },
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required'],
    },
    templateId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Template',
    },
    content: {
        type: mongoose_1.Schema.Types.Mixed,
        default: {},
    },
    // Add fields for storing images with their Cloudinary public IDs
    headerImage: {
        type: ImageObjectSchema,
    },
    galleryImages: {
        type: [ImageObjectSchema],
        default: [],
    },
    isPublished: {
        type: Boolean,
        default: false,
    },
    viewCount: {
        type: Number,
        default: 0,
    },
    customDomain: {
        type: String,
        trim: true,
        lowercase: true,
        sparse: true,
    },
}, {
    timestamps: true,
});
// Create indexes
PortfolioSchema.index({ userId: 1 });
PortfolioSchema.index({ subdomain: 1 }, { unique: true });
PortfolioSchema.index({ customDomain: 1 }, { sparse: true, unique: true });
const Portfolio = mongoose_1.default.model('Portfolio', PortfolioSchema);
exports.default = Portfolio;
