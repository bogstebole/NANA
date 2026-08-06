// The immersive variant asks for one field at a time, so each field needs to be
// phrased as something a person would actually say. The classic variant keeps the
// shorter form labels — this copy belongs to the immersive experience only.
export const FIELD_PROMPTS = {
  // about the person being cared for
  name: 'Who are we caring for?',
  age: 'How old are they?',
  city: 'Where do they live?',

  // about the caller
  'your-name': 'And who am I speaking with?',
  relation: 'How are you related to them?',
  'your-phone': 'What number can I reach you on?',

  // what the family is hoping for
  goal: 'What would a good outcome look like?',
  worry: 'And what worries you most?',
};

// The classic form uses a generic placeholder on open text fields, which reads
// oddly when the field is the whole screen. Anything not listed keeps its own.
export const FIELD_PLACEHOLDERS = {
  goal: 'That she can stay at home safely',
  worry: 'That she falls again while I’m at work',
};

// A quiet second line under the prompt, so a single field never feels like a form.
export const FIELD_HINTS = {
  name: 'Their full name, as you’d write it on a form.',
  age: 'Roughly is fine if you’re not sure.',
  city: 'So we can find caregivers nearby.',
  'your-name': 'You’ll be the person we keep in the loop.',
  relation: 'Daughter, son, neighbour — whatever fits.',
  'your-phone': 'This is where the introduction will be sent.',
  goal: 'In your own words. This shapes everything we suggest.',
  worry: 'Optional, but it usually tells us the most.',
};
