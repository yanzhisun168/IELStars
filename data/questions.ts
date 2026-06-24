import type { Part1Question, Part2CueCard, Part3Question } from '@/lib/types'

export const part1Questions: Part1Question[] = [
  { id: 'p1-study-1', part: 'part1', topic: 'Study', question: 'What do you enjoy most about your current studies?', recommendedResponseTimeSeconds: 30 },
  { id: 'p1-study-2', part: 'part1', topic: 'Study', question: 'Do you prefer studying alone or with other people?', recommendedResponseTimeSeconds: 30 },
  { id: 'p1-study-3', part: 'part1', topic: 'Study', question: 'Is there a subject you would like to learn in the future?', recommendedResponseTimeSeconds: 30 },
  { id: 'p1-work-1', part: 'part1', topic: 'Work', question: 'What kind of work would you like to do in the future?', recommendedResponseTimeSeconds: 30 },
  { id: 'p1-work-2', part: 'part1', topic: 'Work', question: 'What makes a workplace pleasant for you?', recommendedResponseTimeSeconds: 30 },
  { id: 'p1-work-3', part: 'part1', topic: 'Work', question: 'Do you think people change jobs more often now than before?', recommendedResponseTimeSeconds: 30 },
  { id: 'p1-hometown-1', part: 'part1', topic: 'Hometown', question: 'What is one place visitors should see in your hometown?', recommendedResponseTimeSeconds: 30 },
  { id: 'p1-hometown-2', part: 'part1', topic: 'Hometown', question: 'How has your hometown changed in recent years?', recommendedResponseTimeSeconds: 30 },
  { id: 'p1-hometown-3', part: 'part1', topic: 'Hometown', question: 'Would you like to live in your hometown in the future?', recommendedResponseTimeSeconds: 30 },
  { id: 'p1-food-1', part: 'part1', topic: 'Food', question: 'What meals do you usually enjoy cooking or preparing?', recommendedResponseTimeSeconds: 30 },
  { id: 'p1-food-2', part: 'part1', topic: 'Food', question: 'Do you prefer eating at home or in restaurants?', recommendedResponseTimeSeconds: 30 },
  { id: 'p1-food-3', part: 'part1', topic: 'Food', question: 'Is there a food you disliked as a child but enjoy now?', recommendedResponseTimeSeconds: 30 },
  { id: 'p1-hobbies-1', part: 'part1', topic: 'Hobbies', question: 'What do you like to do when you have a free evening?', recommendedResponseTimeSeconds: 30 },
  { id: 'p1-hobbies-2', part: 'part1', topic: 'Hobbies', question: 'Have your hobbies changed since you were younger?', recommendedResponseTimeSeconds: 30 },
  { id: 'p1-hobbies-3', part: 'part1', topic: 'Hobbies', question: 'Do you think it is important to have a hobby?', recommendedResponseTimeSeconds: 30 },
  { id: 'p1-technology-1', part: 'part1', topic: 'Technology', question: 'Which app do you use most often, and why?', recommendedResponseTimeSeconds: 30 },
  { id: 'p1-technology-2', part: 'part1', topic: 'Technology', question: 'Do you like trying new technology?', recommendedResponseTimeSeconds: 30 },
  { id: 'p1-technology-3', part: 'part1', topic: 'Technology', question: 'Is there a device you could not easily live without?', recommendedResponseTimeSeconds: 30 },
  { id: 'p1-travel-1', part: 'part1', topic: 'Travel', question: 'Do you enjoy travelling to new places?', recommendedResponseTimeSeconds: 30 },
  { id: 'p1-travel-2', part: 'part1', topic: 'Travel', question: 'How do you usually plan a trip?', recommendedResponseTimeSeconds: 30 },
  { id: 'p1-travel-3', part: 'part1', topic: 'Travel', question: 'Do you prefer short trips or longer holidays?', recommendedResponseTimeSeconds: 30 },
  { id: 'p1-routine-1', part: 'part1', topic: 'Daily Routine', question: 'What is your favourite part of a typical day?', recommendedResponseTimeSeconds: 30 },
  { id: 'p1-routine-2', part: 'part1', topic: 'Daily Routine', question: 'Do you like to make plans for your day?', recommendedResponseTimeSeconds: 30 },
  { id: 'p1-routine-3', part: 'part1', topic: 'Daily Routine', question: 'Is your daily routine different at weekends?', recommendedResponseTimeSeconds: 30 },
]

