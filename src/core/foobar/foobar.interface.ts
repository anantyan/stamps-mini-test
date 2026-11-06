export interface NumberEvaluation {
  value: number;
  isPrime: boolean;
  output: string | null; // null jika bilangan prima (tidak dicetak)
}

export interface FooBarResult {
  rawHorizontalText: string;
  items: NumberEvaluation[];
  totalNumbers: number;
  omittedPrimesCount: number;
  printedCount: number;
}

export interface IFooBarService {
  isPrime(n: number): boolean;
  evaluateNumber(n: number): NumberEvaluation;
  generateReverseFooBar(start?: number, end?: number): FooBarResult;
}
