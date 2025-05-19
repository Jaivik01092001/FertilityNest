const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const morgan = require('morgan');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const cycleRoutes = require('./routes/cycle.routes');
const medicationRoutes = require('./routes/medication.routes');
const chatRoutes = require('./routes/chat.routes');
const partnerRoutes = require('./routes/partner.routes');
const communityRoutes = require('./routes/community.routes');
const adminRoutes = require('./routes/admin.routes');

// Initialize Express app
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Make io instance available to the Express app
app.set('io', io);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(helmet());
app.use(morgan('dev'));

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fertilitynest')
  .then(async () => {
    console.log('Connected to MongoDB');

    // Run database seeders in development mode
    if (process.env.NODE_ENV !== 'production' || process.env.ENABLE_PRODUCTION_SEEDING === 'true') {
      try {
        const { seedDatabase, shouldSkipSeeding } = require('./seeders');

        // Check if seeding should be skipped
        const skipSeeding = await shouldSkipSeeding();

        if (!skipSeeding) {
          console.log('🌱 Starting database seeding...');
          const result = await seedDatabase();
          console.log('🎉 Database seeding completed successfully!');
          console.log('📊 Seeding summary:');
          Object.entries(result).forEach(([key, value]) => {
            console.log(`   - ${key}: ${value}`);
          });
        } else {
          console.log('⏭️ Database seeding skipped (disabled by configuration or data already exists)');
        }
      } catch (error) {
        console.error('❌ Error seeding database:', error);
      }
    }
  })
  .catch(err => console.error('MongoDB connection error:', err));

// Socket.IO connection
io.on('connection', (socket) => {
  console.log('New client connected');

  // Join user to their personal room
  socket.on('join', (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined their room`);
  });

  // Handle chat messages
  socket.on('sendMessage', (data) => {
    io.to(data.recipientId).emit('receiveMessage', data);
  });

  // Handle notifications
  socket.on('sendNotification', (data) => {
    io.to(data.recipientId).emit('receiveNotification', data);
  });

  // Handle distress signals
  socket.on('distressSignal', (data) => {
    io.to(data.partnerId).emit('distressAlert', data);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/cycles', cycleRoutes);
app.use('/api/medications', medicationRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/partners', partnerRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/admin', adminRoutes);

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/dist')));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../frontend/dist', 'index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error'
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = { app, server, io };
