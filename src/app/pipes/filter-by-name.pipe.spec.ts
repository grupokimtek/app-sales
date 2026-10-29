import { FilterByNamePipe } from './filter-by-name.pipe';

describe('FilterByNamePipe', () => {
  const pipe = new FilterByNamePipe();
  const items = [{ name: 'Teclado Mecánico RGB' }, { name: 'Mouse Logitech' }, { name: 'Monitor 24"' }];

  it('returns everything when the term is empty', () => {
    expect(pipe.transform(items, '  ')).toEqual(items);
  });

  it('ignores case and accents', () => {
    expect(pipe.transform(items, 'MECANICO')).toEqual([items[0]]);
  });

  it('matches partial names', () => {
    expect(pipe.transform(items, 'mo').map((i) => i.name)).toEqual(['Mouse Logitech', 'Monitor 24"']);
  });
});
