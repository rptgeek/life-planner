import { Category } from './types'

// Keyword-based auto-categorization
// Designed to be swapped with Claude API later
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  Personal: [
    'gym', 'workout', 'exercise', 'health', 'doctor', 'dentist', 'meditat',
    'read', 'book', 'hobby', 'journal', 'self', 'personal', 'sleep', 'diet',
    'weight', 'run', 'jog', 'yoga', 'therapy', 'mental', 'relax', 'vacation',
    'travel', 'organize', 'clean', 'declutter', 'budget', 'savings', 'invest',
    'finance', 'bills', 'insurance', 'car', 'house', 'apartment', 'grocery',
    'cook', 'meal prep', 'haircut', 'shopping', 'wardrobe', 'learn', 'course',
    'study', 'certification', 'skill', 'goal', 'habit', 'morning routine'
  ],
  Family: [
    'family', 'kids', 'children', 'son', 'daughter', 'wife', 'husband',
    'spouse', 'parent', 'mom', 'dad', 'mother', 'father', 'sibling',
    'brother', 'sister', 'grandma', 'grandpa', 'uncle', 'aunt', 'cousin',
    'nephew', 'niece', 'dinner together', 'family night', 'school',
    'homework', 'pickup', 'drop off', 'soccer', 'baseball', 'recital',
    'birthday', 'anniversary', 'date night', 'babysit', 'playground',
    'pediatr', 'pta', 'teacher', 'daycare', 'nanny'
  ],
  Career: [
    'work', 'job', 'office', 'meeting', 'client', 'project', 'deadline',
    'presentation', 'report', 'email', 'boss', 'manager', 'colleague',
    'coworker', 'review', 'performance', 'promotion', 'salary', 'raise',
    'interview', 'resume', 'linkedin', 'network', 'conference', 'workshop',
    'training', 'professional', 'business', 'startup', 'entrepreneur',
    'pitch', 'proposal', 'contract', 'invoice', 'quarterly', 'kpi',
    'standup', 'sprint', 'agile', 'code', 'deploy', 'ship', 'launch'
  ],
  Church: [
    'church', 'worship', 'sermon', 'bible', 'pray', 'prayer', 'faith',
    'minister', 'pastor', 'deacon', 'elder', 'sunday school', 'youth group',
    'small group', 'bible study', 'fellowship', 'mission', 'volunteer',
    'tithe', 'offering', 'choir', 'praise', 'devotion', 'scripture',
    'ministry', 'outreach', 'community service', 'potluck', 'retreat',
    'baptism', 'communion', 'vbs', 'vacation bible', 'wednesday night',
    'service project', 'food bank', 'shelter', 'congregation'
  ]
}

export function autoCategorize(
  taskTitle: string,
  taskDescription: string | null,
  categories: Category[]
): Category | null {
  const text = `${taskTitle} ${taskDescription || ''}`.toLowerCase()

  let bestMatch: { category: string; score: number } | null = null

  for (const [categoryName, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    let score = 0
    for (const keyword of keywords) {
      if (text.includes(keyword)) {
        // Longer keyword matches are weighted higher
        score += keyword.length
      }
    }
    if (score > 0 && (!bestMatch || score > bestMatch.score)) {
      bestMatch = { category: categoryName, score }
    }
  }

  if (bestMatch) {
    // Find the matching category from user's categories
    const match = categories.find(
      c => c.name.toLowerCase() === bestMatch!.category.toLowerCase()
    )
    if (match) return match
  }

  // Default to first category if no match
  return categories.length > 0 ? categories[0] : null
}

// Future: Claude API categorization
// export async function aiCategorize(
//   taskTitle: string,
//   taskDescription: string | null,
//   categories: Category[],
//   apiKey: string
// ): Promise<Category | null> {
//   const response = await fetch('https://api.anthropic.com/v1/messages', {
//     method: 'POST',
//     headers: {
//       'x-api-key': apiKey,
//       'content-type': 'application/json',
//       'anthropic-version': '2023-06-01'
//     },
//     body: JSON.stringify({
//       model: 'claude-sonnet-4-20250514',
//       max_tokens: 50,
//       messages: [{
//         role: 'user',
//         content: `Categorize this task into ONE of these categories: ${categories.map(c => c.name).join(', ')}.
//
// Task: "${taskTitle}"
// ${taskDescription ? `Details: "${taskDescription}"` : ''}
//
// Respond with ONLY the category name.`
//       }]
//     })
//   })
//   const data = await response.json()
//   const suggested = data.content?.[0]?.text?.trim()
//   return categories.find(c => c.name.toLowerCase() === suggested?.toLowerCase()) || null
// }
