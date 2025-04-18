/**
 * Service for handling Live Chat functionality with AI and human agent support
 */

// Hardcoded API key to ensure it's available
const API_KEY = 'AIzaSyC_JpUazzp4cfukgazRk4HufNw5fjFrMHU';
const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

/**
 * Get a response from Gemini AI for live chat support
 * @param {string} message - The user's message
 * @param {Array} chatHistory - Previous chat messages for context
 * @returns {Promise<string>} - The AI response
 */
export const getLiveChatResponse = async (message, chatHistory = []) => {
  try {
    console.log('Processing live chat message:', message);
    
    // Create a comprehensive pre-prompt that instructs the AI to be a Dell Support agent
    const prePrompt = `You are Dell's Live Chat Support Agent, a helpful assistant for new employees during their onboarding process.

INSTRUCTIONS:
1. Act as a knowledgeable and friendly support agent who helps Dell employees with their onboarding questions
2. Provide clear, concise, and accurate information about Dell's onboarding process, systems, and resources
3. Format your responses in plain text (no markdown)
4. Keep your tone professional, supportive, and empathetic
5. When you don't know something specific, acknowledge it and suggest who the employee might contact
6. If the question requires human intervention, suggest that the employee request a human agent

DELL SUPPORT INFORMATION:
- Onboarding Process: New employees complete orientation, required training, and team introductions in their first week
- IT Systems: Employees use Workday for HR tasks, ServiceNow for IT support, and Microsoft 365 for productivity
- Benefits Enrollment: New employees must complete benefits enrollment within 30 days of their start date
- Required Training: All new employees must complete compliance, security, and role-specific training
- IT Support: Available through the IT Service Desk at extension 4357 or via the ServiceNow portal
- HR Support: HR Connect is available for personnel-related questions
- Manager's Role: Direct managers provide guidance, set expectations, and facilitate introductions
- Team Integration: Team members help new employees understand team processes and culture

Now, please respond to the following message as Dell's Live Chat Support Agent:
`;

    // Format previous conversation for context
    let conversationContext = '';
    if (chatHistory && chatHistory.length > 0) {
      // Only use the last 5 messages for context to keep it focused
      const recentHistory = chatHistory.slice(-5);
      conversationContext = '\\n\\n[CONVERSATION HISTORY:\\n' + 
        recentHistory.map(msg => `${msg.sender === 'user' ? 'Employee' : 'Support Agent'}: ${msg.text}`).join('\\n') + 
        ']\\n\\n';
    }
    
    // Combine everything into the full query
    const fullQuery = prePrompt + conversationContext + message;
    
    // Call the Gemini API
    const response = await fetch(`${API_URL}?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: fullQuery }]
          }
        ],
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 800,
          topP: 0.95,
          topK: 40
        }
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);
      throw new Error(`Gemini API error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Received live chat response from Gemini:', data);
    
    // Extract and format the response
    if (data && data.candidates && data.candidates.length > 0 && 
        data.candidates[0].content && data.candidates[0].content.parts && 
        data.candidates[0].content.parts.length > 0) {
      
      // Get the raw text response
      const textResponse = data.candidates[0].content.parts[0].text;
      
      // Format the response to remove any markdown
      let formattedResponse = textResponse;
      formattedResponse = formattedResponse.replace(/\*\*(.*?)\*\*/g, '$1'); // Remove bold
      formattedResponse = formattedResponse.replace(/\*(.*?)\*/g, '$1'); // Remove italic
      formattedResponse = formattedResponse.replace(/```(.*?)```/gs, '$1'); // Remove code blocks
      formattedResponse = formattedResponse.replace(/`(.*?)`/g, '$1'); // Remove inline code
      
      return formattedResponse;
    } else {
      console.warn('Unexpected response structure:', JSON.stringify(data));
      return "I'm sorry, I'm having trouble processing your request right now. Please try again or consider requesting a human agent for assistance.";
    }
  } catch (error) {
    console.error('Error getting live chat response:', error);
    
    // Provide fallback responses based on keywords in the message
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('onboarding') || lowerMessage.includes('start') || lowerMessage.includes('new')) {
      return "Welcome to Dell! Our onboarding process typically includes orientation, required training modules, and team introductions during your first week. Your manager should have provided you with a detailed onboarding plan. If you need specific information about your onboarding schedule, please contact your HR representative.";
    } 
    else if (lowerMessage.includes('training') || lowerMessage.includes('learn')) {
      return "Dell requires all new employees to complete several training modules, including compliance, security, and role-specific training. You can access these through the Learning Portal on the intranet. Your manager will guide you on which training modules are priorities for your role.";
    }
    else if (lowerMessage.includes('system') || lowerMessage.includes('access') || lowerMessage.includes('login')) {
      return "As a new Dell employee, you'll need access to several systems including Workday for HR tasks, ServiceNow for IT support, and Microsoft 365 for productivity. If you're having trouble accessing any system, please contact the IT Service Desk at extension 4357 or submit a ticket through the ServiceNow portal.";
    }
    else if (lowerMessage.includes('benefit') || lowerMessage.includes('insurance') || lowerMessage.includes('health')) {
      return "Dell offers a comprehensive benefits package including health insurance, retirement plans, and wellness programs. You must complete your benefits enrollment within 30 days of your start date. You can access the benefits portal through Workday. For specific questions about benefits, please contact HR Connect.";
    }
    else if (lowerMessage.includes('team') || lowerMessage.includes('colleague') || lowerMessage.includes('manager')) {
      return "Your manager and team members are key resources during your onboarding. Your manager will set expectations, provide guidance, and facilitate introductions. Your team members can help you understand team processes and culture. If you haven't met your team yet, ask your manager to arrange introductions.";
    }
    else {
      return "I'm here to help with your onboarding process at Dell. If you have questions about orientation, training, systems access, benefits, or connecting with your team, I'm happy to assist. If you need more specialized support, you can request to speak with a human agent.";
    }
  }
};

/**
 * Get common live chat questions for new Dell employees
 * @returns {Array} - List of common live chat questions
 */
export const getCommonLiveChatQuestions = () => {
  return [
    "What should I do on my first day?",
    "How do I access my training modules?",
    "When do I need to complete benefits enrollment?",
    "Who should I contact for IT help?",
    "How do I set up my Dell laptop?",
    "What's the dress code at Dell?",
    "How do I request time off?",
    "Where can I find the employee handbook?",
    "How do I join the team meetings?",
    "What's the process for expense reimbursement?"
  ];
};
