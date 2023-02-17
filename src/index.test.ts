import { vi, describe, beforeEach, it, expect } from "vitest";

import { when, resetAllWhenMocks } from "./index";

describe("index", () => {
    beforeEach(() => {
        resetAllWhenMocks();
    });

    describe("resetAllWhenMocks", () => {
        const sharedMock = vi.fn();

        it("should clear shared mocks between calls", () => {
            when(sharedMock).calledWith(1).returnValue("works 1");
            let response = sharedMock(1);
            expect(response).toEqual("works 1");

            resetAllWhenMocks();

            when(sharedMock).calledWith(1).returnValue("works 2");
            response = sharedMock(1);
            expect(response).toEqual("works 2");
        });

        it("should clear shared mocks between calls 2", () => {});
    });

    describe("when", () => {
        it("should return undefined for non matches", () => {
            const mock = vi.fn();

            when(mock).calledWith("a", "b").returnValue("works");

            const response = mock(1, 2);

            expect(response).not.toEqual("works");
            expect(response).toBeUndefined();
        });

        it("should match numbers", () => {
            const mock = vi.fn();

            when(mock).calledWith(1, 2, 3, 4).returnValue("works");

            const response = mock(1, 2, 3, 4);

            expect(response).toEqual("works");
        });

        it("should match letters", () => {
            const mock = vi.fn();

            when(mock).calledWith("a", "b").returnValue("works");

            const response = mock("a", "b");

            expect(response).toEqual("works");
        });

        it("should match Dates", () => {
            const mock = vi.fn();

            when(mock).calledWith(new Date(1234)).returnValue("works");

            const response = mock(new Date(1234));

            expect(response).toEqual("works");
        });

        it("should match arrays", () => {
            const mock = vi.fn();

            when(mock).calledWith([1, "a"]).returnValue("works");

            const response = mock([1, "a"]);

            expect(response).toEqual("works");
        });

        it("should match objects", () => {
            const mock = vi.fn();

            when(mock).calledWith({ foo: "bar" }).returnValue("works");

            const response = mock({ foo: "bar" });

            expect(response).toEqual("works");
        });

        it("should match booleans", () => {
            const mock = vi.fn();

            when(mock).calledWith(true, true, false).returnValue("works");

            const response = mock(true, true, false);

            expect(response).toEqual("works");
        });

        it("should mock responses in sequence when using count option", () => {
            const mock = vi.fn();

            when(mock)
                .calledWith(1)
                .returnValue("a", { count: 2 })
                .calledWith(1)
                .returnValue("b", { count: 1 });

            let response = mock(1);
            expect(response).toEqual("a");

            response = mock(1);
            expect(response).toEqual("a");

            response = mock(1);
            expect(response).toEqual("b");

            response = mock(1);
            expect(response).toEqual(undefined);
        });

        it("should continue mocking the last setup mock without a count", () => {
            const mock = vi.fn();

            when(mock)
                .calledWith(1)
                .returnValue("a", { count: 1 })
                .calledWith(1)
                .returnValue("b");

            let response = mock(1);
            expect(response).toEqual("a");

            response = mock(1);
            expect(response).toEqual("b");

            response = mock(1);
            expect(response).toEqual("b");

            response = mock(1);
            expect(response).toEqual("b");
        });

        it("should mock the first setup if the parameters are overidden", () => {
            const mock = vi.fn();

            when(mock)
                .calledWith(1)
                .returnValue("a")
                .calledWith(1)
                .returnValue("b");

            let response = mock(1);
            expect(response).toEqual("a");

            response = mock(1);
            expect(response).toEqual("a");
        });

        it("should not match generics of wrong type", () => {
            const mock = vi.fn();

            when(mock).calledWith(expect.any(Number)).returnValue("works");

            const response = mock("abc");

            expect(response).not.toEqual("works");
            expect(response).toBeUndefined();
        });

        it("should allow generic matching for Numbers", () => {
            const mock = vi.fn();

            when(mock).calledWith(expect.any(Number)).returnValue("works");

            const response = mock(99999);

            expect(response).toEqual("works");
        });

        it("should allow generic matching for Strings", () => {
            const mock = vi.fn();

            when(mock).calledWith(expect.any(String)).returnValue("works");

            const response = mock("ZzZzZzZz");

            expect(response).toEqual("works");
        });

        it("should allow generic matching for Date", () => {
            const mock = vi.fn();

            when(mock).calledWith(expect.any(Date)).returnValue("works");

            const response = mock(new Date(0));

            expect(response).toEqual("works");
        });

        it("should allow generic matching for Objects", () => {
            const mock = vi.fn();

            when(mock).calledWith(expect.any(Object)).returnValue("works");

            const response = mock({ foo: "bar" });

            expect(response).toEqual("works");
        });

        it("should allow generic matching for Arrays", () => {
            const mock = vi.fn();

            when(mock).calledWith(expect.any(Array)).returnValue("works");

            const response = mock([1, 2, 3]);

            expect(response).toEqual("works");
        });

        it("it should work with promises", async () => {
            const mock = vi.fn();

            async function mockWrapper(a: string) {
                return mock(a);
            }

            when(mock).calledWith("a").returnValue("works");

            const response = await mockWrapper("a");

            expect(response).toEqual("works");
        });

        it("it should work with promises", async () => {
            const mock = vi.fn();

            async function mockWrapper(a: string) {
                return mock(a);
            }

            when(mock).calledWith("a").returnValue("works");

            const response = await mockWrapper("a");

            expect(response).toEqual("works");
        });

        it("it should work with multiple mocks", async () => {
            const mock1 = vi.fn();
            const mock2 = vi.fn();

            function mockWrapper(a: string) {
                return mock1(a) + mock2(a);
            }

            when(mock1).calledWith("a").returnValue(1);
            when(mock2).calledWith("a").returnValue(2);

            const response = await mockWrapper("a");

            expect(response).toEqual(3);
        });
    });
});
