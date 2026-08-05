// The immersive variant asks for one field at a time, so each field needs to be
// phrased as something a person would actually say. The classic variant keeps the
// shorter form labels — this copy belongs to the immersive experience only.
export const FIELD_PROMPTS = {
  // basic info
  name: 'Who are we caring for?',
  dob: 'When were they born?',
  address: 'Where do they live?',
  phone: 'What number can we reach them on?',

  // primary contact
  'contact-name': 'Who should we call first?',
  relation: 'How are you related to them?',
  'contact-phone': 'And the best number for you?',

  // doctor
  'doctor-name': 'Is there a doctor we should know about?',
  clinic: 'Which clinic or practice?',
  'doctor-phone': 'And their number?',

  // routine
  'morning-routine': 'What does a normal morning look like?',
  habits: 'Any small habits that matter to them?',

  // allergies
  'allergy-list': 'Any allergies we should know about?',
  diet: 'Anything they shouldn’t eat?',
};

// The classic form uses a generic "Write what you want…" on open text fields, which
// reads oddly when the field is the whole screen. Anything not listed keeps its own.
export const FIELD_PLACEHOLDERS = {
  name: 'Milica Stevanović',
  'contact-name': 'Bogdan Stevanović',
  'doctor-name': 'Dr Jovana Perić',
};

// A quiet second line under the prompt, so a single field never feels like a form.
export const FIELD_HINTS = {
  name: 'Their full name, as you’d write it on a form.',
  dob: 'Roughly is fine if you’re not sure.',
  address: 'So we can find caregivers nearby.',
  phone: 'Only shared with the caregiver you choose.',
  'contact-name': 'The person we reach for updates and anything urgent.',
  relation: 'Daughter, son, neighbour — whatever fits.',
  'contact-phone': 'This is where the introduction will be sent.',
  'doctor-name': 'The caregiver will have this at hand if something happens.',
  clinic: 'Optional — skip it if you’re not sure.',
  'doctor-phone': 'Optional.',
  'morning-routine': 'Breakfast, medication, a walk — whatever the rhythm is.',
  habits: 'Optional, but it helps a caregiver settle in faster.',
  'allergy-list': 'Medication, food, anything at all.',
  diet: 'Optional.',
};
