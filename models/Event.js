import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Please provide the event title'],
            trim: true,
        },
        category: {
            type: String,
            required: [true, 'Please provide the event category'],
            enum: ['Technical', 'Cultural', 'Sports', 'Workshops'],
            trim: true,
        },
        desc: {
            type: String,
            required: [true, 'Please provide the event description'],
            trim: true,
        },
        date: {
            type: String,
            required: [true, 'Please provide the event date'],
            trim: true,
        },
        time: {
            type: String,
            required: [true, 'Please provide the event time'],
            trim: true,
        },
        venue: {
            type: String,
            required: [true, 'Please provide the event venue'],
            trim: true,
        },
        organizer: {
            type: String,
            required: [true, 'Please provide the event organizer'],
            trim: true,
        },
        deadline: {
            type: String,
            required: [true, 'Please provide the registration deadline'],
            trim: true,
        },
        seats: {
            type: Number,
            required: [true, 'Please provide the remaining seats available'],
            min: [0, 'Available seats cannot be less than 0'],
            default: 0,
        },
        maxSeats: {
            type: Number,
            required: [true, 'Please provide the maximum event capacity'],
            min: [1, 'Maximum seats must be at least 1'],
            default: 50,
        },
    },
    {
        timestamps: true,
    }
);

const Event = mongoose.model('Event', eventSchema);
export default Event;
