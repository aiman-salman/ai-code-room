import { Router } from "express";
import * as userController from "../controllers/user.controller.js";
import { body } from "express-validator";
import * as authMiddleWare from "../middleware/auth.middleware.js"

const router = Router();

  router.post("/register",
    body("email").isEmail().withMessage("Email must be a valid address"),
    body("password")
      .isLength({ min: 3 })
      .withMessage("Password must be atlaest 6 characters long"),
    userController.createUserController
  );

  router.post("/login",
    body("email").isEmail().withMessage("Email must be a valid address"),
    body("password")
      .isLength({ min: 3 })
      .withMessage("Password must be atlaest 6 characters long"),
    userController.loginController
  );

  router.get("/profile",
    authMiddleWare.authUser,
    userController.profileController
  );

  router.get("/logout",
    authMiddleWare.authUser,
    userController.logoutController
  );

  router.get('/all',
    authMiddleWare.authUser,
    userController.getAllUsersController
  );

  router.get('/validate-token', authMiddleWare.authUser, (req, res) => {
    return res.status(200).json({ isValid: true });
  });


export default router;
