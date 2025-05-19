/**
 * Community Seeder
 * 
 * Creates test community data with posts and interactions
 */

const Community = require('../models/community.model');
const User = require('../models/user.model');
const { faker } = require('@faker-js/faker');

// Community categories
const COMMUNITY_CATEGORIES = [
  'IVF Warriors', 'PCOS Support', 'LGBTQ+', 'Single Moms by Choice', 
  'Pregnancy Loss', 'Fertility Journey', 'General', 'Other'
];

// Community descriptions
const COMMUNITY_DESCRIPTIONS = {
  'IVF Warriors': 'A supportive community for those going through IVF treatment. Share your journey, ask questions, and connect with others who understand.',
  'PCOS Support': 'A space for those managing PCOS to share experiences, treatment options, and lifestyle changes that help with symptoms.',
  'LGBTQ+': 'A welcoming community for LGBTQ+ individuals and couples navigating fertility and family building journeys.',
  'Single Moms by Choice': 'Connect with other women who have chosen to become mothers on their own through various paths to parenthood.',
  'Pregnancy Loss': 'A compassionate space for those who have experienced miscarriage, stillbirth, or other pregnancy losses.',
  'Fertility Journey': 'A general community for anyone on their fertility journey, regardless of diagnosis or treatment path.',
  'General': 'Open discussions about reproductive health, fertility, and family building.',
  'Other': 'Discussions about specialized topics related to fertility and reproductive health.'
};

// Community rules
const COMMUNITY_RULES = [
  {
    title: 'Be Respectful',
    description: 'Treat all members with kindness and respect. No harassment, bullying, or hate speech.'
  },
  {
    title: 'Protect Privacy',
    description: 'Do not share personal information about yourself or others. Respect confidentiality.'
  },
  {
    title: 'No Medical Advice',
    description: 'Members can share experiences but should not give medical advice. Consult healthcare professionals for medical guidance.'
  },
  {
    title: 'No Promotions',
    description: 'No advertising, spam, or self-promotion without moderator approval.'
  },
  {
    title: 'Trigger Warnings',
    description: 'Use trigger warnings for sensitive content like pregnancy announcements or loss details.'
  },
  {
    title: 'Stay On Topic',
    description: 'Keep discussions relevant to the community theme and purpose.'
  }
];

/**
 * Create a single community
 * @param {Number} index - Index for generating unique communities
 * @param {Array} users - Array of user documents
 * @param {Number} postsPerCommunity - Number of posts to create per community
 * @param {Number} commentsPerPost - Number of comments to create per post
 * @returns {Object} Created community document
 */
const createCommunity = async (index, users, postsPerCommunity, commentsPerPost) => {
  // Select admin and moderators
  const adminUsers = users.filter(u => u.role === 'admin' || u.role === 'moderator');
  const regularUsers = users.filter(u => u.role === 'user' || u.role === 'partner');
  
  const admin = faker.helpers.arrayElement(adminUsers);
  const moderators = faker.helpers.arrayElements(
    adminUsers.filter(u => u._id.toString() !== admin._id.toString()),
    faker.number.int({ min: 0, max: 2 })
  );
  
  // Select category
  const category = COMMUNITY_CATEGORIES[index % COMMUNITY_CATEGORIES.length];
  
  // Create community
  const community = new Community({
    name: `${category} ${faker.word.adjective()} Community`,
    description: COMMUNITY_DESCRIPTIONS[category] || faker.lorem.paragraph(),
    category,
    coverImage: `community-cover-${index % 5 + 1}.jpg`,
    icon: `community-icon-${index % 5 + 1}.jpg`,
    rules: faker.helpers.arrayElements(COMMUNITY_RULES, faker.number.int({ min: 2, max: 5 })),
    isPrivate: faker.datatype.boolean(0.3),
    requiresApproval: faker.datatype.boolean(0.2),
    isVerified: true,
    verificationDetails: {
      verifiedBy: admin._id,
      verificationDate: faker.date.past({ months: 2 }),
      verificationNotes: 'Verified by admin'
    },
    isActive: true,
    createdBy: admin._id,
    createdAt: faker.date.past({ months: 6 }),
    updatedAt: faker.date.recent()
  });
  
  // Add admin as member
  community.members.push({
    user: admin._id,
    role: 'admin',
    joinedAt: community.createdAt
  });
  
  // Add moderators as members
  for (const mod of moderators) {
    community.members.push({
      user: mod._id,
      role: 'moderator',
      joinedAt: faker.date.between({ from: community.createdAt, to: new Date() })
    });
  }
  
  // Add regular members
  const memberCount = faker.number.int({ min: 5, max: 15 });
  const members = faker.helpers.arrayElements(regularUsers, memberCount);
  
  for (const member of members) {
    community.members.push({
      user: member._id,
      role: 'member',
      joinedAt: faker.date.between({ from: community.createdAt, to: new Date() })
    });
    
    // Update user's joined communities
    await User.findByIdAndUpdate(member._id, {
      $addToSet: { joinedCommunities: community._id }
    });
  }
  
  // Add posts
  const posts = generatePosts(community, [...members, admin, ...moderators], postsPerCommunity, commentsPerPost);
  community.posts = posts;
  
  // Save community
  await community.save();
  
  return community;
};

