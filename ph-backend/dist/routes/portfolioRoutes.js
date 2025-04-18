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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const portfolioController_1 = require("../controllers/portfolioController");
const auth_1 = require("../middleware/auth");
const upload_1 = __importStar(require("../middleware/upload"));
const router = express_1.default.Router();
// Public routes
router.get('/subdomain/:subdomain', portfolioController_1.getPortfolioBySubdomain);
// Protected routes
router.use(auth_1.auth); // All routes below this line require authentication
router.route('/')
    .get(portfolioController_1.getUserPortfolios)
    .post(portfolioController_1.createPortfolio);
router.route('/:id')
    .get(portfolioController_1.getPortfolioById)
    .put(portfolioController_1.updatePortfolio)
    .delete(portfolioController_1.deletePortfolio);
// Image upload/delete routes
router.post('/:id/upload-image', upload_1.default.single('image'), upload_1.handleMulterError, portfolioController_1.uploadPortfolioImage);
router.delete('/:id/delete-image/:imageId', portfolioController_1.deletePortfolioImage);
exports.default = router;
