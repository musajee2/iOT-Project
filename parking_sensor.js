const mqtt = require('mqtt');
const mongoose = require('mongoose');
const client = mqtt.connect("mqtt://broker.hivemq.com:1883");

// Connect to MongoDB
mongoose.connect('mongodb+srv://musajee10122002:omom123@projectcluster.32vnq.mongodb.net/parkingdb', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log("MongoDB Connected");
}).catch((err) => {
    console.error("MongoDB connection error:", err);
});

// Define the Parking Schema
const parkingSchema = new mongoose.Schema({
    payload: {
        parking_id: String,
        status: String,
        timestamp: Date,
        _msgid: String,
        name: String,
        carNo: String
    }
});

const Parking = mongoose.model('Parking', parkingSchema, 'parkingStatus');

// Function to generate parking lot IDs from A1-A5 to E1-E5
function generateParkingIDs() {
    const parkingIDs = [];
    const rows = ['A', 'B', 'C', 'D', 'E'];
    const columns = [1, 2, 3, 4, 5];

    rows.forEach(row => {
        columns.forEach(col => {
            parkingIDs.push(`${row}${col}`);
        });
    });

    return parkingIDs;
}

const parkingIDs = generateParkingIDs();

client.on('connect', () => {
    console.log('MQTT connected');

    setInterval(async () => {
        // Fetch current parking statuses from the database before each mock cycle
        const bookedSpots = await Parking.find({ "payload.status": "Occupied" });
        const bookedParkingIDs = bookedSpots.map(spot => spot.payload.parking_id);

        parkingIDs.forEach(parkingID => {
            // Skip mocking for booked parking spaces
            if (bookedParkingIDs.includes(parkingID)) {
                console.log(`Skipping mock for booked parking spot: ${parkingID}`);
                return; // Exit the loop for this parkingID
            }

            // Mock the sensor for free parking spots only
            let occupied = Math.random() > 0.5; // Randomly decide if the space is occupied
            let message = {
                parking_id: parkingID,
                status: occupied ? "Occupied" : "Free",
                timestamp: new Date().toISOString(),
                name: occupied ? "MockUser" : null,
                carNo: occupied ? "MockCar" : null
            };

            let topic = `/parking_lot/${parkingID}`;
            client.publish(topic, JSON.stringify(message));
            console.log(`Published to Topic: ${topic} with Message: ${JSON.stringify(message)}`);
        });
    }, 5000); // Check and mock every 5 seconds
});
