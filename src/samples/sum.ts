export const sum = (
    a: number | string | { v: number } | number[],
    b: number | string | { v: number } | number[]
) => {
    if (typeof a === "string" || typeof b === "string") {
        return null;
    }

    let first = a;
    let second = b;

    if (Array.isArray(a)) {
        first = a[0];
    } else if (a?.v) {
        first = a.v;
    }

    if (Array.isArray(b)) {
        second = b[0];
    } else if (b?.v) {
        second = b.v;
    }

    return (a as number) + (b as number);
};

export const asyncSum = async (
    a: number | string | { v: number } | number[],
    b: number | string | { v: number } | number[]
) => {
    if (typeof a === "string" || typeof b === "string") {
        return null;
    }

    let first = a;
    let second = b;

    if (Array.isArray(a)) {
        first = a[0];
    } else if (a?.v) {
        first = a.v;
    }

    if (Array.isArray(b)) {
        second = b[0];
    } else if (b?.v) {
        second = b.v;
    }

    return (a as number) + (b as number);
};
