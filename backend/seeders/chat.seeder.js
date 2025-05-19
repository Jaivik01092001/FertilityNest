/**
 * Chat Seeder
 *
 * Creates test chat sessions and messages for users
 */

const ChatSession = require('../models/chat.model');
const User = require('../models/user.model');
const { faker } = require('@faker-js/faker');

// Emotion types
const EMOTIONS = [
  'neutral', 'happy', 'sad', 'angry', 'anxious', 'distressed', 'hopeful'
];

// Chat topics for generating realistic conversations
const CHAT_TOPICS = [
  {
    name: 'cycle_tracking',
    userQueries: [
      "How do I track my cycle accurately?",
      "What's the best way to predict ovulation?",
      "I'm confused about my cycle length, is 35 days normal?",
      "How can I tell if I'm in my fertile window?",
      "My periods are irregular, how can I track them better?"
    ],
    aiResponses: [
      "Tracking your cycle involves noting the first day of your period each month. For more accuracy, you can also track basal body temperature, cervical mucus changes, and use ovulation predictor kits. The Anaira app can help you record all these data points in one place.",
      "Ovulation typically occurs 14 days before your next period starts. To predict it accurately, track your basal body temperature (it rises slightly after ovulation) and observe changes in cervical mucus (it becomes clearer and more stretchy during your fertile window).",
      "Cycle lengths can vary from person to person. While the average is 28 days, cycles between 21-35 days are considered normal. If your cycles are consistently 35 days, that's your normal pattern. Consistency is more important than the exact length.",
      "Your fertile window includes the 5 days before ovulation and the day of ovulation itself. Signs include increased clear, stretchy cervical mucus, a slight dip followed by a rise in basal body temperature, and possibly mild cramping or spotting.",
      "For irregular cycles, it's helpful to track multiple fertility signs like cervical mucus and basal temperature. Consider logging lifestyle factors that might affect your cycle - stress, travel, diet changes, exercise. This can help identify patterns over time."
    ]
  },
  {
    name: 'ivf_journey',
    userQueries: [
      "I'm starting IVF next month, what should I expect?",
      "My egg retrieval is tomorrow, I'm so nervous!",
      "How can I prepare my body for embryo transfer?",
      "Got my protocol today - so many medications! How do I manage them all?",
      "Failed my first IVF cycle, feeling devastated. Is this normal?"
    ],
    aiResponses: [
      "Starting IVF involves several steps: ovarian stimulation with daily injections, monitoring through ultrasounds and blood tests, egg retrieval under sedation, fertilization in the lab, and embryo transfer. The process typically takes 2-3 weeks from stimulation to transfer. Prepare by gathering support, organizing your medication schedule, and practicing self-care.",
      "It's completely normal to feel nervous before egg retrieval. The procedure itself is relatively quick (20-30 minutes) and you'll be under sedation. Remember to have someone accompany you, wear comfortable clothing, and follow your clinic's instructions about fasting. After the procedure, expect to rest for the remainder of the day.",
      "To prepare for embryo transfer, follow your doctor's medication protocol exactly. Many recommend gentle activities like walking, adequate hydration, and stress reduction techniques. Some clinics suggest increasing protein intake and keeping your core warm. Avoid strenuous exercise, hot baths, and any medications not approved by your doctor.",
      "Managing IVF medications can be overwhelming. Create a detailed calendar or use a medication tracking app. Organize your supplies in a dedicated area. Set alarms for injection times. Some find it helpful to prepare a daily kit each morning with that day's medications. Don't hesitate to call your clinic with questions about your protocol.",
      "I'm truly sorry about your failed cycle. The grief and disappointment you're feeling are absolutely normal and valid. Many people need multiple IVF attempts before success. When you're ready, consider a follow-up consultation to discuss what might be adjusted for future cycles. In the meantime, be gentle with yourself and lean on your support network."
    ]
  },
  {
    name: 'emotional_support',
    userQueries: [
      "I feel like I'm failing at this whole fertility journey.",
      "How do I deal with seeing pregnancy announcements everywhere?",
      "I'm so tired of people asking when we're having kids.",
      "My partner doesn't understand how hard this is for me.",
      "I feel so alone in this journey sometimes."
    ],
    aiResponses: [
      "What you're feeling is completely valid. Fertility challenges can be incredibly difficult, and they don't reflect your worth or abilities. This journey involves so many factors outside your control. Be gentle with yourself - you're doing the best you can with a genuinely difficult situation.",
      "Pregnancy announcements can be painful when you're struggling with fertility. It's okay to mute social media accounts or take breaks from platforms altogether. Consider preparing a simple response for in-person announcements, and give yourself permission to step away if needed. Remember that your feelings are valid and protecting your emotional health is important.",
      "Those questions can be incredibly intrusive and hurtful. Consider preparing a brief response that sets boundaries, like 'That's a private matter for us' or 'We'll share news when we have it.' Close friends might deserve more honesty: 'We're working on it, but it's been difficult, and I'd appreciate not being asked about it.'",
      "This disconnect is common in fertility journeys. Consider expressing your feelings using 'I' statements rather than accusations. You might also invite your partner to a counseling session or doctor's appointment to help them understand the medical and emotional aspects better. Remember that people process these challenges differently.",
      "The isolation of fertility struggles can be profound. Consider joining a support group - either in-person or online - where you can connect with others who truly understand. The shared experiences can be incredibly validating and provide practical advice too. You're not alone, even though it sometimes feels that way."
    ]
  },
  {
    name: 'medication_questions',
    userQueries: [
      "I forgot to take my Letrozole yesterday, what should I do?",
      "Are there any natural supplements that help with fertility?",
      "My progesterone is making me so bloated and tired, is this normal?",
      "Can I drink alcohol while taking fertility medications?",
      "I'm scared of giving myself injections, any tips?"
    ],
    aiResponses: [
      "If you missed a dose of Letrozole, contact your doctor's office for specific guidance as soon as possible. Generally, if it's been less than 12 hours, you might be advised to take it when you remember. If it's closer to your next dose, they might suggest skipping the missed dose. Never double-dose without medical advice.",
      "Some supplements have shown promise for fertility support, including CoQ10, myo-inositol, vitamin D, and omega-3 fatty acids. However, it's crucial to discuss any supplements with your doctor before starting them, as some can interact with medications or be contraindicated for certain conditions.",
      "Bloating, fatigue, and mood changes are common side effects of progesterone supplementation. These symptoms occur because progesterone naturally slows digestion and can affect energy levels. While uncomfortable, these are typically normal reactions. Stay hydrated and maintain gentle movement to help with the bloating.",
      "Most fertility specialists recommend avoiding alcohol during fertility treatment cycles. Alcohol can affect hormone levels and potentially impact treatment outcomes. If you're not currently in an active treatment cycle, moderate consumption (1 drink per day for women) may be acceptable, but it's best to discuss with your doctor.",
      "Self-injections can be intimidating at first. Try numbing the area with ice beforehand, injecting slowly, and using distraction techniques. Some find it helpful to have their partner or a friend present for support. Remember that it gets easier with practice - many patients report the anticipation is worse than the actual injection."
    ]
  },
  {
    name: 'general_fertility',
    userQueries: [
      "What foods should I eat to improve egg quality?",
      "How does stress affect fertility?",
      "Is it true that age 35 is a fertility cliff?",
      "What's the difference between IUI and IVF?",
      "How can I improve my partner's sperm quality?"
    ],
    aiResponses: [
      "A Mediterranean-style diet rich in antioxidants may support egg quality. Focus on colorful fruits and vegetables, healthy fats like olive oil and avocados, lean proteins, and whole grains. Some studies suggest foods high in omega-3 fatty acids, folate, and coenzyme Q10 may be particularly beneficial. Stay hydrated and limit processed foods, excessive caffeine, and alcohol.",
      "Stress can potentially impact fertility by affecting hormone levels, ovulation, and sperm production. While stress alone rarely causes infertility, chronic stress may contribute to fertility challenges for some people. Stress reduction techniques like mindfulness, gentle exercise, adequate sleep, and counseling may be helpful as part of your overall fertility plan.",
      "Rather than a sudden 'cliff,' fertility declines gradually with age. While fertility does decrease more rapidly after 35, many women conceive naturally in their late 30s and early 40s. Age affects both egg quantity and quality, but the impact varies significantly between individuals. Your personal fertility is influenced by many factors beyond just age.",
      "IUI (intrauterine insemination) involves placing sperm directly into the uterus during ovulation, bypassing the cervix. It's less invasive and less expensive than IVF but has lower success rates. IVF (in vitro fertilization) involves stimulating the ovaries to produce multiple eggs, retrieving those eggs, fertilizing them in a lab, and transferring resulting embryos to the uterus.",
      "Sperm quality can be improved through lifestyle changes including: maintaining a healthy weight, eating a balanced diet rich in antioxidants, regular moderate exercise, reducing alcohol, eliminating smoking and recreational drugs, managing stress, and avoiding excessive heat to the testicles. Some doctors may recommend supplements like CoQ10, vitamin C, or zinc, though evidence varies."
    ]
  }
];

