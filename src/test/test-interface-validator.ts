import {getMismatchedFields, validate, Interface} from '../interface-validator';
import {expect} from 'chai';

describe('interface-validator getMismatchedFields', () => {
  let tested: Object;
  
  beforeEach(() => {
    tested = {
      number: 0,
      string: 'str',
      boolean: false,
      optional: 'optional value',
      object: {
        optionalObject: {
          value: 'nested optional value',
        },
        string: 'nested str',
      },
    };
  });

  describe('single level interface', () => {
    const specs: Interface = {
      number: 'number',
      string: 'string',
      boolean: 'boolean',
      'optional?': 'number',
      object: 'object',
    }

    it ('returns type mismatched optional field name', () => {
      expect(getMismatchedFields(tested, specs)).to.eql(['optional']);
    });

    it('returns empty array when all matched', () => {
      const subSpecs: Interface = {
        ...specs,
        'optional?': 'string',
      };
      expect(getMismatchedFields(tested, subSpecs)).to.be.empty;
    });
  });

  describe('nested interface', () => {
    const specs: Interface = {
      number: 'number',
      object: {
        string: 'number',
      }
    };

    it('returns type mismatched paths', () => {
      expect(getMismatchedFields(tested, specs)).to.eql(['object.string']);
    });

    it('returns type mismatched path from optional object field', () => {
      const subSpecs: Interface = {
        ...specs,
        object: {
          'optionalObject?': {
            value: 'number',
          },
        },
      };
      expect(getMismatchedFields(tested, subSpecs)).to.eql(['object.optionalObject.value']);
    });

    it('returns empty array when all matched', () => {
      const subSpecs: Interface = {
        ...specs,
        object: {
          'optionalObject?': {
            value: 'string',
          },
          string: 'string',
        },
      };
      expect(getMismatchedFields(tested, subSpecs)).to.be.empty;
    });
  });
});