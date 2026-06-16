import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import productsRouter from "./products";
import ticketsRouter from "./tickets";
import newsRouter from "./news";
import statsRouter from "./stats";
import uploadRouter from "./upload";
import usersRouter from "./users";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(productsRouter);
router.use(ticketsRouter);
router.use(newsRouter);
router.use(statsRouter);
router.use(uploadRouter);
router.use(usersRouter);

export default router;