/**
 * Create a single chat session for a user
 * @param {String} userId - User ID
 * @param {Object} user - User document
 * @param {Number} index - Index for generating unique sessions
 * @param {Number} messageCount - Number of messages to create
 * @returns {Object} Created chat session document
 */
const createChatSession = async (userId, user, index, messageCount) => {
  // Select a random chat topic
  const topic = faker.helpers.arrayElement(CHAT_TOPICS);

  // Create chat session
  const chatSession = new ChatSession({
    user: userId,
    title: `Chat about ${topic.name.replace('_', ' ')}`,
    messages: [],
    context: {
      cycleDay: faker.number.int({ min: 1, max: 28 }),
      fertilityStage: user.fertilityStage,
      recentSymptoms: faker.helpers.arrayElements(
        ['cramps', 'headache', 'bloating', 'fatigue', 'mood swings', 'breast tenderness'],
        faker.number.int({ min: 0, max: 3 })
      ),
      recentMedications: faker.helpers.arrayElements(
        ['Clomid', 'Letrozole', 'Progesterone', 'Prenatal Vitamin', 'CoQ10'],
        faker.number.int({ min: 0, max: 2 })
      ),
      userJourneyType: user.journeyType
    },
    tags: generateTags(topic.name),
    distressDetected: faker.datatype.boolean(0.2),
    distressActionTaken: faker.datatype.boolean(0.1),
    isActive: true,
    createdAt: faker.date.past({ months: 3 }),
    updatedAt: faker.date.recent()
  });

  // Save the session first to get an ID
  await chatSession.save();

  // Now generate messages
  const messages = generateMessages(topic, messageCount, chatSession.createdAt);

  // Add messages to the session
  chatSession.messages = messages;

  // Generate a summary based on the first message
  if (messages.length > 0) {
    chatSession.summary = generateSummary(messages[0].content, messages.length);
  }

  // Update the session with messages
  await chatSession.save();

  return chatSession;
};

