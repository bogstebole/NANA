import Anthropic from '@anthropic-ai/sdk';
import { reconcile } from '../data/dependencies';
import { MODEL, TOOLS, remainingQuestions, stateMessage, toAnswer } from '../data/conversation';
import { frailtyOf } from '../data/frailty';

const KEY_STORAGE = 'nana.anthropic-key';

// The key is the developer's own, typed into the app and kept in this browser.
// That is the right call for a local demo where whoever pulls the repo brings
// their own key — and the wrong call for anything shipped: a browser-held key is
// readable by any script on the page, so this never goes near a real user.
export const loadKey = () => localStorage.getItem(KEY_STORAGE) || '';
export const saveKey = (key) => localStorage.setItem(KEY_STORAGE, key.trim());
export const clearKey = () => localStorage.removeItem(KEY_STORAGE);

export function createClient(apiKey) {
  return new Anthropic({ apiKey, dangerouslyAllowBrowser: true });
}

// Thinking stays ON, deliberately. Disabling it on this model lets tool calls
// arrive as plain text — the turn succeeds, the call never runs, nothing errors,
// and in a loop that text poisons later turns. For a design that hangs entirely
// on tool use that is the worst available bug; `low` effort is the cheap lever.
const REQUEST = {
  model: MODEL,
  max_tokens: 8000,
  thinking: { type: 'adaptive' },
  output_config: { effort: 'low' },
  tools: TOOLS,
};

/**
 * One turn of the conversation, looping until the model stops calling tools.
 *
 * `answers` is threaded through locally rather than read back from React: a turn
 * can record several answers before it finishes, and each one can change which
 * questions remain, so the model has to see the new state within the same turn.
 */
export async function runTurn({
  client,
  system,
  messages,
  answers,
  notes = [],
  onText,
  onAnswer,
  onNote,
  onAsk,
  onFollowUp,
}) {
  let working = { ...answers };
  const collected = [...notes];
  const history = [...messages];

  for (let hop = 0; hop < 8; hop += 1) {
    const stream = client.beta.messages.stream({
      ...REQUEST,
      // Claude Opus 5's classifiers can decline a request; this re-runs it on
      // Anthropic's recommended fallback rather than handing us a dead turn.
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      system,
      messages: [...history, { role: 'system', content: stateMessage(working, collected) }],
    });

    stream.on('text', (delta) => onText(delta));
    const message = await stream.finalMessage();

    if (message.stop_reason === 'refusal') {
      throw new Error('Model je odbio da odgovori na ovu poruku.');
    }

    history.push({ role: 'assistant', content: message.content });

    const calls = message.content.filter((b) => b.type === 'tool_use');
    if (!calls.length) return { messages: history, answers: working, notes: collected };

    const results = [];
    for (const call of calls) {
      if (call.name === 'record_answers') {
        const recorded = [];
        for (const entry of call.input.odgovori || []) {
          const answer = toAnswer(entry);
          if (!answer) continue;
          working = reconcile(working, { ...working, [entry.questionId]: answer }).answers;
          // only report what survived reconciliation — a changed band can drop
          // an answer the model just gave
          if (working[entry.questionId]) {
            recorded.push(entry.questionId);
            onAnswer(entry.questionId, answer);
          }
        }
        results.push({
          type: 'tool_result',
          tool_use_id: call.id,
          content: JSON.stringify({
            zabelezeno: recorded,
            nivo_krhkosti: frailtyOf(working)?.level ?? null,
            preostalo: remainingQuestions(working).length,
          }),
        });
      } else if (call.name === 'record_note') {
        const text = call.input.tekst?.trim();
        if (text) {
          collected.push(text);
          onNote?.(text);
        }
        results.push({ type: 'tool_result', tool_use_id: call.id, content: 'Zabeleženo.' });
      } else if (call.name === 'ask') {
        onAsk(call.input.questionId);
        results.push({
          type: 'tool_result',
          tool_use_id: call.id,
          content: 'Kartice su prikazane korisniku. Sačekaj njegov odgovor — ne pitaj ništa više.',
        });
      } else if (call.name === 'follow_up') {
        onFollowUp?.(call.input.predlozi || []);
        results.push({
          type: 'tool_result',
          tool_use_id: call.id,
          content: 'Polje za pisanje je prikazano. Sačekaj odgovor — ne pitaj ništa više.',
        });
      } else {
        results.push({
          type: 'tool_result',
          tool_use_id: call.id,
          content: `Nepoznat alat: ${call.name}`,
          is_error: true,
        });
      }
    }

    history.push({ role: 'user', content: results });

    // `ask` ends the turn: the model is now waiting on the user, and letting it
    // loop again would have it talk past the cards it just put on screen.
    if (calls.some((c) => c.name === 'ask' || c.name === 'follow_up')) {
      return { messages: history, answers: working, notes: collected };
    }
  }

  return { messages: history, answers: working, notes: collected };
}
