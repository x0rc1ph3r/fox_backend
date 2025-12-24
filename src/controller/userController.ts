//userController
import { Request, response, Response } from "express";
import {
  validatePublicKey,
  generateAuthMessage,
  verifySignature,
  verifyNonce,
  findOrCreateUser,
} from "../helpers/user/authHelpers";
import logger from "../utils/logger";
import { responseHandler } from "../utils/resHandler";
import { authVerifySchema } from "../schemas";
import jwt from "jsonwebtoken";

export default {
  requestMessage: async (req: Request, res: Response) => {
    try {
      const publicKey = req.params.publicKey;
      validatePublicKey(publicKey);
      const payload = await generateAuthMessage(publicKey);
      return responseHandler.success(res,payload);
    } catch (e) {
      logger.error(e);
      responseHandler.error(res, e);
    }
  },

  verifyMessage: async (req: Request, res: Response) => {
    const data = req.body;
    const { success, data: parsedData } = authVerifySchema.safeParse(data);
    
    try {
      
      if (!success) {
        throw "Invalid payload"
      }
      
      const { publicKey, signature, message } = parsedData;
      
      await verifySignature(publicKey, signature, message);
      const nonce = message.split("Nonce:")[1].trim();

      if (!nonce) {
        throw "Missing nonce"
      }

      await verifyNonce(nonce, publicKey);

      const { user,token } = await findOrCreateUser(publicKey);
      
      return responseHandler.success(res,{
        message: "Signature verified",
        error: null,
        token,
        user,
      });
    } catch (e) {
      logger.error(e);
      return responseHandler.error(res, e);
    }
  },
  refreshToken: async(req:Request,res:Response)=>{
    const token = req.headers?.authorization?.split(" ")[1];
    try {
      const decoded = jwt.verify(
          token!, 
          process.env.JWT_SECRET as string,
          { ignoreExpiration: true } 
      ) as { publicKey: string, userId: string };

      const newToken = jwt.sign(
          { 
              publicKey: decoded.publicKey, 
              userId: decoded.userId 
          },
          process.env.JWT_SECRET as string,
          { expiresIn: '7d' } 
      );

      res.json({ token: newToken });
  } catch (error) {
      console.error(error);
      return res.status(401).json({ message: "Invalid token" });
  }

  }
};
