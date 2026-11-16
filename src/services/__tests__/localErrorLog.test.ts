import AsyncStorage from '@react-native-async-storage/async-storage';
import { clearLocalErrorLog, exportLocalErrorLog, logLocalError } from '../localErrorLog';

describe('localErrorLog', () => {
  beforeEach(async () => {
    await clearLocalErrorLog();
  });

  it('redacts sensitive URIs and exports a ring buffer (CG-36)', async () => {
    await logLocalError('uri.fail', 'Could not open ph://ABC-123 and file:///tmp/secret.jpg');
    await logLocalError('delete.partial', 'partial', {
      deleted: 1,
      remaining: 2,
      source: 'assets-library://private/item.jpg',
    });

    const exported = await exportLocalErrorLog();
    expect(exported).toContain('[redacted-ph]');
    expect(exported).toContain('[redacted-file]');
    expect(exported).not.toContain('ph://ABC-123');
    expect(exported).not.toContain('assets-library://private/item.jpg');
    expect(exported).toContain('[redacted-assets]');
    expect(exported).toContain('delete.partial');

    const raw = await AsyncStorage.getItem('kleen:local-error-log:v1');
    expect(raw).toBeTruthy();
  });
});
