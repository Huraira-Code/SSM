import express from "express";
import connectDB from "./config/database.js"; // Note: .js extension is required in ESM
import config from "./config/config.js";
import globalErrorHandler from "./middlewares/globalErrorHandler.js";
import cookieParser from "cookie-parser";
import cors from "cors";

// Import your routes
import accountsRoute from "./routes/acountRoutes.js";
import bankRoute from "./routes/bankRoute.js";
import customerRoute from "./routes/customerRoute.js";
import documentRoute from "./routes/documentRoute.js";
import logRoutes from "./routes/logRoutes.js";
import verificationRoutes from "./routes/verficationRoute.js";
import AuthorizationRoutes from "./routes/authorizationRoutes.js";

const app = express();
const PORT = config.port;
// 2. Database connect hone ke BAAD initialize karein
const startServer = async () => {
    try {
        await connectDB();
        console.log("☑️  Database Connected");

        // 🟢 YAHAN PLACE KAREIN
        // Server restart hote hi saari purani SIMs ko auto-connect karega
        // initializeSims();

        app.listen(PORT, () => {
            console.log(`☑️  POS Server is listening on port ${PORT}`);
        });
    } catch (error) {
        console.error("❌ Failed to start server:", error);
        process.exit(1);
    }
}
// Middlewares
app.use(cors({
    credentials: true,
    origin: ['http://localhost:5173', "https://resataurentsystem.netlify.app", "https://restaurentpos.netlify.app", "https://newyorkguyspos.miteminds.com", "http://localhost:3000"]
}));

app.use(express.json());
app.use(cookieParser());

// Root Endpoint
app.get("/", (req, res) => {
    res.json({ message: "Hello from POS Server2!" });
});

// Other Endpoints - Use the imported variables

app.use("/api/account", accountsRoute);
app.use("/api/bank", bankRoute);
app.use("/api/customer", customerRoute);
app.use("/api/document", documentRoute);
app.use("/api/log", logRoutes);
app.use("/api/verification",verificationRoutes );
app.use("/api/authorizations", AuthorizationRoutes);

app.use(globalErrorHandler);

startServer()