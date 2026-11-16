import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'kleen:local-error-log:v1';
const MAX_ENTRIES = 40;

export interface LocalErrorEntry {
  readonly at: string;
  readonly code: string;
  readonly message: string;
  /** Optional non-sensitive context (counts, modes — never URIs or asset paths). */
  readonly context?: Readonly<Record<string, string | number | boolean>>;
}

function redactMessage(message: string): string {
  return message
    .replace(/ph:\/\/[^\s]+/gi, '[redacted-ph]')
    .replace(/file:\/\/[^\s]+/gi, '[redacted-file]')
    .replace(/assets-library:\/\/[^\s]+/gi, '[redacted-assets]')
    .slice(0, 280);
}

function redactContext(
  context: LocalErrorEntry['context'],
): LocalErrorEntry['context'] {
  if (!context) return undefined;
  return Object.fromEntries(
    Object.entries(context).map(([key, value]) => [
      key,
      typeof value === 'string' ? redactMessage(value) : value,
    ]),
  );
}

async function readEntries(): Promise<LocalErrorEntry[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as LocalErrorEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function logLocalError(
  code: string,
  message: string,
  context?: LocalErrorEntry['context'],
): Promise<void> {
  const entry: LocalErrorEntry = {
    at: new Date().toISOString(),
    code,
    message: redactMessage(message),
    ...(context ? { context: redactContext(context) } : {}),
  };
  try {
    const prev = await readEntries();
    const next = [...prev, entry].slice(-MAX_ENTRIES);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Best-effort only.
  }
}

export async function exportLocalErrorLog(): Promise<string> {
  const entries = await readEntries();
  if (entries.length === 0) return 'Nenhum erro técnico registrado.';
  return entries
    .map((e) => {
      const ctx = e.context ? ` ${JSON.stringify(e.context)}` : '';
      return `${e.at} [${e.code}] ${e.message}${ctx}`;
    })
    .join('\n');
}

export async function clearLocalErrorLog(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY);
}
