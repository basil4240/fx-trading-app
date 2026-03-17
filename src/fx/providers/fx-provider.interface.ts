export abstract class FxProvider {
  abstract getRate(baseCurrency: string, quoteCurrency: string): Promise<number>;
  abstract getName(): string;
}
