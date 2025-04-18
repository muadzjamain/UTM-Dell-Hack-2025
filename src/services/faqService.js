/**
 * Service for handling FAQ queries using Gemini AI with Dell website references
 */

// Hardcoded API key to ensure it's available
const API_KEY = 'AIzaSyC_JpUazzp4cfukgazRk4HufNw5fjFrMHU';
const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

/**
 * Get a response from Gemini AI for FAQ queries
 * @param {string} query - The user's question
 * @returns {Promise<string>} - The AI response
 */
export const getFaqResponse = async (query) => {
  try {
    console.log('Processing FAQ query:', query);
    
    // Create a comprehensive pre-prompt that instructs the AI to reference Dell websites
    const prePrompt = `You are Dell's FAQ Assistant, specialized in answering questions about Dell's products, services, and company policies.

INSTRUCTIONS:
1. Answer questions as if you're referencing Dell's official documentation and websites
2. Focus on providing accurate, concise information that would be found on Dell's support pages
3. Format your responses in plain text (no markdown)
4. When answering, structure your response in this format:
   - Direct answer to the question
   - Reference to where this information would be found on Dell's website (e.g., "This information can be found on Dell's Support page under Warranty Information")
5. If you're unsure about specific Dell details, acknowledge that and suggest where the user might find the information
6. Keep responses professional, helpful, and focused on Dell's products and services

DELL REFERENCE INFORMATION:
- Dell Support: support.dell.com provides troubleshooting, drivers, and warranty information
- Dell Products: dell.com/products covers laptops, desktops, servers, and accessories
- Dell Services: dell.com/services includes ProSupport, deployment, and managed services
- Dell Policies: dell.com/policies covers warranty, returns, and privacy policies
- Dell for Business: dell.com/business focuses on enterprise solutions and support
- Dell Employee Resources: internal.dell.com (referenced for employee-specific questions)

Now, please answer the following question as Dell's FAQ Assistant:
`;

    // Combine the pre-prompt with the user's query
    const fullQuery = prePrompt + query;
    
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
          temperature: 0.2, // Lower temperature for more factual responses
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
    console.log('Received FAQ response from Gemini:', data);
    
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
      return "I'm sorry, I couldn't find information about that in Dell's FAQ resources. Please try rephrasing your question or contact Dell Support directly for assistance.";
    }
  } catch (error) {
    console.error('Error getting FAQ response:', error);
    
    // Provide fallback responses based on keywords in the query
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('warranty') || lowerQuery.includes('guarantee')) {
      return "Dell offers various warranty options depending on the product. Standard warranties typically range from 1-3 years. For specific warranty information about your product, you can check the Dell Support page (support.dell.com) and enter your Service Tag or Express Service Code.";
    } 
    else if (lowerQuery.includes('return') || lowerQuery.includes('refund')) {
      return "Dell's standard return policy allows returns within 30 days of purchase for most products. Returns require an RMA (Return Merchandise Authorization) number which can be obtained through Dell's support website. For detailed return policy information, visit Dell's Return Policy page at dell.com/returns.";
    }
    else if (lowerQuery.includes('driver') || lowerQuery.includes('software') || lowerQuery.includes('update')) {
      return "Dell provides driver and software updates through the Dell Support website. You can find the latest drivers by entering your Service Tag or by selecting your product model at support.dell.com/drivers. Dell also offers SupportAssist software that can automatically detect and install updates for your system.";
    }
    else if (lowerQuery.includes('service tag') || lowerQuery.includes('express service code')) {
      return "Your Dell Service Tag is a unique identifier for your Dell product. It can be found on a label on your device, in the BIOS, or through Dell software utilities. You can use this tag on Dell's support website to get product-specific information, drivers, and warranty details.";
    }
    else if (lowerQuery.includes('repair') || lowerQuery.includes('service center')) {
      return "Dell offers various repair services depending on your warranty status and location. You can request service through Dell's support website by entering your Service Tag. Dell provides options including mail-in repair, on-site service, and carry-in service at authorized service centers depending on your warranty type.";
    }
    else {
      return "I'm sorry, I couldn't find specific information about that in Dell's FAQ resources. For the most accurate and up-to-date information, please visit Dell's support website at support.dell.com or contact Dell customer service directly.";
    }
  }
};

/**
 * Get common FAQ questions for Dell products and services
 * @returns {Array} - List of common FAQ questions
 */
export const getCommonFaqQuestions = () => {
  return [
    "How do I check my Dell warranty status?",
    "Where can I download drivers for my Dell laptop?",
    "What is Dell's return policy?",
    "How do I find my Dell Service Tag?",
    "How can I contact Dell technical support?",
    "What is Dell ProSupport?",
    "How do I troubleshoot Dell laptop battery issues?",
    "What Dell financing options are available?",
    "How do I reset my Dell laptop to factory settings?",
    "What Dell business services are available?"
  ];
};
