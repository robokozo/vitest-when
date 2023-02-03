import _isEqual from "lodash/isEqual"
import _pick from "lodash/pick"
import type { Mock } from "vitest"

function evaluateWhen(accumulator: boolean, mockValue: any, passedInValue: any) {
    if (mockValue?.constructor?.name === "Any") {
        const potentialSample = mockValue.sample?.(passedInValue) //for some reason this wraps it in an array if its expect.any(Array)
        if (Array.isArray(potentialSample)) {
            return accumulator && _isEqual(potentialSample[0], passedInValue)
        }
        return accumulator && _isEqual(potentialSample, passedInValue)
    }

    if (mockValue?.constructor?.name === "StringContaining") {
        return accumulator && passedInValue.includes(mockValue.sample)
    }

    if (mockValue?.constructor?.name === "ObjectContaining") {
        const sample = mockValue.sample
        const keysToPick = Object.keys(sample)
        const passedInObject = _pick(passedInValue, keysToPick)

        let localAccumulator = true
        Object.entries(passedInObject).forEach(([key, value]: [string, any]) => {
            localAccumulator = localAccumulator && evaluateWhen(localAccumulator, sample[key], value)
        }, true)

        return accumulator && localAccumulator
    }

    if (mockValue?.constructor?.name === "ArrayContaining") {
        const samples = mockValue.sample

        let localAccumulator = true

        samples.forEach((sample: any, index: number) => {
            localAccumulator = localAccumulator && evaluateWhen(localAccumulator, sample, passedInValue[index])
        })

        return accumulator && localAccumulator
    }

    return accumulator && _isEqual(mockValue, passedInValue)
}

function setupMockImplementation(mockFunction: Mock) {
    mockFunction.mockImplementation((...params: any[]) => {
        for (let index = 0; index < mockPairs.length; index++) {
            const mockPair = mockPairs[index]

            const matched = params.reduce((accumulator: boolean, current: any, index: number) => {
                const calledWithParam = mockPair.params?.[index]

                return accumulator && evaluateWhen(accumulator, calledWithParam, current)
            }, true)

            if (matched) {
                if (mockPair.count == undefined) {
                    return mockPair.response
                }

                mockPair.count = mockPair.count - 1

                if (mockPair.count === 0) {
                    const response = mockPair.response

                    mockPairs.splice(index, 1)

                    return response
                }

                return mockPair.response
            }
        }

        return undefined
    })
}

interface MockPair {
    params: any[] | undefined
    response: any | undefined
    count: number | undefined
}

let mockPairs: MockPair[] = []

export function resetAllWhenMocks() {
    mockPairs = []
}

export function when(mockFunction: Mock) {
    const calledWith = (...params: any[]) => {
        const pair: MockPair = {
            params,
            response: undefined,
            count: undefined,
        }

        mockPairs.push(pair)

        const returnValue = (answer: any, count?: number) => {
            pair.response = answer
            pair.count = count

            setupMockImplementation(mockFunction)

            return {
                calledWith,
            }
        }

        return {
            returnValue,
        }
    }

    return {
        calledWith,
    }
}
