const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json({ limit: '50mb' })); // For receiving large JSON from python

// Ensure uploads dir exists
const UPLOADS_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR);
}

// In-memory job queue & statuses
// shape: { [id: string]: { id, originalName, filename, status: 'processing' | 'completed', resultsFile?: string } }
const jobs = {};

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOADS_DIR);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// Serve uploaded files statically (so React can play the video)
app.use('/uploads', express.static(UPLOADS_DIR));

// 1. React uploads video here
app.post('/upload', upload.single('video'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No video uploaded' });

    const jobId = req.file.filename.split('.')[0]; // Use filename base as ID

    jobs[jobId] = {
        id: jobId,
        originalName: req.file.originalname,
        filename: req.file.filename,
        status: 'queue', // waiting for python worker
    };

    console.log(`[Queue] Added new video jobId: ${jobId}`);
    res.json({ jobId, status: 'queue' });
});

// 2. React checks status here
app.get('/status/:id', (req, res) => {
    const job = jobs[req.params.id];
    if (!job) return res.status(404).json({ error: 'Job not found' });

    if (job.status === 'completed') {
        // Send back full results.json array in-memory
        res.json({ status: 'completed', resultsData: job.resultsData });
    } else {
        res.json({ status: job.status });
    }
});

// 3. Python worker asks for the next job
app.get('/jobs/next', (req, res) => {
    const nextJob = Object.values(jobs).find(j => j.status === 'queue');
    if (nextJob) {
        nextJob.status = 'processing';
        console.log(`[Worker] Started processing jobId: ${nextJob.id}`);
        res.json({
            jobId: nextJob.id,
            videoPath: path.join(UPLOADS_DIR, nextJob.filename)
        });
    } else {
        res.json({ jobId: null });
    }
});

// 4. Python worker sends results here when done
app.post('/jobs/:id/complete', (req, res) => {
    const jobId = req.params.id;
    const results = req.body; // the JSON array of frames & coordinates

    if (!jobs[jobId]) return res.status(404).json({ error: 'Job not found' });

    // Save results in RAM, NOT on the hard drive
    jobs[jobId].resultsData = results;
    jobs[jobId].status = 'completed';

    // SECURE AUTO-CLEANUP: The exact moment AI finishes tracking, delete the original MP4 video entirely
    const videoPath = path.join(UPLOADS_DIR, jobs[jobId].filename);
    if (fs.existsSync(videoPath)) {
        try {
            fs.unlinkSync(videoPath);
            console.log(`[Queue] Securely deleted local video copy: ${jobs[jobId].filename}`);
        } catch (err) {
            console.error('Could not auto-delete video:', err);
        }
    }

    console.log(`[Worker] Completed processing jobId: ${jobId}`);
    res.json({ success: true });
});

app.listen(PORT, () => {
    console.log(`Backend traffic controller running at http://localhost:${PORT}`);
});
