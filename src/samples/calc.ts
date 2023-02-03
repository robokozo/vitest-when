import { sum, asyncSum } from "./sum"

export const double = (a: any) => {
    return sum(a, a)
}

export const asyncDouble = async (a: any) => {
    return await asyncSum(a, a)
}
