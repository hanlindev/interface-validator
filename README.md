Interface Validator
=========

Validate JSON objects with TypeScript-like interface specifications.

## Installation

  `npm install interface-validator`

## Usage
Specify TypeScript-like interface definition:
```javascript
const Product = {
  name: 'string!',
  price: 'number!',
  'description?': 'string'
};
```

```javascript
import {getMismatchedFields, validate} from 'interface-validator';

const invalidItem = {
  name: '',
  price: '100'
}
const mismatched = getMismatchedFields(invalidItem, Product);
const isValid = valid(invalidItem, Product);
// Result:
// mismatched = ['name']
// isValid = false
// item = {
//   name: undefined,
//   price: 100
// }
```

## Types
Values are checked by this simple statement:
```javascript
typeof value === specType
```

**Supported types** include:
* string
* number
* boolean
* object
* nested interface

**Nested interface** definition is supported. E.g
```javascript
const Product = {
  name: 'string!',
  price: {
    value: 'number!',
    currency: 'string!'
  },
  'description?': 'string'
}
```

**Type enforcing**:
You can append `!` to the type names to indicate you want to cast the values to
the specified types before checking. The tested object's fields will be modified
to contain the typecasted values. Refer to the above example to see the effect.

There are some special cases:
* number!: if the converted value is `NaN` or `Infinity`, the value will be set
to `undefined`
* boolean!: only 'true' and 'false' will be converted to boolean. All other
values will be set to `undefined`.
* string!: if the value is empty string, it will be set to undefined.

**Optional fields** are indicated with a question mark after the field name,
like `'description?'`;

## When to use this
There are many powerful validation libraries out there. This library is not
meant to rival their functionalities. Instead, this is intended to perform very
simple run-time interface checks.

In TypeScript you can put compile-time contract on JSON objects using
`interface` but they are stripped away at run-time. So there is no way to
perform `obj instanceof Interface` even when using TypeScript. Not to mention
plain Javascript where there is no concept of an interface.

So when you want to do just `object instanceof Interface`, use this library.
Any slightly more complex cases should be handled by more sophisticated
libraries.

## Contribute
Report issues or submit pull requests.

## Tests
  `npm test`