export const part2CueCards: Part2CueCard[] = [
  {
    id: 'p2-hometown-1', part: 'part2', topic: 'Hometown', title: 'Describe a place in your hometown that you enjoy visiting.',
    prompt: 'You should say:', bulletPoints: ['where the place is', 'what you usually do there', 'who you go there with', 'and explain why you enjoy visiting it'], preparationTimeSeconds: 60, speakingTimeSeconds: 120,
  },
  {
    id: 'p2-technology-1', part: 'part2', topic: 'Technology', title: 'Describe a piece of technology that has made your life easier.',
    prompt: 'You should say:', bulletPoints: ['what it is', 'when you started using it', 'how you use it', 'and explain why it has made your life easier'], preparationTimeSeconds: 60, speakingTimeSeconds: 120,
  },
  {
    id: 'p2-travel-1', part: 'part2', topic: 'Travel', title: 'Describe a journey that you remember well.',
    prompt: 'You should say:', bulletPoints: ['where you went', 'who you travelled with', 'what happened during the journey', 'and explain why you remember it so clearly'], preparationTimeSeconds: 60, speakingTimeSeconds: 120,
  },
  {
    id: 'p2-hobbies-1', part: 'part2', topic: 'Hobbies', title: 'Describe an activity you would like to learn.',
    prompt: 'You should say:', bulletPoints: ['what the activity is', 'how you first became interested in it', 'how you would learn it', 'and explain why you would like to try it'], preparationTimeSeconds: 60, speakingTimeSeconds: 120,
  },
  {
    id: 'p2-food-1', part: 'part2', topic: 'Food', title: 'Describe a meal that you enjoyed with other people.',
    prompt: 'You should say:', bulletPoints: ['what the meal was', 'when and where you ate it', 'who you were with', 'and explain why you enjoyed it'], preparationTimeSeconds: 60, speakingTimeSeconds: 120,
  },
  {
    id: 'p2-study-1', part: 'part2', topic: 'Study', title: 'Describe something useful that you learned outside a classroom.',
    prompt: 'You should say:', bulletPoints: ['what you learned', 'how you learned it', 'why you decided to learn it', 'and explain how it has been useful'], preparationTimeSeconds: 60, speakingTimeSeconds: 120,
  },
  {
    id: 'p2-work-1', part: 'part2', topic: 'Work', title: 'Describe a person who gave you useful advice.',
    prompt: 'You should say:', bulletPoints: ['who the person is', 'when they gave you the advice', 'what the advice was', 'and explain why it was useful to you'], preparationTimeSeconds: 60, speakingTimeSeconds: 120,
  },
  {
    id: 'p2-routine-1', part: 'part2', topic: 'Daily Routine', title: 'Describe a change you made to your daily routine.',
    prompt: 'You should say:', bulletPoints: ['what you changed', 'when you made the change', 'why you made it', 'and explain how it affected your daily life'], preparationTimeSeconds: 60, speakingTimeSeconds: 120,
  },
]

