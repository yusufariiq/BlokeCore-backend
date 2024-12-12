import express from 'express'
import { addMessage, listMessage } from '../controllers/contactController.js'

const contactRouter = express.Router();

contactRouter.post('/add', addMessage);
contactRouter.get('/list', listMessage);

export default contactRouter;