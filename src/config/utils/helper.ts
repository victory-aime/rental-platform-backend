function cleanObject<T extends Record<string, any>>(obj: T): Partial<T> {
    return Object.entries(obj).reduce((acc, [key, value]) => {
      if (value !== '' && value !== null && value !== undefined) {
        (acc as Record<string, any>)[key] = value;
      }
      return acc;
    }, {} as Partial<T>);
  }
  