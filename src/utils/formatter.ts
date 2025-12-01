export class Formatter {
  static dateFormatter = (date: Date) => {
    const value = new Date(date);
    return new Intl.DateTimeFormat('es-ES', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
    }).format(value);
  };

  static currencyFormatter = (value: number) => {
    return value.toLocaleString('es-BO', {
      style: 'currency',
      currency: 'BOB',
      minimumFractionDigits: 2,
    });
  };
}
