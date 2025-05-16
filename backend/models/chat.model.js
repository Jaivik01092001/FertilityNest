const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: String,
    enum: ['user', 'ai'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  emotionDetected: {
    type: String,
    enum: ['neutral', 'happy', 'sad', 'angry', 'anxious', 'distressed', 'hopeful', 'other'],
    default: 'neutral'
  },
  distressLevel: {
    type: Number,
    min: 0,
    max: 10,
    default: 0
  },
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  }
});

const chatSessionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    default: function() {
      return `Chat Session - ${new Date().toLocaleDateString()}`;
    }
  },
  messages: [messageSchema],
  context: {
    cycleDay: Number,
    fertilityStage: String,
    recentSymptoms: [String],
    recentMedications: [String],
    userJourneyType: String
  },
  summary: {
    type: String
  },
  tags: [String],
  distressDetected: {
    type: Boolean,
    default: false
  },
  distressActionTaken: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Method to add a message to the chat session
chatSessionSchema.methods.addMessage = function(messageData) {
  this.messages.push(messageData);
  this.updatedAt = Date.now();
  return this.save();
};

// Method to check for distress in the last message
chatSessionSchema.methods.checkDistress = function() {
  if (this.messages.length === 0) return false;
  
  const lastMessage = this.messages[this.messages.length - 1];
  
  // Check if the last message is from the user and has a high distress level
  if (lastMessage.sender === 'user' && lastMessage.distressLevel >= 7) {
    this.distressDetected = true;
    return true;
  }
  
  // Check if the last message contains distress keywords
  const distressKeywords = [
    'suicide', 'kill myself', 'end my life', 'can\'t go on',
    'hopeless', 'worthless', 'emergency', 'help me',
    'severe pain', 'extreme pain', 'unbearable'
  ];
  
  const messageContent = lastMessage.content.toLowerCase();
  const hasDistressKeywords = distressKeywords.some(keyword => 
    messageContent.includes(keyword)
  );
  
  if (hasDistressKeywords) {
    this.distressDetected = true;
    return true;
  }
  
  return false;
};

// Method to generate a summary of the chat session
chatSessionSchema.methods.generateSummary = function() {
  if (this.messages.length === 0) return '';
  
  // Get the main topics from the conversation
  const userMessages = this.messages
    .filter(msg => msg.sender === 'user')
    .map(msg => msg.content);
  
  // Simple summary generation - first user message and count
  const firstMessage = userMessages[0] || '';
  const truncatedFirstMessage = firstMessage.length > 50 
    ? firstMessage.substring(0, 50) + '...' 
    : firstMessage;
  
  this.summary = `${truncatedFirstMessage} (${this.messages.length} messages)`;
  return this.summary;
};

const ChatSession = mongoose.model('ChatSession', chatSessionSchema);

module.exports = ChatSession;
