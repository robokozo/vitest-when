"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.when = exports.resetAllWhenMocks = void 0;
const isEqual_1 = __importDefault(require("lodash/isEqual"));
const pick_1 = __importDefault(require("lodash/pick"));
function evaluateWhen(accumulator, mockValue, passedInValue) {
    var _a, _b, _c, _d, _e;
    if (((_a = mockValue === null || mockValue === void 0 ? void 0 : mockValue.constructor) === null || _a === void 0 ? void 0 : _a.name) === "Any") {
        const potentialSample = (_b = mockValue.sample) === null || _b === void 0 ? void 0 : _b.call(mockValue, passedInValue); //for some reason this wraps it in an array if its expect.any(Array)
        if (Array.isArray(potentialSample)) {
            return accumulator && (0, isEqual_1.default)(potentialSample[0], passedInValue);
        }
        return accumulator && (0, isEqual_1.default)(potentialSample, passedInValue);
    }
    if (((_c = mockValue === null || mockValue === void 0 ? void 0 : mockValue.constructor) === null || _c === void 0 ? void 0 : _c.name) === "StringContaining") {
        return accumulator && passedInValue.includes(mockValue.sample);
    }
    if (((_d = mockValue === null || mockValue === void 0 ? void 0 : mockValue.constructor) === null || _d === void 0 ? void 0 : _d.name) === "ObjectContaining") {
        const sample = mockValue.sample;
        const keysToPick = Object.keys(sample);
        const passedInObject = (0, pick_1.default)(passedInValue, keysToPick);
        let localAccumulator = true;
        Object.entries(passedInObject).forEach(([key, value]) => {
            localAccumulator = localAccumulator && evaluateWhen(localAccumulator, sample[key], value);
        }, true);
        return accumulator && localAccumulator;
    }
    if (((_e = mockValue === null || mockValue === void 0 ? void 0 : mockValue.constructor) === null || _e === void 0 ? void 0 : _e.name) === "ArrayContaining") {
        const samples = mockValue.sample;
        let localAccumulator = true;
        samples.forEach((sample, index) => {
            localAccumulator = localAccumulator && evaluateWhen(localAccumulator, sample, passedInValue[index]);
        });
        return accumulator && localAccumulator;
    }
    return accumulator && (0, isEqual_1.default)(mockValue, passedInValue);
}
function setupMockImplementation(mockFunction) {
    mockFunction.mockImplementation((...params) => {
        for (let index = 0; index < mockPairs.length; index++) {
            const mockPair = mockPairs[index];
            const matched = params.reduce((accumulator, current, index) => {
                var _a;
                const calledWithParam = (_a = mockPair.params) === null || _a === void 0 ? void 0 : _a[index];
                return accumulator && evaluateWhen(accumulator, calledWithParam, current);
            }, true);
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
let mockPairs = [];
function resetAllWhenMocks() {
    mockPairs = [];
}
exports.resetAllWhenMocks = resetAllWhenMocks;
function when(mockFunction) {
    const calledWith = (...params) => {
        const pair = {
            params,
            response: undefined,
            count: undefined,
        };
        mockPairs.push(pair);
        const returnValue = (answer, count) => {
            pair.response = answer;
            pair.count = count;
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
exports.when = when;
