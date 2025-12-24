import express from "express";
import userController from "../controller/userController";
import passport from "../config/passportConfig";
import { Session } from "express-session";
import authMiddleware from "../middleware/authMiddleware";

const userRouter = express.Router();

// ==================== AUTH ROUTES ====================

userRouter.get("/auth/request-message/:publicKey",userController.requestMessage)
userRouter.post("/auth/verify",userController.verifyMessage);
userRouter.post("/auth/refresh",userController.refreshToken);

//Twitter Auth Routes
userRouter.get("/auth/twitter/callback", (req,res,next)=>{
    console.log("request session after callback",req.sessionID);
},passport.authenticate("twitter", {
    failureRedirect: "/api/user/auth/failure",
}), (req, res) => {
    console.log('Auth successful!', req.user);
    res.send(`
        <h1>Authentication Successful!</h1>
        <pre>${JSON.stringify(req.user, null, 2)}</pre>
        <p>You can close this window.</p>
    `);
});

userRouter.get("/auth/failure", (req, res) => {
    res.send(`
        <h1>Authentication Failed</h1>
        <p>Please try again.</p>
        <a href="/api/user/auth/twitter">Retry</a>
    `);
});
userRouter.get("/auth/twitter/:walletAddress",(req, res, next) => {
    if(req.isAuthenticated()){
        return res.send('<h1>Already authenticated</h1>');
    }
    console.log("request session before callback",req.sessionID);
    (req.session as Session & { walletAddress: string }).walletAddress = req.params.walletAddress;
    next();
},passport.authenticate("twitter",{
    scope: ["tweet.read", "users.read","offline.access"],
    session: true,
}));

// ==================== PROFILE ROUTES ====================

// Get authenticated user's own profile
userRouter.get("/profile/me", authMiddleware, userController.getMyProfile);

// Get user profile by wallet address (public)
userRouter.get("/profile/:walletAddress", userController.getProfile);

// ==================== RAFFLE PROFILE DATA ====================

// Get raffles created by user
userRouter.get("/profile/:walletAddress/raffles/created", userController.getRafflesCreated);

// Get raffles purchased by user
userRouter.get("/profile/:walletAddress/raffles/purchased", userController.getRafflesPurchased);

// Get favourite raffles
userRouter.get("/profile/:walletAddress/raffles/favourites", userController.getFavouriteRaffles);

// Get raffle stats for user
userRouter.get("/profile/:walletAddress/raffles/stats", userController.getRaffleStats);

// ==================== AUCTION PROFILE DATA ====================

// Get auctions created by user
userRouter.get("/profile/:walletAddress/auctions/created", userController.getAuctionsCreated);

// Get auctions participated by user
userRouter.get("/profile/:walletAddress/auctions/participated", userController.getAuctionsParticipated);

// Get favourite auctions
userRouter.get("/profile/:walletAddress/auctions/favourites", userController.getFavouriteAuctions);

// Get auction stats for user
userRouter.get("/profile/:walletAddress/auctions/stats", userController.getAuctionStats);

// ==================== GUMBALL PROFILE DATA ====================

// Get gumballs created by user
userRouter.get("/profile/:walletAddress/gumballs/created", userController.getGumballsCreated);

// Get gumballs purchased by user
userRouter.get("/profile/:walletAddress/gumballs/purchased", userController.getGumballsPurchased);

// Get gumball stats for user
userRouter.get("/profile/:walletAddress/gumballs/stats", userController.getGumballStats);

// ==================== FAVOURITES MANAGEMENT ====================

// Toggle favourite raffle (requires auth)
userRouter.post("/favourites/raffle/:raffleId", authMiddleware, userController.toggleFavouriteRaffle);

// Toggle favourite auction (requires auth)
userRouter.post("/favourites/auction/:auctionId", authMiddleware, userController.toggleFavouriteAuction);

export default userRouter;
