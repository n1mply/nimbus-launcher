export function openExternal(url: string): void {
  void (window as any).appAPI?.openExternal?.(url);
}