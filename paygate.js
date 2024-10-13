// Import required modules
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const port = 3001;

// Middleware to parse JSON requests
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log("MongoDB Connected");
}).catch((err) => {
    console.error("MongoDB connection error:", err);
});

// Define the Payment Schema
const paymentSchema = new mongoose.Schema({
    parkingId: String,
    amount: Number,
    currency: String,
    status: String,
    timestamp: { type: Date, default: Date.now }
});

// Create Payment model
const Payment = mongoose.model('Payment', paymentSchema);

// Payment endpoint for processing payments
app.post('/payment', async (req, res) => {
    const { parkingId, amount, currency, paymentMethodId } = req.body;

    try {
        // Create a payment intent with Stripe
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount * 100, // Amount in cents
            currency: currency,
            payment_method: paymentMethodId,
            confirm: true // Automatically confirm the payment
        });

        // Store the payment details in MongoDB
        const newPayment = new Payment({
            parkingId: parkingId,
            amount: amount,
            currency: currency,
            status: paymentIntent.status
        });
        await newPayment.save();

        // Return success response to client
        res.status(200).json({
            success: true,
            paymentIntent: paymentIntent,
            message: "Payment successful and recorded."
        });
    } catch (error) {
        console.error("Error processing payment:", error);
        res.status(500).json({ success: false, message: "Payment failed" });
    }
});

// Payment history endpoint to fetch payment records for a parking space
app.get('/payment-history', async (req, res) => {
    const { parkingId } = req.query;

    try {
        // Find all payments for the given parking space ID
        const payments = await Payment.find({ parkingId }).sort({ timestamp: -1 });
        res.status(200).json({ success: true, payments });
    } catch (error) {
        console.error("Error fetching payment history:", error);
        res.status(500).json({ success: false, message: "Error fetching payment history" });
    }
});

// Refund endpoint for processing refunds
app.post('/refund', async (req, res) => {
    const { paymentIntentId } = req.body;

    try {
        // Create a refund with Stripe
        const refund = await stripe.refunds.create({
            payment_intent: paymentIntentId
        });
        res.status(200).json({ success: true, refund });
    } catch (error) {
        console.error("Error processing refund:", error);
        res.status(500).json({ success: false, message: "Refund failed" });
    }
});

// Start the payment service server
app.listen(port, () => {
    console.log(`Payment microservice running on port ${port}`);
});
