import { collection, addDoc, query, where, getDocs, getDoc, doc, updateDoc, Timestamp, orderBy, limit } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { getFileContent } from './storageService';

// API key for Gemini AI
const API_KEY = 'AIzaSyC_JpUazzp4cfukgazRk4HufNw5fjFrMHU';
const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

/**
 * Generate a quiz based on document content
 * @param {Object} fileData - File metadata including downloadURL
 * @param {number} questionCount - Number of questions to generate
 * @returns {Promise<Object>} - Generated quiz with questions and answers
 */
export const generateDocumentQuiz = async (fileData, questionCount = 20) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');
    
    // Get file content
    let documentContent = '';
    try {
      documentContent = await getFileContent(fileData.downloadURL);
    } catch (error) {
      console.error('Error getting file content:', error);
      documentContent = `[Content extraction failed for ${fileData.fileName}]`;
    }
    
    // Create a prompt for the AI
    const prompt = `Generate a quiz with ${questionCount} multiple-choice questions based on the following document content. 
    
Document name: ${fileData.fileName}

Document content:
${documentContent.substring(0, 15000)}${documentContent.length > 15000 ? '... (content truncated)' : ''}

Each question should have 4 options (A, B, C, D) with only one correct answer.
The questions should test understanding of key concepts, facts, and information from the document.

Format the response as a JSON array of objects, where each object has the following structure:
{
  "question": "The question text",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctAnswer": 0 // Index of the correct answer (0-3)
}

Make sure the questions are challenging but fair, and directly related to the document content.`;

    // Call the Gemini API
    const response = await fetch(`${API_URL}?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 8192,
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    
    // Extract the JSON part from the response
    const text = data.candidates[0].content.parts[0].text;
    const jsonMatch = text.match(/\\[\\s*\\{.*\\}\\s*\\]/s);
    
    let questions = [];
    
    if (jsonMatch) {
      const jsonStr = jsonMatch[0];
      questions = JSON.parse(jsonStr);
    } else {
      // If JSON extraction fails, generate fallback questions
      questions = generateFallbackQuestions(fileData.fileName, questionCount);
    }
    
    // Save quiz to Firestore
    const quizData = {
      userId: user.uid,
      fileId: fileData.id,
      fileName: fileData.fileName,
      questions,
      createdAt: Timestamp.now(),
      lastAttemptedAt: null,
      attempts: 0,
      bestScore: 0
    };
    
    const docRef = await addDoc(collection(db, 'quizzes'), quizData);
    
    return {
      id: docRef.id,
      ...quizData
    };
  } catch (error) {
    console.error('Error generating quiz:', error);
    
    // Generate fallback questions if API fails
    const fallbackQuestions = generateFallbackQuestions(fileData.fileName, questionCount);
    
    // Save fallback quiz to Firestore
    const quizData = {
      userId: auth.currentUser.uid,
      fileId: fileData.id,
      fileName: fileData.fileName,
      questions: fallbackQuestions,
      createdAt: Timestamp.now(),
      lastAttemptedAt: null,
      attempts: 0,
      bestScore: 0
    };
    
    const docRef = await addDoc(collection(db, 'quizzes'), quizData);
    
    return {
      id: docRef.id,
      ...quizData
    };
  }
};

/**
 * Generate fallback questions if AI generation fails
 * @param {string} fileName - Name of the file
 * @param {number} questionCount - Number of questions to generate
 * @returns {Array} - Array of question objects
 */
const generateFallbackQuestions = (fileName, questionCount) => {
  const baseQuestions = [
    {
      question: `What is the name of the document you uploaded?`,
      options: [
        fileName,
        `Report_${fileName}`,
        `Summary_${fileName}`,
        `Draft_${fileName}`
      ],
      correctAnswer: 0
    },
    {
      question: "What type of information would you typically find in this kind of document?",
      options: [
        "Technical specifications and requirements",
        "Company policies and procedures",
        "Financial data and projections",
        "All of the above, depending on the document's purpose"
      ],
      correctAnswer: 3
    },
    {
      question: "When reviewing a document like this, what should you pay most attention to?",
      options: [
        "Only the executive summary",
        "Just the conclusions and recommendations",
        "The entire document for comprehensive understanding",
        "Only sections relevant to your specific role"
      ],
      correctAnswer: 2
    },
    {
      question: "How should you handle confidential information contained in documents?",
      options: [
        "Share it only with your immediate team members",
        "Follow Dell's data classification and handling policies",
        "Password-protect any copies you make",
        "Redact sensitive information before storing"
      ],
      correctAnswer: 1
    },
    {
      question: "What is the best practice for document version control?",
      options: [
        "Save multiple copies with different filenames",
        "Use a document management system with version history",
        "Email new versions to yourself",
        "Print and store physical copies"
      ],
      correctAnswer: 1
    }
  ];
  
  // Fill remaining questions with generic document-related questions
  const questions = [...baseQuestions];
  for (let i = questions.length; i < questionCount; i++) {
    questions.push({
      question: `Generic document question #${i + 1}`,
      options: [
        "Option A",
        "Option B",
        "Option C",
        "Option D"
      ],
      correctAnswer: 0
    });
  }
  
  return questions.slice(0, questionCount);
};

