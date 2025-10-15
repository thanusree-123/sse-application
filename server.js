const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Connect to MongoDB. "mongodb" will be the service name in Kubernetes.
const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost:27017/feedbackdb';
mongoose.connect(mongoUrl)
    .then(() => console.log('MongoDB connected successfully.'))
    .catch(err => console.error('MongoDB connection error:', err));

const feedbackSchema = new mongoose.Schema({
    name: { type: String, required: true },
    feedbackText: { type: String, required: true }
});
const Feedback = mongoose.model('Feedback', feedbackSchema);

// Route to display the form and all feedback
app.get('/', async (req, res) => {
    try {
        const feedbacks = await Feedback.find({});
        res.render('index', { feedbacks: feedbacks });
    } catch (err) {
        res.status(500).send('Error retrieving feedback.');
    }
});

// MODIFIED Route to handle form submission with Input Validation
app.post('/submit', async (req, res) => {
    const { name, feedbackText } = req.body;
    if (!name || !feedbackText) {
        return res.status(400).send('Name and feedback text cannot be empty.');
    }

    // --- NEW INPUT VALIDATION LOGIC ---
    // Check if the feedback text contains a script tag.
    // For this lab, a simple string check is sufficient to demonstrate the concept.
    if (feedbackText.toLowerCase().includes('<script>')) {
        // 1. BLOCK: If a script is found, do not save it to the database.
        // 2. ALERT: Send a response back to the browser that triggers a pop-up alert.
        res.status(400).send(`
            <html>
                <head><title>Input Blocked</title></head>
                <body>
                    <script>
                        alert("Submission blocked: Malicious script detected!");
                        window.location.href = "/"; // Redirect back to the home page after the user clicks OK
                    </script>
                </body>
            </html>
        `);
    } else {
        // If the input is clean, proceed to save it to the database as normal.
        const newFeedback = new Feedback({ name, feedbackText });
        try {
            await newFeedback.save();
            res.redirect('/');
        } catch (err) {
            res.status(500).send('Error saving feedback.');
        }
    }
});


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
