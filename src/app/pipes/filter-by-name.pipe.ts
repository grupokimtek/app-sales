import { Pipe, PipeTransform } from '@angular/core';

/** Filtra una lista por nombre, sin distinguir mayúsculas ni tildes. */
@Pipe({ name: 'filterByName' })
export class FilterByNamePipe implements PipeTransform {
  transform<T extends { name: string }>(items: T[], term: string): T[] {
    const search = this.normalize(term);
    if (!search) {
      return items;
    }
    return items.filter((item) => this.normalize(item.name).includes(search));
  }

  private normalize(value: string | null | undefined): string {
    return (value ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
  }
}