/**
 * Get all quizzes for the current user
 * @returns {Promise<Array>} - Array of quiz objects
 */
export const getUserQuizzes = async () => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');
    
    const q = query(
      collection(db, 'quizzes'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const quizzes = [];
    
    querySnapshot.forEach((doc) => {
      quizzes.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return quizzes;
  } catch (error) {
    console.error('Error getting user quizzes:', error);
    throw error;
  }
};

/**
 * Get a specific quiz by ID
 * @param {string} quizId - The quiz document ID
 * @returns {Promise<Object>} - Quiz object
 */
export const getQuiz = async (quizId) => {
  try {
    const docRef = doc(db, 'quizzes', quizId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      };
    } else {
      throw new Error('Quiz not found');
    }
  } catch (error) {
    console.error('Error getting quiz:', error);
    throw error;
  }
};

/**
 * Save quiz attempt
 * @param {string} quizId - The quiz document ID
 * @param {number} score - Score as percentage (0-100)
 * @param {Array} answers - User's answers
 * @returns {Promise<Object>} - Updated quiz object
 */
export const saveQuizAttempt = async (quizId, score, answers) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');
    
    // Get current quiz data
    const quizRef = doc(db, 'quizzes', quizId);
    const quizSnap = await getDoc(quizRef);
    
    if (!quizSnap.exists()) {
      throw new Error('Quiz not found');
    }
    
    const quizData = quizSnap.data();
    
    // Update quiz data
    const updatedData = {
      lastAttemptedAt: Timestamp.now(),
      attempts: quizData.attempts + 1,
      bestScore: Math.max(quizData.bestScore || 0, score)
    };
    
    await updateDoc(quizRef, updatedData);
    
    // Save attempt details
    const attemptData = {
      quizId,
      userId: user.uid,
      score,
      answers,
      timestamp: Timestamp.now()
    };
    
    const attemptRef = await addDoc(collection(db, 'quiz_attempts'), attemptData);
    
    return {
      id: quizId,
      ...quizData,
      ...updatedData,
      currentAttempt: {
        id: attemptRef.id,
        ...attemptData
      }
    };
  } catch (error) {
    console.error('Error saving quiz attempt:', error);
    throw error;
  }
};

/**
 * Get quiz attempts for a specific quiz
 * @param {string} quizId - The quiz document ID
 * @returns {Promise<Array>} - Array of attempt objects
 */
