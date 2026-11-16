export function filterEmptyProperties<T extends Record<string, any>>(obj: T): Partial<T> {
  return Object.entries(obj).reduce((acc, [key, value]) => {
    const isEmpty = value == null || value === '' || (Array.isArray(value) && value.length === 0)
    if (!isEmpty) {
      acc[key as keyof T] = value
    }
    return acc
  }, {} as Partial<T>)
}
