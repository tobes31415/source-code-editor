/**
 * Synchronously transforms one value into another
 */
export type Transformer<TI, TO> = (value: TI) => TO;

export type Callback<T> = (value: T) => void;
