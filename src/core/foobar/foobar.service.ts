import type { FooBarResult, IFooBarService, NumberEvaluation } from "./foobar.interface.js";

/**
 * FooBarService mengimplementasikan aturan Mini Test 1:
 * 1. Urutan angka 1 sampai 100 dibalik menjadi 100 turun ke 1.
 * 2. Bilangan prima dilewati / tidak dicetak (bahkan angka 3 dan 5 tidak dicetak sebagai Foo atau Bar).
 * 3. Kelipatan 3 & 5 dicetak "FooBar".
 * 4. Kelipatan 3 dicetak "Foo".
 * 5. Kelipatan 5 dicetak "Bar".
 * 6. Format horizontal satu baris dipisahkan koma dan spasi (", ").
 */
export class FooBarService implements IFooBarService {
  /**
   * Menentukan apakah suatu bilangan bulat adalah bilangan prima.
   * Bilangan <= 1 bukan prima.
   * Kompleksitas: O(sqrt(n))
   */
  public isPrime(n: number): boolean {
    if (n <= 1) return false;
    if (n === 2) return true;
    if (n % 2 === 0) return false;

    const limit = Math.floor(Math.sqrt(n));
    for (let i = 3; i <= limit; i += 2) {
      if (n % i === 0) return false;
    }
    return true;
  }

  /**
   * Mengevaluasi satu angka sesuai hierarki aturan soal.
   */
  public evaluateNumber(n: number): NumberEvaluation {
    // Aturan 1: Jangan cetak bilangan prima
    if (this.isPrime(n)) {
      return {
        value: n,
        isPrime: true,
        output: null,
      };
    }

    // Aturan 4: Habis dibagi 3 dan 5
    if (n % 15 === 0) {
      return {
        value: n,
        isPrime: false,
        output: "FooBar",
      };
    }

    // Aturan 2: Habis dibagi 3
    if (n % 3 === 0) {
      return {
        value: n,
        isPrime: false,
        output: "Foo",
      };
    }

    // Aturan 3: Habis dibagi 5
    if (n % 5 === 0) {
      return {
        value: n,
        isPrime: false,
        output: "Bar",
      };
    }

    // Selain itu cetak angka aslinya
    return {
      value: n,
      isPrime: false,
      output: String(n),
    };
  }

  /**
   * Menghasilkan evaluasi angka berurutan terbalik (default: 100 -> 1)
   */
  public generateReverseFooBar(start = 1, end = 100): FooBarResult {
    const min = Math.min(start, end);
    const max = Math.max(start, end);

    // Array berurutan terbalik: 100, 99, 98, ..., 1
    const numbers: number[] = [];
    for (let i = max; i >= min; i--) {
      numbers.push(i);
    }

    const items: NumberEvaluation[] = numbers.map((num) => this.evaluateNumber(num));

    const printedItems = items.filter(
      (item): item is NumberEvaluation & { output: string } => item.output !== null,
    );

    const rawHorizontalText = printedItems.map((item) => item.output).join(", ");

    return {
      rawHorizontalText,
      items,
      totalNumbers: items.length,
      omittedPrimesCount: items.length - printedItems.length,
      printedCount: printedItems.length,
    };
  }
}

// Export singleton instance untuk kenyamanan penggunaan
export const fooBarService = new FooBarService();
