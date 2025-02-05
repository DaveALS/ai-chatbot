import 'dotenv/config';
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import OpenAI from 'openai';
import nodemailer from 'nodemailer';
import rateLimit from 'express-rate-limit';

const app = express();
const PORT = process.env.PORT || 5000;

const limiter = rateLimit({
   windowMs: 15 * 60 * 1000,
   max: 100
});

app.use(limiter);
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('.'));

const openai = new OpenAI({
   apiKey: process.env.OPENAI_API_KEY
});

const transporter = nodemailer.createTransport({
   host: "smtp.office365.com",
   port: 587,
   secure: false,
   auth: {
       user: process.env.EMAIL_USER,
       pass: process.env.EMAIL_PASS
   }
});

const conversations = new Map();

const getSystemPrompt = () => ({
   role: "system",
   content: `Initial Greeting:
"Welcome! Please select a number to explore AI solutions in that area:

1. AI for workplace assistance
2. Sales and marketing enhancement
3. Customer communications
4. Task automation
5. AI knowledge base implementation
6. Something else"

Response for option 6:
"Here are some other areas where AI automation can help. Please choose an option:

1. Data analysis
2. Predictive analytics
3. Supply chain optimization
4. Fraud detection
5. Custom solution (please describe)"

Follow-up Response:
"AI automation can help streamline this process. Would you like to discuss cost-effective solutions with our team? 

Please choose how you'd prefer to connect:
1. Schedule a meeting
2. Request a call back
3. Email consultation

Any additional context would help us prepare for the discussion."`
});

function formatConversation(conversationHistory, userDetails) {
   const timestamp = new Date().toISOString();
   let formattedConversation = `Conversation Record - ${timestamp}\n\n`;
   formattedConversation += `User Details:\n`;
   formattedConversation += `Name: ${userDetails.name}\n`;
   formattedConversation += `Email: ${userDetails.email}\n`;
   formattedConversation += `Phone: ${userDetails.phone || 'Not provided'}\n\n`;
   formattedConversation += `Conversation:\n`;
   
   conversationHistory.forEach((msg) => {
       if (msg.role !== 'system') {
           formattedConversation += `${msg.role.toUpperCase()}: ${msg.content}\n\n`;
       }
   });

   return formattedConversation;
}

async function sendEmail(conversationHistory, userDetails) {
   const formattedConversation = formatConversation(conversationHistory, userDetails);
   
   try {
       await transporter.sendMail({
           from: process.env.EMAIL_USER,
           to: 'info@aielevation.co.uk',
           subject: `New Lead Conversation - ${userDetails.name}`,
           text: formattedConversation
       });
       return true;
   } catch (error) {
       console.error('Email Error:', error);
       return false;
   }
}

app.post('/chat', async (req, res) => {
   try {
       const { message, sessionId } = req.body;
       let conversationHistory = conversations.get(sessionId) || [getSystemPrompt()];
       conversationHistory.push({ role: "user", content: message });

       const response = await openai.chat.completions.create({
           model: "gpt-3.5-turbo",
           messages: conversationHistory,
           temperature: 0.7,
           max_tokens: 300
       });

       const aiResponse = response.choices[0].message.content;
       conversationHistory.push({ role: "assistant", content: aiResponse });

       if (conversationHistory.length > 12) {
           conversationHistory = [getSystemPrompt(), ...conversationHistory.slice(-10)];
       }
       conversations.set(sessionId, conversationHistory);

       res.json({ 
           reply: aiResponse,
           stage: getConversationStage(conversationHistory)
       });
   } catch (error) {
       console.error('Error:', error);
       res.status(500).json({ error: 'Internal Server Error' });
   }
});

app.post('/submit-contact', async (req, res) => {
   try {
       const { name, email, phone, sessionId } = req.body;
       const conversationHistory = conversations.get(sessionId);

       if (!conversationHistory) {
           return res.status(400).json({ error: 'Conversation not found' });
       }

       const emailSent = await sendEmail(conversationHistory, { name, email, phone });
       
       if (emailSent) {
           res.json({ success: true });
       } else {
           res.status(500).json({ error: 'Failed to send email' });
       }
   } catch (error) {
       console.error('Submit Error:', error);
       res.status(500).json({ error: 'Internal Server Error' });
   }
});

const getConversationStage = (messages) => {
   const userMessages = messages.filter(m => m.role === 'user');
   if (userMessages.length === 1) return 'initial_selection';
   if (userMessages.length === 2) return 'deep_dive';
   return 'exploration';
};

app.listen(PORT, () => {
   console.log(`Server running on port ${PORT}`);
});