/**
 * Generate messages for a chat session
 * @param {Object} topic - Chat topic with sample queries and responses
 * @param {Number} count - Number of messages to generate
 * @param {Date} startDate - Chat session start date
 * @returns {Array} Array of message objects
 */
const generateMessages = (topic, count, startDate) => {
  const messages = [];
  const now = new Date();

  // Ensure we have at least one message pair (user question + AI response)
  const actualCount = Math.max(count, 2);
  const pairs = Math.floor(actualCount / 2);

  for (let i = 0; i < pairs; i++) {
    // Calculate message timestamp
    const timeOffset = (i / pairs) * (now - startDate);
    const timestamp = new Date(startDate.getTime() + timeOffset);

    // Select a random query and response pair
    const randomIndex = faker.number.int({ min: 0, max: topic.userQueries.length - 1 });
    const userQuery = topic.userQueries[randomIndex];
    const aiResponse = topic.aiResponses[randomIndex];

    // Determine emotion for this message
    let emotion = faker.helpers.arrayElement(EMOTIONS);
    let distressLevel = 0;

    // If topic is emotional_support, higher chance of negative emotions
    if (topic.name === 'emotional_support') {
      emotion = faker.helpers.arrayElement(['sad', 'anxious', 'distressed', 'neutral', 'hopeful']);

      if (emotion === 'distressed') {
        distressLevel = faker.number.int({ min: 7, max: 10 });
      } else if (emotion === 'anxious') {
        distressLevel = faker.number.int({ min: 4, max: 7 });
      } else if (emotion === 'sad') {
        distressLevel = faker.number.int({ min: 3, max: 6 });
      }
    } else {
      // For other topics, mostly neutral or positive emotions
      emotion = faker.helpers.weightedArrayElement([
        { weight: 5, value: 'neutral' },
        { weight: 2, value: 'happy' },
        { weight: 2, value: 'hopeful' },
        { weight: 1, value: 'anxious' },
        { weight: 0.5, value: 'sad' },
        { weight: 0.2, value: 'distressed' }
      ]);

      if (emotion === 'distressed') {
        distressLevel = faker.number.int({ min: 7, max: 10 });
      } else if (emotion === 'anxious') {
        distressLevel = faker.number.int({ min: 3, max: 6 });
      } else if (emotion === 'sad') {
        distressLevel = faker.number.int({ min: 2, max: 5 });
      }
    }

    // Add user message
    messages.push({
      sender: 'user',
      content: userQuery,
      timestamp: timestamp,
      emotionDetected: emotion,
      distressLevel: distressLevel,
      metadata: {
        emotionAnalysis: {
          emotion: emotion,
          distressLevel: distressLevel
        }
      }
    });

    // Add AI response
    messages.push({
      sender: 'ai',
      content: aiResponse,
      timestamp: new Date(timestamp.getTime() + 5000), // 5 seconds later
      emotionDetected: 'neutral',
      distressLevel: 0,
      metadata: {}
    });
  }

  return messages;
};

