import * as _ from 'lodash';

/**
 * When followed by !, that means the checker will attempt to cast the value to
 * the specified type in-place before checking the type. For example, if
 * {
 *   count: '123'
 * }
 * is tested against:
 * {
 *   count: 'number!'
 * }
 * The value will be converted to number and then check if it is indeed a number.
 * The object will be modified to
 * {
 *   count: 123
 * }
 * Special Rules:
 * 1. number!: NaN and Infinity will be converted to undefined
 * 2. boolean!: anything other than 'true' or 'false' will be converted to undefined.
 * 3. string!: empty string will be converted to undefined.
 */
export type PrimitiveTypes = 
  'string!' | 'string' 
  | 'number' | 'number!'
  | 'boolean' | 'boolean!'
  | 'object';

/**
 * The key must be a valid variable name with an optional trailing question
 * mark. The question mark indicates that the arg is optional but if exists
 * it's value will be tested against the specified type.
 */
export interface Interface {
  [key: string]: PrimitiveTypes | Interface;
}

function isOptionalParam(name: string) {
  return name.charAt(name.length - 1) === '?';
}

/**
 * Get the list of paths of mismatched properties.
 * @param values       The object to test.
 * @param fieldSpecs   The interface.
 */
export function getMismatchedFields(
  values: Object,
  fieldSpecs: Interface,
): Array<string> {
  const nestedSpecNames = Object.keys(fieldSpecs).filter((name) => {
    return _.isObject(fieldSpecs[name]);
  });
  const nestedMismatched = [].concat(...nestedSpecNames.map((specName) => {
    const isOptional = isOptionalParam(specName);
    const valueKey = specName.replace(/\?/g, '');
    if (!values[valueKey]) {
      return (isOptional) ? [] : [valueKey];
    }

    return getMismatchedFields(
      values[valueKey],
      fieldSpecs[specName] as Interface,
    ).map((name) => `${valueKey}.${name}`); // append the specName to indicate scope.
  }));

  const mismatched = Object.keys(fieldSpecs).map((specName) => {
    const isOptional = isOptionalParam(specName);
    let specType = fieldSpecs[specName];
    const valueKey = specName.replace(/\?/g, '');
    const value = values[valueKey];
    if (isOptional && !value || _.isObject(fieldSpecs[specName])) {
      return null;
    }

    let convertedValue = value;
    if (_.isString(value)) {
      switch (specType) {
        case 'number!':
          specType = 'number';
          convertedValue = _.toNumber(value);
          !_.isFinite(convertedValue) && (convertedValue = undefined);
          break;
        case 'boolean!':
          specType = 'boolean';
          value === 'true' && (convertedValue = true);
          value === 'false' && (convertedValue = false);
          !_.isBoolean(convertedValue) && (convertedValue = undefined);
          break;
        case 'string!':
          specType = 'string';
          convertedValue = (convertedValue === '') ? undefined : convertedValue;
      }
    }

    const typeMatch = typeof convertedValue === specType;
    values[valueKey] = convertedValue;
    if (typeMatch) {
      return null;
    }
    return valueKey;
  }).filter(Boolean);

  return [...mismatched, ...nestedMismatched];
}


/**
 * Check if the object complies with the interface.
 * @param values       The object to test.
 * @param fieldSpecs   The interface spec.
 */
export function validate<T>(
  values: Object,
  fieldSpecs: Interface
): values is T {
  return getMismatchedFields(values, fieldSpecs).length === 0;
}