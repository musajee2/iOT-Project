const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');

// Initialize Express
const app = express();
const port = 3000;

// Enable CORS for all routes
app.use(cors());

// Middleware
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect('mongodb+srv://-----------------', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log("MongoDB Connected");
}).catch((err) => {
    console.error("MongoDB connection error:", err);
});

// Define a Parking Schema
const parkingSchema = new mongoose.Schema({
    payload: {
        parking_id: String,
        status: String,
        timestamp: Date,
        _msgid: String,
        name: String,    // Added to store the user's name
        carNo: String    // Added to store the car number
    }
});

const Parking = mongoose.model('Parking', parkingSchema, 'parkingStatus');

// Fetch the current status of all parking spaces and show "Details" button
app.get('/', async (req, res) => {
    try {
        const parkingStatuses = await Parking.aggregate([
            { $sort: { "payload.timestamp": -1 } }, // Sort by latest timestamp
            { $group: { _id: "$payload.parking_id", latestStatus: { $first: "$$ROOT" } } },
            { $sort: { "_id": 1 } }
        ]);

        if (parkingStatuses.length > 0) {
            let statusMessage = "<h1>Parking Space Statuses:</h1><ul>";
            parkingStatuses.forEach(parking => {
                statusMessage += `
                    <li>${parking._id}: ${parking.latestStatus.payload.status} 
                    (Last updated: ${parking.latestStatus.payload.timestamp}) 
                    <form action="/details/${parking._id}" method="GET" style="display:inline;">
                        <button type="submit">Details</button>
                    </form>
                    </li>`;
            });
            statusMessage += "</ul>";
            res.send(statusMessage);
        } else {
            res.send("<h1>No parking status available</h1>");
        }
    } catch (error) {
        console.error("Error fetching parking statuses:", error);
        res.status(500).send("Error fetching parking statuses");
    }
});

// Fetch the full history of statuses for a specific parking space, including name and car number
app.get('/details/:parkingId', async (req, res) => {
    const parkingId = req.params.parkingId;

    try {
        const parkingHistory = await Parking.find({ "payload.parking_id": parkingId }).sort({ "payload.timestamp": 1 });

        if (parkingHistory.length > 0) {
            let historyMessage = `<h1>History of Parking Space: ${parkingId}</h1><ul>`;
            parkingHistory.forEach(entry => {
                historyMessage += `<li>Status: ${entry.payload.status}, Timestamp: ${entry.payload.timestamp}, Name: ${entry.payload.name || 'N/A'}, Car No: ${entry.payload.carNo || 'N/A'}</li>`;
            });
            historyMessage += "</ul>";
            res.send(historyMessage);
        } else {
            res.send(`<h1>No history available for parking space: ${parkingId}</h1>`);
        }
    } catch (error) {
        console.error("Error fetching parking history:", error);
        res.status(500).send("Error fetching parking history");
    }
});

// Endpoint to book a parking spot and update the status in the database
app.post('/book-parking', async (req, res) => {
    const { name, carNo, parkingSpace, time } = req.body;

    try {
        // Check if parking space exists in the collection
        const parking = await Parking.findOne({ "payload.parking_id": parkingSpace });

        if (!parking) {
            return res.status(400).json({ message: 'Invalid parking space.' });
        }

        // Simulate booking the parking spot by updating its status
        const updatedStatus = {
            parking_id: parkingSpace,
            status: 'Parking Space is Occupied',
            timestamp: new Date(),
            _msgid: parking.payload._msgid, // Retain the original msgid or generate a new one if required
            name: name,    // Store the user's name
            carNo: carNo   // Store the user's car number
        };

        // Update the parking spot status in the database
        await Parking.updateOne({ "payload.parking_id": parkingSpace }, { $set: { payload: updatedStatus } });

        // Send confirmation to the frontend
        const confirmationMessage = `Parking space ${parkingSpace} has been booked for ${time} minutes by ${name} (Car: ${carNo}).`;
        console.log(confirmationMessage);

        res.status(200).json({ message: confirmationMessage });
    } catch (error) {
        console.error('Error booking parking space:', error);
        res.status(500).send('Error booking parking space');
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Parking reservation server running on port ${port}`);
});
