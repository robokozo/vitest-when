import _isEqual from "lodash/isEqual";
import _pick from "lodash/pick";
import { type Mock, vi } from "vitest";

const dateToStringRegex =
    /^[A-Z][a-z]{2} [A-Z][a-z]{2} [0-9]{2} [0-9]{4} [0-9]{2}:[0-9]{2}:[0-9]{2} GMT[+-][0-9]{4} \([A-Za-z ]+\)$/;

function evaluateWhen(
    accumulator: boolean,
    mockValue: any,
    passedInValue: any
) {
    if (mockValue?.constructor?.name === "Any") {
        //for some reason this wraps it in an array if its expect.any(Array)
        const potentialSample = mockValue.sample?.(passedInValue);

        if (Array.isArray(potentialSample)) {
            return accumulator && _isEqual(potentialSample[0], passedInValue);
        }

        if (
            typeof potentialSample === "string" &&
            potentialSample.match(dateToStringRegex)
        ) {
            return accumulator && passedInValue instanceof Date;
        }

        return accumulator && _isEqual(potentialSample, passedInValue);
    }

    if (mockValue?.constructor?.name === "StringContaining") {
        return accumulator && passedInValue.includes(mockValue.sample);
    }

    if (mockValue?.constructor?.name === "ObjectContaining") {
        const sample = mockValue.sample;
        const keysToPick = Object.keys(sample);
        const passedInObject = _pick(passedInValue, keysToPick);

        let localAccumulator = true;
        Object.entries(passedInObject).forEach(
            ([key, value]: [string, any]) => {
                localAccumulator =
                    localAccumulator &&
                    evaluateWhen(localAccumulator, sample[key], value);
            },
            true
        );

        return accumulator && localAccumulator;
    }

    if (mockValue?.constructor?.name === "ArrayContaining") {
        const samples = mockValue.sample;

        let localAccumulator = true;

        samples.forEach((sample: any, index: number) => {
            localAccumulator =
                localAccumulator &&
                evaluateWhen(localAccumulator, sample, passedInValue[index]);
        });

        return accumulator && localAccumulator;
    }

    return accumulator && _isEqual(mockValue, passedInValue);
}

function setupMockImplementation(mockFunction: Mock) {
    mockFunction.mockImplementation((...params: any[]) => {
        const mockPairs = mockDictionary.get(mockFunction) ?? [];

        for (let index = 0; index < mockPairs.length; index++) {
            const mockPair = mockPairs[index];

            const matched = params.reduce(
                (accumulator: boolean, current: any, index: number) => {
                    const calledWithParam = mockPair.params?.[index];

                    return (
                        accumulator &&
                        evaluateWhen(accumulator, calledWithParam, current)
                    );
                },
                true
            );

            if (matched) {
                if (mockPair.count == undefined) {
                    return mockPair.response;
                }

                mockPair.count = mockPair.count - 1;

                if (mockPair.count === 0) {
                    const response = mockPair.response;

                    mockPairs.splice(index, 1);

                    return response;
                }

                return mockPair.response;
            }
        }

        return undefined;
    });
}

interface MockPair {
    params: any[] | undefined;
    response: any | undefined;
    count: number | undefined;
}

export interface VitestWhenOptions {
    count?: number;
}

let mockDictionary = new Map<Mock, MockPair[]>();

export function resetAllWhenMocks() {
    mockDictionary.clear();
}

export function when(mockFunction: Mock) {
    const calledWith = (...params: any[]) => {
        const pair: MockPair = {
            params,
            response: undefined,
            count: undefined,
        };

        if (mockDictionary.has(mockFunction)) {
            const pairs = mockDictionary.get(mockFunction);
            pairs?.push(pair);
        } else {
            mockDictionary.set(mockFunction, [pair]);
        }

        const returnValue = (answer: any, options?: VitestWhenOptions) => {
            pair.response = answer;
            pair.count = options?.count;

            setupMockImplementation(mockFunction);

            return {
                calledWith,
            };
        };

        return {
            returnValue,
        };
    };

    return {
        calledWith,
    };
}
