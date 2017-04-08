import {getMismatchedFields, Interface} from '../interface-validator';
import {expect} from 'chai';

describe('interface-validator getMismatchedFields', () => {
  let tested;
  
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
      castToNumber: '123',
      castToNumberFail: 'one',
      castToBoolean: 'true',
      castToBooleanFail: 'yes',
      emptyString: '',
    };
  });

  describe('autocast', () => {
    it('auto cast numbers and booleans', () => {
      const spec: Interface = {
        castToNumber: 'number!',
        castToBoolean: 'boolean!',
      };
      expect(getMismatchedFields(tested, spec)).to.be.empty;
      expect(tested.castToNumber).to.eq(123);
      expect(tested.castToBoolean).to.eq(true);
    });

    it('does not cast when auto cast is turned off', () => {
      const spec: Interface = {
        castToNumber: 'number',
        castToBoolean: 'boolean',
      };
      expect(getMismatchedFields(tested, spec)).to.eql(['castToNumber', 'castToBoolean']);
    });

    it('auto cast non-compliant fields to undefined', () => {
      const spec: Interface = {
        castToNumberFail: 'number!',
        castToBooleanFail: 'boolean!',
      };
      expect(getMismatchedFields(tested, spec)).to.eql(
        ['castToNumberFail', 'castToBooleanFail'],
      );
      expect(tested.castToNumberFail).to.eq(undefined);
      expect(tested.castToBooleanFail).to.eq(undefined);
    });
  });

  describe('empty string', () => {
    it('Fails empty string when tested against string!', () => {
      const spec: Interface = {
        emptyString: 'string!'
      };
      expect(getMismatchedFields(tested, spec)).to.eql(['emptyString']);
      expect(tested.emptyString).to.be.undefined;
    });
    it('Passes empty string when tested against string', () => {
      const spec: Interface = {
        emptyString: 'string',
      };
      expect(getMismatchedFields(tested, spec)).to.eql([]);
    });
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