/**
 * Generate posts for a community
 * @param {Object} community - Community document
 * @param {Array} members - Array of community members
 * @param {Number} postCount - Number of posts to generate
 * @param {Number} commentsPerPost - Number of comments per post
 * @returns {Array} Array of post objects
 */
const generatePosts = (community, members, postCount, commentsPerPost) => {
  const posts = [];
  
  for (let i = 0; i < postCount; i++) {
    const author = faker.helpers.arrayElement(members);
    const isAnonymous = faker.datatype.boolean(0.2);
    const createdAt = faker.date.between({ from: community.createdAt, to: new Date() });
    
    // Generate post content based on community category
    let content = '';
    
    switch (community.category) {
      case 'IVF Warriors':
        content = faker.helpers.arrayElement([
          `Just had my egg retrieval today! They got ${faker.number.int({ min: 5, max: 20 })} eggs. Feeling hopeful but also nervous about the fertilization report tomorrow.`,
          `Starting stims tomorrow for my ${faker.helpers.arrayElement(['first', 'second', 'third'])} IVF cycle. Any advice on managing the injections?`,
          `Had my transfer yesterday! One ${faker.helpers.arrayElement(['day 3', 'day 5'])} embryo on board. Now begins the dreaded two-week wait.`,
          `Got our PGT results back today. Out of ${faker.number.int({ min: 3, max: 8 })} embryos, we have ${faker.number.int({ min: 1, max: 5 })} normal ones. Feeling ${faker.helpers.arrayElement(['grateful', 'mixed emotions', 'disappointed but hopeful'])}.`,
          `Insurance denied our coverage for IVF. Has anyone appealed successfully? Looking for advice.`
        ]);
        break;
      case 'PCOS Support':
        content = faker.helpers.arrayElement([
          `Just diagnosed with PCOS last week. Feeling overwhelmed with all the information. What lifestyle changes have helped you the most?`,
          `Has anyone tried inositol supplements? Did they help regulate your cycles?`,
          `Finally got my period after ${faker.number.int({ min: 60, max: 120 })} days! Small victories.`,
          `My doctor suggested metformin for my PCOS. What side effects should I expect?`,
          `Struggling with PCOS-related hair growth. What treatments have worked for you?`
        ]);
        break;
      case 'Pregnancy Loss':
        content = faker.helpers.arrayElement([
          `Had my miscarriage last week at ${faker.number.int({ min: 6, max: 12 })} weeks. Feeling empty and sad. How did you cope with the grief?`,
          `It's been 3 months since my loss, and I'm thinking about trying again. How did you know when you were ready?`,
          `Having a hard day today. My due date would have been next week.`,
          `Just wanted to share that there is hope after loss. After 2 miscarriages, I'm now 20 weeks pregnant with a healthy baby.`,
          `How did you handle insensitive comments after your loss?`
        ]);
        break;
      default:
        content = faker.lorem.paragraph();
    }
    
    const post = {
      author: author._id,
      content,
      isAnonymous,
      createdAt,
      updatedAt: createdAt,
      likes: [],
      comments: [],
      isReported: faker.datatype.boolean(0.05),
      isModerated: false,
      isHidden: false
    };
    
    // Add likes
    const likeCount = faker.number.int({ min: 0, max: 10 });
    const likers = faker.helpers.arrayElements(members, likeCount);
    
    for (const liker of likers) {
      post.likes.push({
        user: liker._id,
        createdAt: faker.date.between({ from: createdAt, to: new Date() })
      });
    }
    
    // Add comments
    const commentCount = faker.number.int({ min: 0, max: commentsPerPost });
    
    for (let j = 0; j < commentCount; j++) {
      const commenter = faker.helpers.arrayElement(members);
      const commentCreatedAt = faker.date.between({ from: createdAt, to: new Date() });
      
      post.comments.push({
        author: commenter._id,
        content: faker.lorem.sentences({ min: 1, max: 3 }),
        isAnonymous: faker.datatype.boolean(0.1),
        createdAt: commentCreatedAt,
        updatedAt: commentCreatedAt,
        likes: []
      });
    }
    
    // Add reports for some posts
    if (post.isReported) {
      post.reports = [{
        user: faker.helpers.arrayElement(members)._id,
        reason: faker.helpers.arrayElement([
          'Inappropriate content',
          'Off-topic',
          'Spam',
          'Offensive language',
          'Misinformation'
        ]),
        details: faker.lorem.sentence(),
        createdAt: faker.date.recent()
      }];
    }
    
    posts.push(post);
  }
  
  return posts;
};

/**
 * Seed communities
 * @param {Number} count - Number of communities to create
 * @param {Array} users - Array of user documents
 * @param {Number} postsPerCommunity - Number of posts to create per community
 * @param {Number} commentsPerPost - Number of comments to create per post
 * @returns {Array} Array of created community documents
 */
const seedCommunities = async (count, users, postsPerCommunity, commentsPerPost) => {
  const communities = [];
  
  for (let i = 0; i < count; i++) {
    const community = await createCommunity(i, users, postsPerCommunity, commentsPerPost);
    communities.push(community);
  }
  
  return communities;
};

module.exports = {
  seedCommunities
};
