import { vi, type Mock, describe, beforeEach, it, expect } from "vitest";
import { when, resetAllWhenMocks } from "../index";

import { double, asyncDouble } from "./calc";
vi.mock("./sum");
import { sum, asyncSum } from "./sum";
const mockSum = sum as Mock;
const mockAsyncSum = asyncSum as Mock;

describe.skip("calc", () => {
    beforeEach(() => {
        resetAllWhenMocks();
        vi.resetAllMocks();
    });

    it("double should work with fixed numbers chaining same values different returns per call", () => {
        when(mockSum).calledWith(5, 5).returnValue(123, { count: 2 });
        when(mockSum).calledWith(5, 5).returnValue(456, { count: 1 });

        const result = double(5);
        const result2 = double(5);
        const result3 = double(5);
        const result4 = double(5);

        expect(result).toEqual(123);
        expect(result2).toEqual(123);
        expect(result3).toEqual(456);
        expect(result4).toEqual(undefined);
    });

    it("double should work with fixed numbers chaining same values different returns per call", () => {
        when(mockSum).calledWith(5, 5).returnValue(123);

        const result = double(5);
        const result2 = double(5);
        const result3 = double(5);
        const result4 = double(5);

        expect(result).toEqual(123);
        expect(result2).toEqual(123);
        expect(result3).toEqual(123);
        expect(result4).toEqual(123);
    });

    it("double should work with fixed numbers chaining individual calls", () => {
        when(mockSum).calledWith(5, 5).returnValue(123);
        when(mockSum).calledWith(2, 2).returnValue(456);

        const result = double(5);
        const result2 = double(2);

        expect(result).toEqual(123);
        expect(result2).toEqual(456);
    });

    it("double should work with fixed numbers chaining", () => {
        when(mockSum)
            .calledWith(5, 5)
            .returnValue(123)
            .calledWith(2, 2)
            .returnValue(456);

        const result = double(5);
        const result2 = double(2);

        expect(result).toEqual(123);
        expect(result2).toEqual(456);
    });

    it("double should not work when the mock doesnt match", () => {
        when(mockSum).calledWith(5, 5).returnValue(123);

        const result = double("5");

        expect(result).not.toEqual(123);
    });

    it("double should work with with any number", () => {
        when(mockSum)
            .calledWith(expect.any(Number), expect.any(Number))
            .returnValue(123)
            .calledWith(expect.any(String), expect.any(String))
            .returnValue(456);

        const result = double(99);
        const result2 = double("a");

        expect(result).toEqual(123);
        expect(result2).toEqual(456);
    });

    it("double should work with partial objects", () => {
        when(mockSum)
            .calledWith(
                expect.objectContaining({ v: 10 }),
                expect.objectContaining({ v: 10 })
            )
            .returnValue(123);

        const result = double({ v: 10, foo: "bar" });

        expect(result).toEqual(123);
    });

    it("double should work with nested any", () => {
        when(mockSum)
            .calledWith(
                expect.objectContaining({ v: expect.any(Number) }),
                expect.objectContaining({ v: 10 })
            )
            .returnValue(123);

        const result = double({ v: 10, foo: "bar" });

        expect(result).toEqual(123);
    });

    it("double should work with string containing", () => {
        when(mockSum)
            .calledWith(expect.stringContaining("1"), "10")
            .returnValue(123);

        const result = double("10");

        expect(result).toEqual(123);
    });

    it("double should work with array containing", () => {
        when(mockSum)
            .calledWith(expect.arrayContaining([10]), expect.any(Array))
            .returnValue(123);

        const result = double([10]);

        expect(result).toEqual(123);
    });

    it("double should work with array containing multiple statements", () => {
        when(mockSum)
            .calledWith(
                expect.arrayContaining([10, expect.any(Number)]),
                expect.any(Array)
            )
            .returnValue(123);

        const result = double([10, 5]);

        expect(result).toEqual(123);
    });

    it("double should work with array containing multiple statements", () => {
        when(mockSum)
            .calledWith(
                expect.arrayContaining([
                    10,
                    expect.objectContaining({ v: expect.any(Number) }),
                ]),
                expect.any(Array)
            )
            .returnValue(123);

        const result = double([10, { v: 123 }]);

        expect(result).toEqual(123);
    });

    it("async double should work with fixed numbers", async () => {
        when(mockAsyncSum)
            .calledWith(5, 5)
            .returnValue(123)
            .calledWith(2, 2)
            .returnValue(456);

        const result = await asyncDouble(5);
        const result2 = await asyncDouble(2);

        expect(result).toEqual(123);
        expect(result2).toEqual(456);
    });
});
