// importing express
import express from 'express'
// creating instance for express
const app = express();
// middleware to parse body to JSON
app.use(express.json());
// setting up port 
const PORT = process.env.PORT || 3000;
// making server to listen to  port
app.listen(PORT, () => {console.log(`server is listening to port ${PORT}`)})
// creating array variable
let rooms = []
// creating post request to create rooms
app.post('/rooms', (req, res) => {
    const { numberOfSeats, amenities, pricePerHour } = req.body;
    const room = {
        id: rooms.length + 1,
        numberOfSeats,
        amenities,
        pricePerHour,
        bookings: []
    };
    rooms.push(room);
    res.status(201).send(room);
});
// creating bookings request to make booking
app.post('/bookings', (req, res) => {
    const {id, customerName, date, startTime, endTime, roomId } = req.body;
    const room = rooms.find(r => r.id === roomId);

    if (!room) {
        return res.status(404).send('Room not found');
    }

    const isBooked = room.bookings.some(booking => booking.date === date && (
        (startTime >= booking.startTime && startTime < booking.endTime) ||
        (endTime > booking.startTime && endTime <= booking.endTime)
    ));

    if (isBooked) {
        return res.status(400).send('Room is already booked for the given time');
    }

    const booking = {id, customerName, date, startTime, endTime };
    room.bookings.push(booking);
    res.status(201).send(booking);
});
// creating get request to get the room details
app.get('/rooms', (req, res) => {
    const roomsWithBookings = rooms.map(room => ({
        roomName: room.id,
        bookedStatus: room.bookings.length > 0,
        bookings: room.bookings
    }));
    res.send(roomsWithBookings);
});
// creating get request to get the customer details
app.get('/customers', (req, res) => {
    const customers = rooms.flatMap(room => room.bookings.map(booking => ({
        customerName: booking.customerName,
        date: booking.date,
        roomName: room.id,
        startTime: booking.startTime,
        endTime: booking.endTime
    })));
    res.send(customers);
});
// getting all booking detials of the customers
app.get('/customers/:name/bookings', (req, res) => {
    const customerName = req.params.name;
    const customerBookings = rooms.flatMap(room => room.bookings.filter(booking => booking.customerName === customerName).map(booking => ({
        roomName: room.id,
        customerName: booking.customerName,
        date: booking.date,
        startTime: booking.startTime,
        endTime: booking.endTime,
        bookingId: booking.id,
        bookingDate: booking.date,
        bookingStatus: 'Booked'
    })));
    res.send(customerBookings);
});