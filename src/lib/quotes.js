export const QUOTES = [
  'Small steps, every day.',
  'Discipline is choosing between what you want now and what you want most.',
  'You don\'t rise to the level of your goals — you fall to the level of your systems.',
  'The secret of your future is hidden in your daily routine.',
  'Motivation gets you going. Habit gets you there.',
  'Done is better than perfect.',
  'Focus on getting 1% better every day.',
  'A river cuts through rock not because of its power, but its persistence.',
  'You become what you repeatedly do.',
  'Be stubborn about goals, flexible about methods.',
  'Action is the antidote to anxiety.',
  'Start where you are. Use what you have. Do what you can.',
  'Habits are the compound interest of self-improvement.',
  'The pain of discipline is far less than the pain of regret.',
  'Show up, especially on the days you don\'t feel like it.',
]

export function quoteOfTheDay() {
  const start = new Date(new Date().getFullYear(), 0, 0)
  const diff = new Date() - start
  const day = Math.floor(diff / 86400000)
  return QUOTES[day % QUOTES.length]
}
