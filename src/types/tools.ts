/**
 * RenameKeys type utility, this allows us to rename the keys of an object type. 
 * 
 * WHY???
 * 
 * This is useful for extending interfaces, while maintaining the original interface attributes, with overloaded implementations. 
 * 
 * in TS, if you declare an interface with method A, and then extend that interface with another interface that has method A, 
 * it will throw an error unless very strict type checking is disabled, or you are implementing a subtype of the original interface attribute. 
 * 
 * To get around this, we can use the RenameKeys type utility to rename the keys of the parent interface, 
 * and re-implement those attributes in the child interface with the same name.
 * 
 * This allows us to extend interfaces without conflicts, while still maintaining the original interface attributes- which
 * is conscistent and better UX...
 * 
 * ie: 
 * interface A {
 *  methodA: () => void;  
 * } 
 * 
 * interface B extends A {
 *  methodA: () => void; // this will throw an error, as methodA is already defined in A, strict rules around overriding attributes.
 * }
 * 
 * intgerface C extends RenameKeys<A, { methodA: "super_methodA" }> {
 *  methodA: () => void; // this will not throw an error, as methodA has been renamed to super_methodA in the parent interface.
 * }
 * 
 * in the implementation of C, we can still call super_methodA to access the original methodA implementation from inside our
 * new attribute, just with more flexibility... 
 * 
 * This is analagous to overriding on inheritance like you see in OO languages. 
 */
export type RenameKeys<T, Mapping extends Record<string, string>> = {
  [K in keyof T as K extends keyof Mapping ? Mapping[K] : K]: T[K];
};
