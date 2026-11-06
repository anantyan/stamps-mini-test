import { describe, expect, it } from "vitest";
import { FooBarService } from "../../src/core/foobar/foobar.service.js";

describe("FooBarService (Mini Test 1)", () => {
  const service = new FooBarService();

  describe("Primality Tests (isPrime)", () => {
    it("should correctly identify non-prime numbers <= 1", () => {
      expect(service.isPrime(-10)).toBe(false);
      expect(service.isPrime(0)).toBe(false);
      expect(service.isPrime(1)).toBe(false); // 1 bukan bilangan prima
    });

    it("should identify 2, 3, 5, 7, 11, 97 as prime numbers", () => {
      expect(service.isPrime(2)).toBe(true);
      expect(service.isPrime(3)).toBe(true);
      expect(service.isPrime(5)).toBe(true);
      expect(service.isPrime(7)).toBe(true);
      expect(service.isPrime(11)).toBe(true);
      expect(service.isPrime(97)).toBe(true);
    });

    it("should identify composite numbers as non-prime", () => {
      expect(service.isPrime(4)).toBe(false);
      expect(service.isPrime(9)).toBe(false);
      expect(service.isPrime(15)).toBe(false);
      expect(service.isPrime(91)).toBe(false); // 91 = 7 * 13 (perangkap umum)
      expect(service.isPrime(100)).toBe(false);
    });
  });

  describe("Number Evaluation (evaluateNumber)", () => {
    it("should return null for prime numbers (omitted per Rule 1)", () => {
      expect(service.evaluateNumber(2).output).toBeNull();
      expect(service.evaluateNumber(3).output).toBeNull(); // 3 prima, tidak dicetak Foo
      expect(service.evaluateNumber(5).output).toBeNull(); // 5 prima, tidak dicetak Bar
      expect(service.evaluateNumber(7).output).toBeNull();
      expect(service.evaluateNumber(97).output).toBeNull();
    });

    it("should return 'FooBar' for numbers divisible by both 3 and 5 (15)", () => {
      expect(service.evaluateNumber(15).output).toBe("FooBar");
      expect(service.evaluateNumber(30).output).toBe("FooBar");
      expect(service.evaluateNumber(60).output).toBe("FooBar");
      expect(service.evaluateNumber(90).output).toBe("FooBar");
    });

    it("should return 'Foo' for numbers divisible by 3 and not divisible by 5 and not prime", () => {
      expect(service.evaluateNumber(6).output).toBe("Foo");
      expect(service.evaluateNumber(9).output).toBe("Foo");
      expect(service.evaluateNumber(12).output).toBe("Foo");
      expect(service.evaluateNumber(99).output).toBe("Foo");
    });

    it("should return 'Bar' for numbers divisible by 5 and not divisible by 3 and not prime", () => {
      expect(service.evaluateNumber(10).output).toBe("Bar");
      expect(service.evaluateNumber(20).output).toBe("Bar");
      expect(service.evaluateNumber(25).output).toBe("Bar");
      expect(service.evaluateNumber(100).output).toBe("Bar");
    });

    it("should return original number string for non-prime, non-multiple of 3 or 5", () => {
      expect(service.evaluateNumber(1).output).toBe("1");
      expect(service.evaluateNumber(4).output).toBe("4");
      expect(service.evaluateNumber(91).output).toBe("91");
      expect(service.evaluateNumber(98).output).toBe("98");
    });
  });

  describe("Reverse Generation 100 -> 1 (generateReverseFooBar)", () => {
    it("should evaluate exactly 100 numbers in reverse order", () => {
      const result = service.generateReverseFooBar(1, 100);

      expect(result.totalNumbers).toBe(100);
      expect(result.items[0].value).toBe(100);
      expect(result.items[99].value).toBe(1);
    });

    it("should omit exactly 25 prime numbers between 1 and 100", () => {
      const result = service.generateReverseFooBar(1, 100);
      expect(result.omittedPrimesCount).toBe(25);
      expect(result.printedCount).toBe(75);
    });

    it("should produce a single-line horizontal string formatted with comma and space", () => {
      const result = service.generateReverseFooBar(1, 100);
      const output = result.rawHorizontalText;

      // Starts with 100 (Bar), 99 (Foo), 98 (98), 97 (omitted), 96 (Foo), 95 (Bar)...
      expect(output.startsWith("Bar, Foo, 98, Foo, Bar, 94, Foo, 92, 91, FooBar")).toBe(true);

      // Ends with ..., 8, Foo, 4, 1 (2 and 3 omitted because they are prime)
      expect(output.endsWith("8, Foo, 4, 1")).toBe(true);

      // Make sure 1 is present and 2, 3, 5, 97 are absent from printed tokens
      const tokens = output.split(", ");
      expect(tokens).toContain("1");
      expect(tokens).toContain("91");
      expect(tokens).toContain("FooBar");
      expect(tokens).not.toContain("97");
      expect(tokens).not.toContain("2");
      expect(tokens.length).toBe(75);
    });
  });
});
