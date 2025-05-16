const ChatSession = require('../models/chat.model');
const User = require('../models/user.model');
const Cycle = require('../models/cycle.model');
const Medication = require('../models/medication.model');
const Notification = require('../models/notification.model');
const axios = require('axios');

/**
 * Create a new chat session
 * @route POST /api/chat/sessions
 * @access Private
 */
exports.createChatSession = async (req, res) => {
  try {
    const { title } = req.body;

    // Create new chat session
    const chatSession = new ChatSession({
      user: req.user._id,
      title: title || undefined
    });

    // Get user's current cycle and context
    const user = await User.findById(req.user._id);

    // Find current cycle
    const today = new Date();
    const cycle = await Cycle.findOne({
      user: req.user._id,
      startDate: { $lte: today }
    }).sort({ startDate: -1 });

    // Calculate current cycle day if cycle exists
    let cycleDay = null;
    if (cycle) {
      const startDate = new Date(cycle.startDate);
      const diffTime = Math.abs(today - startDate);
      cycleDay = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    // Get recent symptoms if cycle exists
    let recentSymptoms = [];
    if (cycle) {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      recentSymptoms = cycle.symptoms
        .filter(symptom => new Date(symptom.date) >= oneWeekAgo)
        .map(symptom => symptom.type);
    }

    // Get recent medications
    const medications = await Medication.find({
      user: req.user._id,
      isActive: true
    });

    const recentMedications = medications.map(med => med.name);

    // Set context
    chatSession.context = {
      cycleDay,
      fertilityStage: user.fertilityStage,
      recentSymptoms,
      recentMedications,
      userJourneyType: user.journeyType
    };

    // Save chat session
    await chatSession.save();

    res.status(201).json({
      success: true,
      message: 'Chat session created successfully',
      chatSession
    });
  } catch (error) {
    console.error('Create chat session error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error creating chat session',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get all chat sessions for current user
 * @route GET /api/chat/sessions
 * @access Private
 */
exports.getChatSessions = async (req, res) => {
  try {
    const { limit = 10, page = 1 } = req.query;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Find chat sessions
    const chatSessions = await ChatSession.find({ user: req.user._id })
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Count total chat sessions
    const total = await ChatSession.countDocuments({ user: req.user._id });

    res.status(200).json({
      success: true,
      count: chatSessions.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      chatSessions
    });
  } catch (error) {
    console.error('Get chat sessions error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error fetching chat sessions',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get a single chat session
 * @route GET /api/chat/sessions/:id
 * @access Private
 */
exports.getChatSession = async (req, res) => {
  try {
    const chatSession = await ChatSession.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!chatSession) {
      return res.status(404).json({
        success: false,
        message: 'Chat session not found'
      });
    }

    res.status(200).json({
      success: true,
      chatSession
    });
  } catch (error) {
    console.error('Get chat session error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error fetching chat session',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Send message to chat session
 * @route POST /api/chat/sessions/:id/messages
 * @access Private
 */
exports.sendMessage = async (req, res) => {
  try {
    const { content } = req.body;

    // Find chat session
    const chatSession = await ChatSession.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!chatSession) {
      return res.status(404).json({
        success: false,
        message: 'Chat session not found'
      });
    }

    // Create user message
    const userMessage = {
      sender: 'user',
      content,
      timestamp: Date.now()
    };

    // Add message to chat session
    chatSession.messages.push(userMessage);

    // Check for distress
    const distressDetected = chatSession.checkDistress();

    // If distress detected, notify emergency contacts
    if (distressDetected && !chatSession.distressActionTaken) {
      chatSession.distressActionTaken = true;

      // Get user with emergency contacts
      const user = await User.findById(req.user._id).populate('partnerId');

      // If user has a partner, send notification
      if (user.partnerId) {
        await Notification.createNotification({
          recipient: user.partnerId._id,
          sender: req.user._id,
          type: 'distress_signal',
          title: 'URGENT: Distress Signal',
          message: `${user.name} may need your support right now.`,
          priority: 'urgent',
          actionLink: '/distress-response'
        });
      }

      // Add AI response about distress detection
      const distressResponse = {
        sender: 'ai',
        content: 'I notice you may be experiencing distress. I\'ve alerted your emergency contacts. Remember, you\'re not alone, and help is available. Would you like me to provide some immediate coping strategies or resources?',
        timestamp: Date.now(),
        emotionDetected: 'distressed'
      };

      chatSession.messages.push(distressResponse);
      await chatSession.save();

      return res.status(201).json({
        success: true,
        message: 'Message sent and distress detected',
        userMessage,
        aiResponse: distressResponse,
        distressDetected: true
      });
    }

    // Get AI response using OpenAI API
    try {
      const aiResponse = await getAIResponse(content, chatSession);

      // Add AI response to chat session
      chatSession.messages.push(aiResponse);

      // Save chat session
      await chatSession.save();

      res.status(201).json({
        success: true,
        message: 'Message sent successfully',
        userMessage,
        aiResponse
      });
    } catch (aiError) {
      console.error('AI response error:', aiError.message);

      // Save user message even if AI fails
      await chatSession.save();

      res.status(201).json({
        success: true,
        message: 'Message sent but AI response failed',
        userMessage,
        aiError: process.env.NODE_ENV === 'development' ? aiError.message : 'AI service unavailable'
      });
    }
  } catch (error) {
    console.error('Send message error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error sending message',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Delete a chat session
 * @route DELETE /api/chat/sessions/:id
 * @access Private
 */
exports.deleteChatSession = async (req, res) => {
  try {
    const chatSession = await ChatSession.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!chatSession) {
      return res.status(404).json({
        success: false,
        message: 'Chat session not found'
      });
    }

    await chatSession.remove();

    res.status(200).json({
      success: true,
      message: 'Chat session deleted successfully'
    });
  } catch (error) {
    console.error('Delete chat session error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error deleting chat session',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Helper function to get AI response using OpenAI API
 * @param {String} userMessage - User message
 * @param {Object} chatSession - Chat session object
 * @returns {Object} AI response object
 */
const getAIResponse = async (userMessage, chatSession) => {
  try {
    // Prepare context for AI
    const contextMessage = `You are Anaira, an empathetic AI companion for FertilityNest, a fertility support app.
    The user is on a ${chatSession.context.userJourneyType || 'fertility'} journey and is currently in the ${chatSession.context.fertilityStage || 'unknown'} stage.
    ${chatSession.context.cycleDay ? `They are on day ${chatSession.context.cycleDay} of their cycle.` : ''}
    ${chatSession.context.recentSymptoms.length > 0 ? `They recently experienced these symptoms: ${chatSession.context.recentSymptoms.join(', ')}.` : ''}
    ${chatSession.context.recentMedications.length > 0 ? `They are taking these medications: ${chatSession.context.recentMedications.join(', ')}.` : ''}

    Be compassionate, informative, and supportive. Provide evidence-based information when possible, but clarify you're not a medical professional.
    If the user seems distressed, offer support and suggest they speak with a healthcare provider.`;

    // Get previous messages (limit to last 10 for context)
    const previousMessages = chatSession.messages.slice(-10).map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.content
    }));

    // Prepare messages for OpenAI API
    const messages = [
      { role: 'system', content: contextMessage },
      ...previousMessages,
      { role: 'user', content: userMessage }
    ];

    // Call OpenAI API
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages,
        temperature: 0.7,
        max_tokens: 500
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // Extract AI response
    const aiContent = response.data.choices[0].message.content;

    // Simple emotion detection (can be replaced with more sophisticated ML model)
    const emotionDetected = detectEmotion(userMessage);

    return {
      sender: 'ai',
      content: aiContent,
      timestamp: Date.now(),
      emotionDetected
    };
  } catch (error) {
    console.error('OpenAI API error:', error.message);

    // Fallback response if API fails
    return {
      sender: 'ai',
      content: 'I apologize, but I\'m having trouble connecting to my knowledge base right now. Could you please try again in a moment?',
      timestamp: Date.now(),
      emotionDetected: 'neutral'
    };
  }
};

/**
 * Simple emotion detection function
 * @param {String} text - Text to analyze
 * @returns {String} Detected emotion
 */
const detectEmotion = (text) => {
  const text_lower = text.toLowerCase();

  // Simple keyword-based emotion detection
  const emotionKeywords = {
    happy: ['happy', 'joy', 'excited', 'great', 'wonderful', 'amazing', 'good'],
    sad: ['sad', 'unhappy', 'depressed', 'down', 'blue', 'upset', 'cry'],
    angry: ['angry', 'mad', 'furious', 'annoyed', 'frustrated', 'irritated'],
    anxious: ['anxious', 'worried', 'nervous', 'stress', 'afraid', 'fear'],
    distressed: ['help', 'emergency', 'pain', 'hurt', 'terrible', 'unbearable', 'suicidal', 'hopeless'],
    hopeful: ['hope', 'optimistic', 'looking forward', 'positive', 'better']
  };

  // Check for each emotion
  for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
    if (keywords.some(keyword => text_lower.includes(keyword))) {
      return emotion;
    }
  }

  return 'neutral';
};
