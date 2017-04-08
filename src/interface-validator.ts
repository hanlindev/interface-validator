import * as _ from 'lodash';

// The key must be a valid variable name with an optional trailing question
// mark. The question mark indicates that the arg is optional but if exists
// it's value will be tested against the specified type.
export interface Interface {
  [key: string]: 'string' | 'number' | 'boolean' | 'object' | Interface;
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
  fieldSpecs: Interface
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
    const specType = fieldSpecs[specName];
    const valueKey = specName.replace(/\?/g, '');
    const value = values[valueKey];
    if (isOptional && ! value || _.isObject(fieldSpecs[specName])) {
      return null;
    }

    const typeMatch = typeof value === specType;
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
  fieldSpecs: Interface,
): values is T {
  return getMismatchedFields(values, fieldSpecs).length === 0;
}