export const part3Questions: Part3Question[] = [
  { id: 'p3-study-1', part: 'part3', topic: 'Study', question: 'What skills should schools teach that are not always included in traditional subjects?', recommendedResponseTimeSeconds: 60 },
  { id: 'p3-study-2', part: 'part3', topic: 'Study', question: 'How has technology changed the way people learn new skills?', recommendedResponseTimeSeconds: 60 },
  { id: 'p3-study-3', part: 'part3', topic: 'Study', question: 'Do adults learn differently from children? Why?', recommendedResponseTimeSeconds: 60 },
  { id: 'p3-work-1', part: 'part3', topic: 'Work', question: 'What qualities make someone a good source of advice?', recommendedResponseTimeSeconds: 60 },
  { id: 'p3-work-2', part: 'part3', topic: 'Work', question: 'Should young people choose a job they enjoy or one with better pay?', recommendedResponseTimeSeconds: 60 },
  { id: 'p3-work-3', part: 'part3', topic: 'Work', question: 'How might workplaces change in the next twenty years?', recommendedResponseTimeSeconds: 60 },
  { id: 'p3-hometown-1', part: 'part3', topic: 'Hometown', question: 'Why do public spaces matter in towns and cities?', recommendedResponseTimeSeconds: 60 },
  { id: 'p3-hometown-2', part: 'part3', topic: 'Hometown', question: 'What can city planners do to make neighbourhoods more pleasant?', recommendedResponseTimeSeconds: 60 },
  { id: 'p3-hometown-3', part: 'part3', topic: 'Hometown', question: 'Do people have a responsibility to preserve local traditions and places?', recommendedResponseTimeSeconds: 60 },
  { id: 'p3-food-1', part: 'part3', topic: 'Food', question: 'Why are shared meals important in many cultures?', recommendedResponseTimeSeconds: 60 },
  { id: 'p3-food-2', part: 'part3', topic: 'Food', question: 'How can people make healthier food choices in busy lives?', recommendedResponseTimeSeconds: 60 },
  { id: 'p3-food-3', part: 'part3', topic: 'Food', question: 'Should governments do more to reduce food waste?', recommendedResponseTimeSeconds: 60 },
  { id: 'p3-hobbies-1', part: 'part3', topic: 'Hobbies', question: 'Why do some people find it difficult to begin a new hobby?', recommendedResponseTimeSeconds: 60 },
  { id: 'p3-hobbies-2', part: 'part3', topic: 'Hobbies', question: 'Do leisure activities need to have a practical purpose?', recommendedResponseTimeSeconds: 60 },
  { id: 'p3-hobbies-3', part: 'part3', topic: 'Hobbies', question: 'How can communities encourage people to take part in activities together?', recommendedResponseTimeSeconds: 60 },
  { id: 'p3-technology-1', part: 'part3', topic: 'Technology', question: 'Which everyday tasks are most likely to be changed by new technology?', recommendedResponseTimeSeconds: 60 },
  { id: 'p3-technology-2', part: 'part3', topic: 'Technology', question: 'What are the benefits and drawbacks of relying on mobile apps?', recommendedResponseTimeSeconds: 60 },
  { id: 'p3-technology-3', part: 'part3', topic: 'Technology', question: 'How should people protect their privacy when using technology?', recommendedResponseTimeSeconds: 60 },
  { id: 'p3-travel-1', part: 'part3', topic: 'Travel', question: 'What can people learn from travelling to unfamiliar places?', recommendedResponseTimeSeconds: 60 },
  { id: 'p3-travel-2', part: 'part3', topic: 'Travel', question: 'How can tourism benefit local communities?', recommendedResponseTimeSeconds: 60 },
  { id: 'p3-travel-3', part: 'part3', topic: 'Travel', question: 'Should tourists change their behaviour to reduce environmental harm?', recommendedResponseTimeSeconds: 60 },
  { id: 'p3-routine-1', part: 'part3', topic: 'Daily Routine', question: 'Why do people find it difficult to change long-established habits?', recommendedResponseTimeSeconds: 60 },
  { id: 'p3-routine-2', part: 'part3', topic: 'Daily Routine', question: 'How has modern life changed the way people manage their time?', recommendedResponseTimeSeconds: 60 },
  { id: 'p3-routine-3', part: 'part3', topic: 'Daily Routine', question: 'Do you think people will have more free time in the future?', recommendedResponseTimeSeconds: 60 },
]