/**
 * Generate tags for a chat session
 * @param {String} topicName - Name of the chat topic
 * @returns {Array} Array of tag strings
 */
const generateTags = (topicName) => {
  const baseTags = [topicName.replace('_', ' ')];

  const possibleTags = {
    cycle_tracking: ['cycle', 'tracking', 'ovulation', 'period'],
    ivf_journey: ['ivf', 'treatment', 'embryo', 'retrieval', 'transfer'],
    emotional_support: ['emotions', 'support', 'feelings', 'stress'],
    medication_questions: ['medication', 'supplements', 'side effects'],
    general_fertility: ['fertility', 'health', 'nutrition', 'lifestyle']
  };

  // Add 1-3 additional tags from the topic's possible tags
  const additionalTags = faker.helpers.arrayElements(
    possibleTags[topicName] || [],
    faker.number.int({ min: 1, max: 3 })
  );

  return [...baseTags, ...additionalTags];
};

/**
 * Generate a summary for a chat session
 * @param {String} firstMessage - First message content
 * @param {Number} messageCount - Total number of messages
 * @returns {String} Generated summary
 */
const generateSummary = (firstMessage, messageCount) => {
  // Truncate first message if too long
  const truncatedMessage = firstMessage.length > 50
    ? firstMessage.substring(0, 50) + '...'
    : firstMessage;

  return `${truncatedMessage} (${messageCount} messages)`;
};

/**
 * Seed chat sessions for multiple users
 * @param {Array} userIds - Array of user IDs
 * @param {Number} sessionsPerUser - Number of chat sessions to create per user
 * @param {Number} messagesPerSession - Number of messages to create per session
 * @returns {Array} Array of created chat session documents
 */
const seedChatSessions = async (userIds, sessionsPerUser, messagesPerSession) => {
  const chatSessions = [];

  for (const userId of userIds) {
    // Get the user document for context
    const user = await User.findById(userId);

    for (let i = 0; i < sessionsPerUser; i++) {
      const chatSession = await createChatSession(userId, user, i, messagesPerSession);
      chatSessions.push(chatSession);
    }
  }

  return chatSessions;
};

module.exports = {
  seedChatSessions
};
