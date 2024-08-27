/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable no-underscore-dangle */
import objectArraySortPipes from '../object-array-sort';

describe('Object, Array, and Sorting pipe functions', () => {
  it('should check if an object has a specific key', () => {
    const myDict = { name1: 'value1', name2: 'value2' };
    expect(objectArraySortPipes.hasKey(myDict, 'name1')).toBe(true);
    expect(objectArraySortPipes.hasKey(myDict, 'name3')).toBe(false);
  });

  it('should check if an element is the first in the array', () => {
    const arr = { _parent: [1, 2, 3], _value: 1 };
    expect(objectArraySortPipes.isFirst(arr)).toBe(true);

    arr._value = 2;
    expect(objectArraySortPipes.isFirst(arr)).toBe(false);
  });

  it('should check if an element is the last in the array', () => {
    const arr = { _parent: [1, 2, 3], _value: 3 };
    expect(objectArraySortPipes.isLast(arr)).toBe(true);

    arr._value = 2;
    expect(objectArraySortPipes.isLast(arr)).toBe(false);
  });

  it('should return all values of an object with metadata', () => {
    const myDict = { name1: 'value1', name2: 'value2' };
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const values = objectArraySortPipes.values(myDict);

    expect(values).toHaveLength(2);
    expect(values[0]._key).toBe('name1');
    expect(values[0]._value).toBe('value1');
    expect(values[0]._parent).toBe(myDict);
  });

  it('should sort a list of strings alphabetically', () => {
    const myList = ['banana', 'apple', 'cherry'];
    expect(objectArraySortPipes.sortAlpha(myList)).toEqual(['apple', 'banana', 'cherry']);
  });

  it('should return the array as is if the input is not an array in sortAlpha', () => {
    const notAnArray = 'not an array';
    expect(objectArraySortPipes.sortAlpha(notAnArray)).toBe(notAnArray);
  });

  it('should reverse a list', () => {
    const myList = [1, 2, 3, 4, 5];
    expect(objectArraySortPipes.reverse(myList)).toEqual([5, 4, 3, 2, 1]);
  });

  it('should return the array as is if the input is not an array in reverse', () => {
    const notAnArray = 'not an array';
    expect(objectArraySortPipes.reverse(notAnArray)).toBe(notAnArray);
  });

  it('should return a unique list of values', () => {
    const myList = [1, 1, 2, 3, 3, 4, 5];
    expect(objectArraySortPipes.uniq(myList)).toEqual([1, 2, 3, 4, 5]);
  });

  it('should return a JSON string of an object', () => {
    const myDict = { name1: 'value1', name2: 'value2' };
    expect(objectArraySortPipes.json(myDict)).toBe('{"name1":"value1","name2":"value2"}');
  });

  it('should log the object and return the same object', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    const myDict = { name1: 'value1', name2: 'value2' };
    expect(objectArraySortPipes.log(myDict)).toBe(myDict);
    expect(consoleSpy).toHaveBeenCalledWith('Logging object: ', myDict);
    consoleSpy.mockRestore();
  });
});
