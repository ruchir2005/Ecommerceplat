const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();

connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/uploads', express.static('uploads'));

// api routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));

app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/cart", require("./routes/cartRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));
app.use("/api/payment", require("./routes/paymentRoutes"));

// Admin Routes
app.use("/api/admin/users", require("./routes/admin/adminUserRoutes"));
app.use("/api/admin/products", require("./routes/admin/adminProductRoutes"));
app.use("/api/admin/orders", require("./routes/admin/adminOrderRoutes"));
app.use("/api/admin/dashboard", require("./routes/admin/adminDashboardRoutes"));



app.get("/", (req, res) => {
  res.json({ message: "FlipKart Clone API is running 🚀" });
});

// Error Handling Middleware
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
app.use(notFound);
app.use(errorHandler);


// Start Server 
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
