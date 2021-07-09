import { select } from './operators';
import { OperatorFunction } from 'rxjs';
import { EmptyConfig, State } from './state';
import { Reducer } from './store';
import { capitalize, isFunction, isObject } from './utils';

export function propsFactory<
  T,
  K extends string,
  PropState extends { [Key in K]: T }
>(key: K, { initialValue, config = {} }: { initialValue: T; config?: any }) {
  const normalizedKey = capitalize(key as string);

  return {
    [`with${normalizedKey}`](value = initialValue) {
      return {
        state: {
          [key]: value,
        },
        config,
      };
    },
    [`set${normalizedKey}`](value: any) {
      return function (state: any) {
        const newVal = isFunction(value) ? value(state) : value;

        if (newVal === state[key]) {
          return state;
        }

        return {
          ...state,
          [key]: newVal,
        };
      };
    },
    [`update${normalizedKey}`](value: any) {
      return function (state: any) {
        const newVal = isFunction(value) ? value(state) : value;

        if (newVal === state[key]) {
          return state;
        }

        return {
          ...state,
          [key]: isObject(newVal)
            ? {
                ...state[key],
                ...newVal,
              }
            : newVal,
        };
      };
    },
    [`reset${normalizedKey}`]() {
      return function (state: any) {
        return {
          ...state,
          [key]: initialValue,
        };
      };
    },
    [`select${normalizedKey}`]() {
      return select((state: any) => state[key]);
    },
    [`get${normalizedKey}`](state: any) {
      return state[key];
    },
  } as unknown as {
    [P in
      | `with${Capitalize<K>}`
      | `update${Capitalize<K>}`
      | `set${Capitalize<K>}`
      | `reset${Capitalize<K>}`
      | `select${Capitalize<K>}`
      | `get${Capitalize<K>}`]: P extends `get${Capitalize<K>}`
      ? <S extends PropState>(state: S) => T
      : P extends `select${Capitalize<K>}`
      ? <S extends PropState>() => OperatorFunction<S, T>
      : P extends `reset${Capitalize<K>}`
      ? <S extends PropState>() => Reducer<S>
      : P extends `set${Capitalize<K>}`
      ? <S extends PropState>(value: T | ((state: S) => T)) => Reducer<S>
      : P extends `update${Capitalize<K>}`
      ? <S extends PropState>(
          value: Partial<T> | ((state: S) => Partial<T>)
        ) => Reducer<S>
      : P extends `with${Capitalize<K>}`
      ? (initialValue?: T) => State<PropState, EmptyConfig>
      : any;
  };
}
