

// ---- Tiny helpers for AttributeValue checks ----
const avString = (pred?: (s: string) => boolean) =>
  ({ S: pred ? P.when((s: string) => pred(s)) : P.string } as const);

const avNumber = (pred?: (n: number) => boolean) =>
  ({ N: pred ? P.when((n: string) => pred(Number(n))) : P.string } as const); // N is string in raw AV

const avEquals = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

dynamodb: {
    NewImage: { docType: avString(s => types.includes(s)) },
    Keys:     { p_key:   avString(s => s.endsWith(suffix)) }
  }