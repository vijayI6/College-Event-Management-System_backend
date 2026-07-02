import Event from '../models/Event.js';
import User from '../models/User.js';

// @desc    Get all active events
// @route   GET /api/events
// @access  Public
export const getAllEvents = async (req, res) => {
    try {
        const events = await Event.find({}).sort({ date: 1 });
        res.status(200).json({
            success: true,
            events,
        });
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({
            success: false,
            message: 'Server error occurred while fetching events',
        });
    }
};

// @desc    Register a student for an event
// @route   POST /api/events/:id/register
// @access  Private
export const registerForEvent = async (req, res) => {
    try {
        const eventId = req.params.id;
        const userId = req.user._id;

        // Find the event
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found',
            });
        }

        // Check if there are seats available
        if (event.seats <= 0) {
            return res.status(400).json({
                success: false,
                message: 'This event is already fully booked',
            });
        }

        // Find the user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        // Check if user is already registered for this event
        const alreadyRegistered = user.registeredEvents.some(
            (id) => id.toString() === eventId
        );

        if (alreadyRegistered) {
            return res.status(400).json({
                success: false,
                message: 'You are already registered for this event',
            });
        }

        // Decrement event seats
        event.seats -= 1;
        await event.save();

        // Add event to user's registered list
        user.registeredEvents.push(eventId);
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Successfully registered for event',
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                studentId: user.studentId,
                role: user.role,
                registeredEvents: user.registeredEvents
            }
        });
    } catch (error) {
        console.error('Error registering for event:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error occurred during event registration',
        });
    }
};

// @desc    Cancel user registration for an event
// @route   POST /api/events/:id/cancel
// @access  Private
export const cancelEventRegistration = async (req, res) => {
    try {
        const eventId = req.params.id;
        const userId = req.user._id;

        // Find the event
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found',
            });
        }

        // Find the user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        // Check if user is registered for this event
        const isRegistered = user.registeredEvents.some(
            (id) => id.toString() === eventId
        );

        if (!isRegistered) {
            return res.status(400).json({
                success: false,
                message: 'You are not registered for this event',
            });
        }

        // Increment event seats (do not exceed max capacity)
        if (event.seats < event.maxSeats) {
            event.seats += 1;
            await event.save();
        }

        // Remove event from user's registered list
        user.registeredEvents = user.registeredEvents.filter(
            (id) => id.toString() !== eventId
        );
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Successfully cancelled registration',
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                studentId: user.studentId,
                role: user.role,
                registeredEvents: user.registeredEvents
            }
        });
    } catch (error) {
        console.error('Error cancelling event registration:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error occurred during cancellation',
        });
    }
};

// @desc    Seed default events for initial testing
// @route   POST /api/events/seed
// @access  Public
export const seedEvents = async (req, res) => {
    try {
        // Clear existing events
        await Event.deleteMany({});

        const defaultEvents = [
            {
                title: "Smart India Hackathon Prep",
                category: "Technical",
                desc: "Get ready for national hackathon with expert mentor support and coding tips",
                date: "2026-07-15",
                time: "10:00 AM",
                venue: "Seminar Hall 2 Block A",
                organizer: "Coding Club",
                deadline: "2026-07-12",
                seats: 45,
                maxSeats: 50,
            },
            {
                title: "Annual Cultural Fest Spandan",
                category: "Cultural",
                desc: "Join the biggest cultural show with dance music and drama performances",
                date: "2026-08-20",
                time: "05:00 PM",
                venue: "Main Open Auditorium",
                organizer: "Student Council",
                deadline: "2026-08-15",
                seats: 198,
                maxSeats: 200,
            },
            {
                title: "Inter-College Cricket Cup",
                category: "Sports",
                desc: "Come and support our college cricket team in final match of tournament",
                date: "2026-07-18",
                time: "09:00 AM",
                venue: "College Sports Ground",
                organizer: "Sports Committee",
                deadline: "2026-07-16",
                seats: 120,
                maxSeats: 150,
            },
            {
                title: "AI and Deep Learning Workshop",
                category: "Workshops",
                desc: "Learn neural networks and deep learning models with live lab practice",
                date: "2026-07-25",
                time: "11:00 AM",
                venue: "Lab 4 Block B",
                organizer: "CSE Department",
                deadline: "2026-07-22",
                seats: 29,
                maxSeats: 30,
            },
            {
                title: "Public Speaking Boot Camp",
                category: "Workshops",
                desc: "Improve your presentation and speaking skills with simple steps",
                date: "2026-07-30",
                time: "02:00 PM",
                venue: "Lounge Area Block C",
                organizer: "Toastmasters Club",
                deadline: "2026-07-28",
                seats: 15,
                maxSeats: 20,
            },
            {
                title: "Campus Photography Contest",
                category: "Cultural",
                desc: "Submit your best shots of campus life to win amazing rewards",
                date: "2026-08-05",
                time: "12:00 PM",
                venue: "Online Submission Portal",
                organizer: "Media Club",
                deadline: "2026-08-03",
                seats: 80,
                maxSeats: 100,
            },
        ];

        const createdEvents = await Event.insertMany(defaultEvents);

        res.status(201).json({
            success: true,
            message: 'Default events seeded successfully',
            count: createdEvents.length,
            events: createdEvents,
        });
    } catch (error) {
        console.error('Error seeding events:', error);
        res.status(500).json({
            success: false,
            message: 'Server error occurred during seeding',
        });
    }
};
