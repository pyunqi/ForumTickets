import { Router } from 'express';
import { create, getByOrderNo, pay } from '../controllers/orderController';

const router = Router();

router.post('/', create);
router.get('/:orderNo', getByOrderNo);
router.post('/:orderNo/pay', pay);

export default router;