export const getQuizAttempts = async (quizId) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');
    
    const q = query(
      collection(db, 'quiz_attempts'),
      where('quizId', '==', quizId),
      where('userId', '==', user.uid),
      orderBy('timestamp', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const attempts = [];
    
    querySnapshot.forEach((doc) => {
      attempts.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return attempts;
  } catch (error) {
    console.error('Error getting quiz attempts:', error);
    throw error;
  }
};

/**
 * Generate a personalized study plan based on document
 * @param {Object} fileData - File metadata including downloadURL
 * @param {Object} preferences - User preferences for the study plan
 * @returns {Promise<Object>} - Generated study plan
 */
export const generateStudyPlan = async (fileData, preferences) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');
    
    // Get file content
    let documentContent = '';
    try {
      documentContent = await getFileContent(fileData.downloadURL);
    } catch (error) {
      console.error('Error getting file content:', error);
      documentContent = `[Content extraction failed for ${fileData.fileName}]`;
    }
    
    // Create a prompt for the AI
    const prompt = `Generate a personalized study plan for learning the content of a document titled "${fileData.fileName}".

User preferences:
- Start Date: ${preferences.startDate}
- Learning Style: ${preferences.learningStyle}
- Difficulty Level: ${preferences.difficultyLevel}/10
- Available Study Time: ${preferences.studyTime} minutes per day
- Days to Complete: ${preferences.daysToComplete} days

Document content (excerpt):
${documentContent.substring(0, 5000)}${documentContent.length > 5000 ? '... (content truncated)' : ''}

Create a comprehensive study plan that includes:
1. A breakdown of topics to study each day
2. Learning activities tailored to the user's learning style
3. Recommended resources
4. Short quizzes or exercises to reinforce learning
5. Estimated time for each activity

Format the response as a JSON object with the following structure:
{
  "title": "Personalized Study Plan for [Document Name]",
  "overview": "Brief overview of the study plan",
  "totalDays": number,
  "totalStudyTime": "X hours Y minutes",
  "learningStyle": "Description of how the plan is tailored to the learning style",
  "schedule": [
    {
      "day": 1,
      "date": "YYYY-MM-DD",
      "topics": ["Topic 1", "Topic 2"],
      "activities": [
        {
          "type": "reading/video/exercise/quiz",
          "title": "Activity title",
          "description": "Activity description",
          "duration": "X minutes",
          "resources": ["Resource 1", "Resource 2"]
        }
      ],
      "totalTime": "X minutes"
    }
  ],
  "assessmentStrategy": "Description of how learning will be assessed"
}

Make sure the plan is realistic given the user's time constraints and preferences.`;

    // Call the Gemini API
    const response = await fetch(`${API_URL}?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 8192,
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    
    // Extract the JSON part from the response
    const text = data.candidates[0].content.parts[0].text;
    const jsonMatch = text.match(/\\{[\\s\\S]*\\}/);
    
    let studyPlan = null;
    
    if (jsonMatch) {
      const jsonStr = jsonMatch[0];
      studyPlan = JSON.parse(jsonStr);
    } else {
      // If JSON extraction fails, generate fallback study plan
      studyPlan = generateFallbackStudyPlan(fileData.fileName, preferences);
    }
    
    // Save study plan to Firestore
    const studyPlanData = {
      userId: user.uid,
      fileId: fileData.id,
      fileName: fileData.fileName,
      preferences,
      plan: studyPlan,
      createdAt: Timestamp.now(),
      progress: {}
    };
    
    const docRef = await addDoc(collection(db, 'study_plans'), studyPlanData);
    
    return {
      id: docRef.id,
      ...studyPlanData
    };
  } catch (error) {
    console.error('Error generating study plan:', error);
    
    // Generate fallback study plan if API fails
    const fallbackPlan = generateFallbackStudyPlan(fileData.fileName, preferences);
    
    // Save fallback plan to Firestore
    const studyPlanData = {
      userId: auth.currentUser.uid,
      fileId: fileData.id,
      fileName: fileData.fileName,
      preferences,
      plan: fallbackPlan,
      createdAt: Timestamp.now(),
      progress: {}
    };
    
    const docRef = await addDoc(collection(db, 'study_plans'), studyPlanData);
    
    return {
      id: docRef.id,
      ...studyPlanData
    };
  }
};

/**
 * Generate fallback study plan if AI generation fails
 * @param {string} fileName - Name of the file
 * @param {Object} preferences - User preferences for the study plan
 * @returns {Object} - Study plan object
 */
const generateFallbackStudyPlan = (fileName, preferences) => {
  // Calculate dates for the schedule
  const startDate = new Date(preferences.startDate);
  const schedule = [];
  
  for (let day = 1; day <= preferences.daysToComplete; day++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + day - 1);
    
    schedule.push({
      day,
      date: currentDate.toISOString().split('T')[0],
      topics: [`${fileName} - Part ${day}`],
      activities: [
        {
          type: "reading",
          title: `Read ${fileName} - Part ${day}`,
          description: `Carefully read through part ${day} of the document and take notes on key concepts.`,
          duration: `${Math.floor(preferences.studyTime * 0.6)} minutes`,
          resources: [`${fileName} - Section ${day}`]
        },
        {
          type: "exercise",
          title: "Practice Exercises",
          description: "Complete exercises to reinforce your understanding of the material.",
          duration: `${Math.floor(preferences.studyTime * 0.3)} minutes`,
          resources: ["Practice worksheet"]
        },
        {
          type: "quiz",
          title: "Quick Knowledge Check",
          description: "Test your understanding with a short quiz on today's material.",
          duration: `${Math.floor(preferences.studyTime * 0.1)} minutes`,
          resources: ["Self-assessment quiz"]
        }
      ],
      totalTime: `${preferences.studyTime} minutes`
    });
  }
  
  // Create learning style description based on preference
  let learningStyleDesc = "";
  switch (preferences.learningStyle) {
    case "Visual":
      learningStyleDesc = "This plan emphasizes diagrams, charts, and visual representations of concepts.";
      break;
    case "Auditory":
      learningStyleDesc = "This plan emphasizes discussions, audio resources, and verbal explanations.";
      break;
    case "Reading/Writing":
      learningStyleDesc = "This plan emphasizes reading materials and written exercises.";
      break;
    case "Kinesthetic":
      learningStyleDesc = "This plan emphasizes hands-on activities and practical applications.";
      break;
    default:
      learningStyleDesc = "This plan balances different learning approaches to accommodate your preferences.";
  }
  
  return {
    title: `Personalized Study Plan for ${fileName}`,
    overview: `This study plan is designed to help you master the content of ${fileName} over ${preferences.daysToComplete} days, with ${preferences.studyTime} minutes of study per day.`,
    totalDays: preferences.daysToComplete,
    totalStudyTime: `${Math.floor((preferences.daysToComplete * preferences.studyTime) / 60)} hours ${(preferences.daysToComplete * preferences.studyTime) % 60} minutes`,
    learningStyle: learningStyleDesc,
    schedule,
    assessmentStrategy: "Your understanding will be assessed through daily quizzes and a final comprehensive assessment at the end of the study period."
  };
};

/**
 * Get all study plans for the current user
 * @returns {Promise<Array>} - Array of study plan objects
 */
export const getUserStudyPlans = async () => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');
    
    const q = query(
      collection(db, 'study_plans'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const studyPlans = [];
    
    querySnapshot.forEach((doc) => {
      studyPlans.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return studyPlans;
  } catch (error) {
    console.error('Error getting user study plans:', error);
    throw error;
  }
};

/**
 * Get a specific study plan by ID
 * @param {string} planId - The study plan document ID
 * @returns {Promise<Object>} - Study plan object
 */
export const getStudyPlan = async (planId) => {
  try {
    const docRef = doc(db, 'study_plans', planId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      };
    } else {
      throw new Error('Study plan not found');
    }
  } catch (error) {
    console.error('Error getting study plan:', error);
    throw error;
  }
};

/**
 * Update study plan progress
 * @param {string} planId - The study plan document ID
 * @param {number} day - Day number
 * @param {boolean} completed - Whether the day is completed
 * @returns {Promise<Object>} - Updated study plan object
 */
export const updateStudyPlanProgress = async (planId, day, completed) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');
    
    // Get current study plan data
    const planRef = doc(db, 'study_plans', planId);
    const planSnap = await getDoc(planRef);
    
    if (!planSnap.exists()) {
      throw new Error('Study plan not found');
    }
    
    const planData = planSnap.data();
    
    // Update progress
    const progress = planData.progress || {};
    progress[day] = {
      completed,
      timestamp: Timestamp.now()
    };
    
    await updateDoc(planRef, { progress });
    
    return {
      id: planId,
      ...planData,
      progress
    };
  } catch (error) {
    console.error('Error updating study plan progress:', error);
    throw error;
  }
};

/**
 * Generate learning goals based on document
 * @param {Object} fileData - File metadata including downloadURL
 * @returns {Promise<Array>} - Array of learning goal objects
 */
export const generateLearningGoals = async (fileData) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');
    
    // Get file content
    let documentContent = '';
    try {
      documentContent = await getFileContent(fileData.downloadURL);
    } catch (error) {
      console.error('Error getting file content:', error);
      documentContent = `[Content extraction failed for ${fileData.fileName}]`;
    }
    
    // Create a prompt for the AI
    const prompt = `Generate 3 personalized learning goals for a Dell employee studying a document titled "${fileData.fileName}".

Document content (excerpt):
${documentContent.substring(0, 5000)}${documentContent.length > 5000 ? '... (content truncated)' : ''}

Create 3 SMART (Specific, Measurable, Achievable, Relevant, Time-bound) learning goals that will help the employee master the content of this document.

Format the response as a JSON array of objects with the following structure:
[
  {
    "title": "Goal title",
    "description": "Detailed description of the goal",
    "deadline": "YYYY-MM-DD", // Set a realistic deadline within the next 30 days
    "progress": 0, // Initial progress is 0%
    "keyMilestones": [
      "Milestone 1 description",
      "Milestone 2 description",
      "Milestone 3 description"
    ]
  }
]

Make sure the goals are realistic, challenging, and directly related to the document content.`;

    // Call the Gemini API
    const response = await fetch(`${API_URL}?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 4096,
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    
    // Extract the JSON part from the response
    const text = data.candidates[0].content.parts[0].text;
    const jsonMatch = text.match(/\\[\\s*\\{.*\\}\\s*\\]/s);
    
    let goals = [];
    
    if (jsonMatch) {
      const jsonStr = jsonMatch[0];
      goals = JSON.parse(jsonStr);
    } else {
      // If JSON extraction fails, generate fallback goals
      goals = generateFallbackGoals(fileData.fileName);
    }
    
    // Save goals to Firestore
    const goalsData = {
      userId: user.uid,
      fileId: fileData.id,
      fileName: fileData.fileName,
      goals,
      createdAt: Timestamp.now()
    };
    
    const docRef = await addDoc(collection(db, 'learning_goals'), goalsData);
    
    return {
      id: docRef.id,
      ...goalsData
    };
  } catch (error) {
    console.error('Error generating learning goals:', error);
    
    // Generate fallback goals if API fails
    const fallbackGoals = generateFallbackGoals(fileData.fileName);
    
    // Save fallback goals to Firestore
    const goalsData = {
      userId: auth.currentUser.uid,
      fileId: fileData.id,
      fileName: fileData.fileName,
      goals: fallbackGoals,
      createdAt: Timestamp.now()
    };
    
    const docRef = await addDoc(collection(db, 'learning_goals'), goalsData);
    
    return {
      id: docRef.id,
      ...goalsData
    };
  }
};

/**
 * Generate fallback learning goals if AI generation fails
 * @param {string} fileName - Name of the file
 * @returns {Array} - Array of goal objects
 */
const generateFallbackGoals = (fileName) => {
  // Calculate dates for deadlines
  const today = new Date();
  
  const deadline1 = new Date(today);
  deadline1.setDate(today.getDate() + 7);
  
  const deadline2 = new Date(today);
  deadline2.setDate(today.getDate() + 14);
  
  const deadline3 = new Date(today);
  deadline3.setDate(today.getDate() + 30);
  
  return [
    {
      title: `Complete ${fileName} Training`,
      description: `Finish all sections of the ${fileName} document and pass the certification exam with a score of at least 80%.`,
      deadline: deadline1.toISOString().split('T')[0],
      progress: 0,
      keyMilestones: [
        "Read all sections of the document",
        "Complete practice exercises",
        "Pass certification exam"
      ]
    },
    {
      title: "Product Knowledge Certification",
      description: "Complete product training and demonstrate proficiency through practical application and knowledge assessment.",
      deadline: deadline2.toISOString().split('T')[0],
      progress: 0,
      keyMilestones: [
        "Complete product overview modules",
        "Practice with product demos",
        "Pass product knowledge assessment"
      ]
    },
    {
      title: "Team Integration",
      description: "Schedule meetings with all team members and understand team workflows to effectively collaborate on projects.",
      deadline: deadline3.toISOString().split('T')[0],
      progress: 0,
      keyMilestones: [
        "Meet with all team members",
        "Document team processes and workflows",
        "Successfully participate in team project"
      ]
    }
  ];
};

/**
 * Get all learning goals for the current user
 * @returns {Promise<Array>} - Array of learning goal objects
 */
export const getUserLearningGoals = async () => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');
    
    const q = query(
      collection(db, 'learning_goals'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const learningGoals = [];
    
    querySnapshot.forEach((doc) => {
      learningGoals.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return learningGoals;
  } catch (error) {
    console.error('Error getting user learning goals:', error);
    throw error;
  }
};

/**
 * Update learning goal progress
 * @param {string} goalSetId - The learning goals document ID
 * @param {number} goalIndex - Index of the goal to update
 * @param {number} progress - New progress value (0-100)
 * @returns {Promise<Object>} - Updated learning goals object
 */
export const updateGoalProgress = async (goalSetId, goalIndex, progress) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');
    
    // Get current learning goals data
    const goalRef = doc(db, 'learning_goals', goalSetId);
    const goalSnap = await getDoc(goalRef);
    
    if (!goalSnap.exists()) {
      throw new Error('Learning goals not found');
    }
    
    const goalsData = goalSnap.data();
    
    // Update goal progress
    const updatedGoals = [...goalsData.goals];
    if (goalIndex >= 0 && goalIndex < updatedGoals.length) {
      updatedGoals[goalIndex] = {
        ...updatedGoals[goalIndex],
        progress
      };
    }
    
    await updateDoc(goalRef, { 
      goals: updatedGoals,
      updatedAt: Timestamp.now()
    });
    
    return {
      id: goalSetId,
      ...goalsData,
      goals: updatedGoals
    };
  } catch (error) {
    console.error('Error updating goal progress:', error);
    throw error;
  }
};
