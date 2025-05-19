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

    // Analyze user message for emotion and distress
    const emotionAnalysis = detectEmotion(content);

    // Create user message with emotion data
    const userMessage = {
      sender: 'user',
      content,
      timestamp: Date.now(),
      emotionDetected: emotionAnalysis.emotion,
      distressLevel: emotionAnalysis.distressLevel,
      metadata: {
        emotionAnalysis: emotionAnalysis
      }
    };

    // Add message to chat session
    chatSession.messages.push(userMessage);

    // Check for distress - either through our enhanced detection or the model's method
    const distressDetected = emotionAnalysis.distressLevel >= 7 || chatSession.checkDistress();

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

    // Get the socket.io instance
    const io = req.app.get('io');

    // Emit typing started event
    if (io) {
      io.to(req.user._id.toString()).emit('typingStarted', {
        sessionId: chatSession._id.toString()
      });
    }

    // Get AI response using Gemini API
    try {
      const aiResponse = await getAIResponse(content, chatSession);

      // Add AI response to chat session
      chatSession.messages.push(aiResponse);

      // Save chat session
      await chatSession.save();

      // Emit typing stopped event
      if (io) {
        io.to(req.user._id.toString()).emit('typingStopped', {
          sessionId: chatSession._id.toString()
        });
      }

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

      // Emit typing stopped event even on error
      if (io) {
        io.to(req.user._id.toString()).emit('typingStopped', {
          sessionId: chatSession._id.toString()
        });
      }

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
 * Helper function to get AI response using Gemini API
 * @param {String} userMessage - User message
 * @param {Object} chatSession - Chat session object
 * @returns {Object} AI response object
 */
const getAIResponse = async (userMessage, chatSession) => {
  try {
    // Get user's detected emotion
    const userEmotion = chatSession.messages.length > 0 && chatSession.messages[chatSession.messages.length - 1].emotionDetected
      ? chatSession.messages[chatSession.messages.length - 1].emotionDetected
      : 'neutral';

    const userDistressLevel = chatSession.messages.length > 0 && chatSession.messages[chatSession.messages.length - 1].distressLevel
      ? chatSession.messages[chatSession.messages.length - 1].distressLevel
      : 0;

    // Prepare enhanced context for AI with emotion awareness
    const contextMessage = `You are Anaira, an empathetic AI companion for FertilityNest, a fertility support app.

    USER CONTEXT:
    - Journey Type: ${chatSession.context.userJourneyType || 'fertility'}
    - Current Stage: ${chatSession.context.fertilityStage || 'unknown'}
    ${chatSession.context.cycleDay ? `- Cycle Day: ${chatSession.context.cycleDay}` : ''}
    ${chatSession.context.recentSymptoms?.length > 0 ? `- Recent Symptoms: ${chatSession.context.recentSymptoms.join(', ')}` : ''}
    ${chatSession.context.recentMedications?.length > 0 ? `- Current Medications: ${chatSession.context.recentMedications.join(', ')}` : ''}

    EMOTIONAL CONTEXT:
    - Current Emotion: ${userEmotion}
    - Distress Level: ${userDistressLevel}/10

    YOUR ROLE:
    - Provide emotional support, accurate information, and helpful guidance related to fertility, reproductive health, and emotional wellbeing.
    - Be empathetic, warm, and supportive in your responses.
    - Acknowledge and respond appropriately to the user's emotional state.
    - If the user expresses distress (distress level 7+), acknowledge their feelings, offer support, and suggest resources.
    - Do not provide medical diagnoses or treatment recommendations. Instead, encourage the user to consult with their healthcare provider for medical advice.
    - Keep your responses concise (3-5 sentences) unless the user asks for detailed information.

    RESPONSE GUIDELINES BASED ON EMOTION:
    - If user is happy: Match their positive energy while remaining informative and supportive.
    - If user is sad: Be gentle, validating, and compassionate. Acknowledge their feelings before providing information.
    - If user is angry: Be calm, non-judgmental, and validating. Acknowledge frustration before offering perspective.
    - If user is anxious: Be reassuring but honest. Provide clear, factual information to help reduce uncertainty.
    - If user is distressed: Prioritize emotional support, validate feelings, and offer specific resources or coping strategies.
    - If user is hopeful: Encourage realistic optimism while providing balanced information.
    - If user is neutral: Focus on being informative and supportive.`;

    // Get previous messages (limit to last 8 for context)
    const previousMessages = chatSession.messages.slice(-8);

    // Use the system API key
    // In a production environment, you might want to check if the user has their own API key
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error('No Gemini API key available');
    }

    // Combine context and user message
    let combinedMessage = contextMessage + "\n\n";

    // Add enhanced chat history with emotion context
    if (previousMessages.length > 0) {
      combinedMessage += "CONVERSATION HISTORY:\n";
      for (const msg of previousMessages) {
        const role = msg.sender === 'user' ? 'User' : 'Anaira';
        const emotionTag = msg.emotionDetected ? ` [Emotion: ${msg.emotionDetected}]` : '';
        combinedMessage += `${role}: ${msg.content}${emotionTag}\n`;
      }
    }

    // Add conversation analysis
    const conversationAnalysis = analyzeConversation(chatSession.messages);
    if (conversationAnalysis) {
      combinedMessage += "\nCONVERSATION ANALYSIS:\n" + conversationAnalysis;
    }

    // Add current user message
    combinedMessage += `\nUser's current message: ${userMessage}\n\nAnaira's response:`;

    // Call Gemini API using the direct REST endpoint
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        contents: [{
          parts: [{ text: combinedMessage }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 500,
          topP: 0.95,
          topK: 40
        }
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    // Extract AI response
    const aiContent = response.data.candidates[0].content.parts[0].text.trim();

    // Enhanced emotion detection
    const emotionAnalysis = detectEmotion(userMessage);

    // Create AI response object with emotion data
    return {
      sender: 'ai',
      content: aiContent,
      timestamp: Date.now(),
      emotionDetected: emotionAnalysis.emotion,
      distressLevel: emotionAnalysis.distressLevel,
      metadata: {
        emotionAnalysis: emotionAnalysis
      }
    };
  } catch (error) {
    console.error('Gemini API error:', error.message);
    console.error('Error details:', error.response?.data || 'No response data');

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
 * Enhanced emotion detection function
 * @param {String} text - Text to analyze
 * @returns {Object} Detected emotion and distress level
 */
const detectEmotion = (text) => {
  const text_lower = text.toLowerCase();

  // Enhanced keyword-based emotion detection with more comprehensive keywords
  const emotionKeywords = {
    happy: [
      'happy', 'joy', 'excited', 'great', 'wonderful', 'amazing', 'good',
      'delighted', 'pleased', 'glad', 'thrilled', 'ecstatic', 'content',
      'cheerful', 'joyful', 'elated', 'overjoyed', 'blissful', 'grateful',
      'blessed', 'fortunate', 'lucky', 'satisfied', 'successful'
    ],
    sad: [
      'sad', 'unhappy', 'depressed', 'down', 'blue', 'upset', 'cry',
      'miserable', 'heartbroken', 'gloomy', 'somber', 'melancholy',
      'tearful', 'sorrowful', 'grief', 'mourning', 'dejected',
      'disappointed', 'regretful', 'lonely', 'isolated', 'abandoned'
    ],
    angry: [
      'angry', 'mad', 'furious', 'annoyed', 'frustrated', 'irritated',
      'outraged', 'enraged', 'infuriated', 'livid', 'seething', 'hostile',
      'resentful', 'bitter', 'indignant', 'irate', 'fuming',
      'aggravated', 'exasperated', 'disgusted', 'offended'
    ],
    anxious: [
      'anxious', 'worried', 'nervous', 'stress', 'afraid', 'fear',
      'panicked', 'terrified', 'scared', 'uneasy', 'apprehensive',
      'concerned', 'troubled', 'restless', 'tense', 'overwhelmed',
      'insecure', 'uncertain', 'doubtful', 'hesitant', 'paranoid'
    ],
    distressed: [
      'help', 'emergency', 'pain', 'hurt', 'terrible', 'unbearable', 'suicidal', 'hopeless',
      'desperate', 'suffering', 'agony', 'anguish', 'torment', 'torture',
      'misery', 'trauma', 'crisis', 'breakdown', 'collapse', 'end it all',
      'can\'t take it', 'can\'t go on', 'give up', 'no way out', 'no hope',
      'kill myself', 'end my life', 'self-harm', 'harm myself', 'die'
    ],
    hopeful: [
      'hope', 'optimistic', 'looking forward', 'positive', 'better',
      'encouraged', 'inspired', 'motivated', 'determined', 'confident',
      'assured', 'promising', 'bright', 'uplifting', 'reassuring',
      'anticipating', 'eager', 'enthusiastic', 'excited about future'
    ]
  };

  // Calculate emotion scores
  const emotionScores = {};
  for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
    let score = 0;
    for (const keyword of keywords) {
      // Use regex to match whole words only
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      const matches = text_lower.match(regex);
      if (matches) {
        score += matches.length;
      }
    }
    emotionScores[emotion] = score;
  }

  // Calculate distress level (0-10 scale)
  let distressLevel = 0;
  if (emotionScores.distressed > 0) {
    // Base distress level on number of distress keywords found
    distressLevel = Math.min(10, emotionScores.distressed * 2);
  } else if (emotionScores.anxious > 0) {
    distressLevel = Math.min(6, emotionScores.anxious);
  } else if (emotionScores.sad > 0) {
    distressLevel = Math.min(4, emotionScores.sad);
  } else if (emotionScores.angry > 0) {
    distressLevel = Math.min(5, emotionScores.angry);
  }

  // Check for specific high-distress phrases
  const highDistressPhrases = [
    'kill myself', 'end my life', 'suicide', 'want to die',
    'no reason to live', 'can\'t go on', 'better off dead'
  ];

  if (highDistressPhrases.some(phrase => text_lower.includes(phrase))) {
    distressLevel = 10;
  }

  // Get the dominant emotion (highest score)
  let dominantEmotion = 'neutral';
  let maxScore = 0;

  for (const [emotion, score] of Object.entries(emotionScores)) {
    if (score > maxScore) {
      maxScore = score;
      dominantEmotion = emotion;
    }
  }

  // If distress level is very high, override with distressed
  if (distressLevel >= 7 && dominantEmotion !== 'distressed') {
    dominantEmotion = 'distressed';
  }

  return {
    emotion: maxScore > 0 ? dominantEmotion : 'neutral',
    distressLevel: distressLevel
  };
};

/**
 * Analyze conversation for patterns and topics
 * @param {Array} messages - Array of message objects
 * @returns {String} Analysis of conversation
 */
const analyzeConversation = (messages) => {
  if (!messages || messages.length < 3) {
    return ''; // Not enough messages to analyze
  }

  let analysis = '';

  // Extract user messages
  const userMessages = messages.filter(msg => msg.sender === 'user');
  if (userMessages.length < 2) {
    return ''; // Not enough user messages to analyze
  }

  // Track emotional trend
  const emotions = userMessages
    .filter(msg => msg.emotionDetected)
    .map(msg => msg.emotionDetected);

  if (emotions.length >= 3) {
    // Check if emotions are trending negative
    const negativeEmotions = ['sad', 'angry', 'anxious', 'distressed'];
    const recentEmotions = emotions.slice(-3);
    const negativeCount = recentEmotions.filter(e => negativeEmotions.includes(e)).length;

    if (negativeCount >= 2) {
      analysis += '- User emotions are trending negative\n';
    } else if (recentEmotions.every(e => e === 'happy' || e === 'hopeful')) {
      analysis += '- User emotions are trending positive\n';
    } else if (recentEmotions.every(e => e === 'neutral')) {
      analysis += '- User is maintaining neutral emotional tone\n';
    }
  }

  // Check for repeated questions or concerns
  const userTexts = userMessages.map(msg => msg.content.toLowerCase());
  const repeatedConcerns = findRepeatedConcerns(userTexts);

  if (repeatedConcerns.length > 0) {
    analysis += `- User has repeatedly mentioned: ${repeatedConcerns.join(', ')}\n`;
  }

  // Identify main topics
  const fertilityKeywords = {
    'cycle': ['cycle', 'period', 'menstruation', 'flow', 'bleeding', 'spotting'],
    'ovulation': ['ovulate', 'ovulation', 'fertile window', 'egg', 'follicle', 'LH surge'],
    'pregnancy': ['pregnant', 'pregnancy', 'conception', 'baby', 'embryo', 'fetus'],
    'ivf': ['ivf', 'in vitro', 'retrieval', 'transfer', 'embryo transfer', 'stimulation'],
    'symptoms': ['symptom', 'pain', 'cramp', 'nausea', 'tender', 'sore', 'tired', 'fatigue'],
    'medications': ['medication', 'medicine', 'pill', 'drug', 'dose', 'prescription'],
    'emotions': ['feel', 'feeling', 'emotion', 'stress', 'anxiety', 'worry', 'hope', 'fear']
  };

  const topicCounts = {};

  userTexts.forEach(text => {
    Object.entries(fertilityKeywords).forEach(([topic, keywords]) => {
      if (keywords.some(keyword => text.includes(keyword))) {
        topicCounts[topic] = (topicCounts[topic] || 0) + 1;
      }
    });
  });

  const mainTopics = Object.entries(topicCounts)
    .filter(([_, count]) => count >= 2)
    .map(([topic, _]) => topic);

  if (mainTopics.length > 0) {
    analysis += `- Main topics of interest: ${mainTopics.join(', ')}\n`;
  }

  // Analyze conversation style
  const avgMessageLength = userTexts.reduce((sum, text) => sum + text.length, 0) / userTexts.length;

  if (avgMessageLength < 50) {
    analysis += '- User tends to be brief and direct\n';
  } else if (avgMessageLength > 150) {
    analysis += '- User provides detailed and lengthy messages\n';
  }

  // Check for question frequency
  const questionCount = userTexts.filter(text => text.includes('?')).length;
  const questionRatio = questionCount / userTexts.length;

  if (questionRatio > 0.7) {
    analysis += '- User primarily asks questions rather than sharing information\n';
  }

  return analysis;
};

/**
 * Find repeated concerns in user messages
 * @param {Array} messages - Array of message strings
 * @returns {Array} Array of repeated concerns
 */
const findRepeatedConcerns = (messages) => {
  // Common fertility concerns
  const concernPatterns = [
    { regex: /\b(worry|worried|anxious|anxiety|stress|stressed)\b/gi, concern: 'anxiety/stress' },
    { regex: /\b(pain|hurt|ache|cramp)\b/gi, concern: 'pain/discomfort' },
    { regex: /\b(pregnant|pregnancy|conceive|conception)\b/gi, concern: 'getting pregnant' },
    { regex: /\b(period|cycle|irregular|late|early)\b/gi, concern: 'cycle regularity' },
    { regex: /\b(symptom|sign)\b/gi, concern: 'symptoms' },
    { regex: /\b(medication|medicine|drug|pill|dose)\b/gi, concern: 'medications' },
    { regex: /\b(ivf|in vitro|transfer|retrieval)\b/gi, concern: 'IVF treatment' },
    { regex: /\b(partner|husband|wife|spouse)\b/gi, concern: 'partner issues' }
  ];

  // Count occurrences of each concern
  const concernCounts = {};

  messages.forEach(message => {
    concernPatterns.forEach(({ regex, concern }) => {
      if (message.match(regex)) {
        concernCounts[concern] = (concernCounts[concern] || 0) + 1;
      }
    });
  });

  // Return concerns mentioned multiple times
  return Object.entries(concernCounts)
    .filter(([_, count]) => count >= 2)
    .map(([concern, _]) => concern);
};
