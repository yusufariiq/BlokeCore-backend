import express from 'express'
import { addProduct, listProduct, removeProduct, updateProduct, singleProduct } from '../controllers/productController.js'
import upload from '../middleware/multer.js';
import authenticateAdmin from '../middleware/authAdmin.js';

const productRouter = express.Router();

productRouter.post('/add',
    authenticateAdmin,
    upload.fields([
        {name:'image1', maxCount:1},
        {name:'image2', maxCount:1},
        {name:'image3', maxCount:1},
        {name:'image4', maxCount:1}
    ]),
    addProduct
);

productRouter.post('/update/:id',
    authenticateAdmin,
    upload.fields([
        {name:'image1', maxCount:1},
        {name:'image2', maxCount:1},
        {name:'image3', maxCount:1},
        {name:'image4', maxCount:1}
    ]),
    updateProduct
);

productRouter.post('/remove', authenticateAdmin, removeProduct);
productRouter.post('/single', singleProduct);
productRouter.get('/list', listProduct);

export default productRouter;