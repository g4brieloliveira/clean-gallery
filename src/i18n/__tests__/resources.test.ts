import { en } from '../locales/en';
import { ptBR } from '../locales/pt-BR';

function flattenKeys(value: object, prefix = ''): string[] {
  return Object.entries(value).flatMap(([key, child]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return typeof child === 'object' && child !== null
      ? flattenKeys(child as object, path)
      : [path];
  });
}

describe('i18n resources', () => {
  it('keeps PT-BR and English catalogs in sync', () => {
    expect(flattenKeys(en).sort()).toEqual(flattenKeys(ptBR).sort());
  });

  it('does not reintroduce the album plural typo', () => {
    const pt = JSON.stringify(ptBR).toLocaleLowerCase('pt-BR');
    const english = JSON.stringify(en).toLocaleLowerCase('en');
    for (const bad of ['álbumns', 'albumns', 'álbumms', 'albumms']) {
      expect(pt).not.toContain(bad);
      expect(english).not.toContain(bad);
    }
  });
});
