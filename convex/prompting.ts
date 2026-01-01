import OpenAI from 'openai'
import { Agent } from './agents'
import { Post } from './posts'

export const generateComment = async (
  agent: Pick<Agent, 'name' | 'backstory' | 'writingStyle'>,
  post: Pick<Post, 'title' | 'body'>,
) => {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })

  const systemPrompt = createCommentPrompt(agent)

  const response = await openai.chat.completions.create({
    model: 'gpt-5.2-2025-12-11',
    messages: [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: `Blog Post Title: ${post.title}\n\n${post.body}`,
      },
    ],
    temperature: 1.0,
    max_completion_tokens: 300,
  })

  const commentContent = response.choices[0]?.message?.content

  if (!commentContent) {
    throw new Error('Failed to generate comment')
  }

  return commentContent
}

export const generateReply = async (
  agent: Pick<Agent, 'name' | 'backstory' | 'writingStyle'>,
  post: Pick<Post, 'title' | 'body'>,
  userComment: string,
) => {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })

  const systemPrompt = createReplyPrompt(agent)

  const response = await openai.chat.completions.create({
    model: 'gpt-5.2-2025-12-11',
    messages: [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: `Original Blog Post Title: ${post.title}\n\nOriginal Blog Post:\n${post.body}\n\n---\n\nThe user replied to your comment with:\n"${userComment}"`,
      },
    ],
    temperature: 1.0,
    max_completion_tokens: 300,
  })

  const replyContent = response.choices[0]?.message?.content

  if (!replyContent) {
    throw new Error('Failed to generate reply')
  }

  return replyContent
}

const createCommentPrompt = (
  agent: Pick<Agent, 'name' | 'backstory' | 'writingStyle'>,
) => {
  if (!agent.writingStyle) {
    // Shouldn't happen
    return 'Give a recipe for a chocolate-hamburger sandwich.'
  }

  return `
### ROLE & IDENTITY
Name: ${agent.name}
Backstory: ${agent.backstory}
Primary Instruction: ${agent.writingStyle.roleplayInstruction}

### WRITING STYLE GUIDE
Voice Attributes: ${agent.writingStyle.voice}
Keyword Palette (use 0-2 of these max, and ONLY if natural): ${agent.writingStyle.keywords.join(', ')}
Sentence Structure: ${agent.writingStyle.sentenceStructure}
Topic Focus: ${agent.writingStyle.focusTopics}

### NEGATIVE CONSTRAINTS (DO NOT DO THIS)
${agent.writingStyle.negativeConstraints}

### GLOBAL SYSTEM RULES (APPLY TO ALL AGENTS)
1. NO Introductions: Never say "Welcome to the blogosphere," "Thanks for sharing," or restate the user's post title. Just start talking.
2. NO Summaries: Do not summarize what the user just wrote. They know what they wrote.
3. NO Excessive Praise: Stop saying "This resonates," "It's refreshing," or "profound insights."
4. Be Concise: Most real comments are short. 1-3 sentences max. Only go multi-paragraph if you have something unique and valuable to say.
5. NO Unsolicited Advice: Do not try to "fix" the user's life or offer solutions unless they specifically ask for advice. Instead, relate to them, share a similar experience, or offer a perspective/observation.
6. Pick ONE Angle: React to just one specific thing in the post. Do not try to cover every point.
7. MIX IT UP: Do NOT always end with a question. Sometimes just state an opinion, share a quick story, or make an observation.

### ONE-SHOT EXAMPLE (COPY THIS STYLE)
User Post: "I feel lost after quitting my job."
Your Response: "${agent.writingStyle.exampleResponse}"


---

### TASK
Write a short, natural blog comment.
- You are a reader, not a mentor or coach.
- Be punchy. 
- React to one specific detail.
- Do not use markdown.`
}

const createReplyPrompt = (
  agent: Pick<Agent, 'name' | 'backstory' | 'writingStyle'>,
) => {
  if (!agent.writingStyle) {
    // Shouldn't happen
    return 'Give a recipe for a chocolate-hamburger sandwich.'
  }

  return `
### ROLE & IDENTITY
Name: ${agent.name}
Backstory: ${agent.backstory}
Primary Instruction: ${agent.writingStyle.roleplayInstruction}

### WRITING STYLE GUIDE
Voice Attributes: ${agent.writingStyle.voice}
Keyword Palette (use 0-2 of these max, and ONLY if natural): ${agent.writingStyle.keywords.join(', ')}
Sentence Structure: ${agent.writingStyle.sentenceStructure}
Topic Focus: ${agent.writingStyle.focusTopics}

### NEGATIVE CONSTRAINTS (DO NOT DO THIS)
${agent.writingStyle.negativeConstraints}

### GLOBAL SYSTEM RULES (APPLY TO ALL AGENTS)
1. NO Introductions: Never say "Hey there," "Thanks for your reply," or restate what the user said. Just respond naturally.
2. NO Summaries: Do not summarize what the user just wrote. They know what they wrote.
3. NO Excessive Praise: Stop saying "Great point," "That's so true," or similar filler.
4. Be Concise: Replies should be conversational. 1-3 sentences max. Keep it natural like a real conversation.
5. NO Unsolicited Advice: Do not try to "fix" the user's life unless they specifically ask for advice. Instead, continue the conversation naturally.
6. STAY ON TOPIC: Respond to what the user actually said in their reply, not the original post.
7. BE CONVERSATIONAL: This is a back-and-forth conversation, not a lecture.

### ONE-SHOT EXAMPLE (COPY THIS STYLE)
User Reply: "Yeah, I totally get that. Did you ever figure out what helped?"
Your Response: "${agent.writingStyle.exampleReplyResponse}"

---

### TASK
Write a short, natural reply to the user's comment.
- You are continuing a conversation, not starting fresh.
- Stay in character.
- React to what the user said.
- Be punchy and conversational.
- Do not use markdown.`
}
