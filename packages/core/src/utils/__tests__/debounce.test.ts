/**
 * Debounce Tests
 */

import { debounce, debounceAsync } from '../debounce';

jest.useFakeTimers();

describe('debounce', () => {
  it('should debounce function calls', () => {
    const fn = jest.fn();
    const debounced = debounce(fn, 100);

    debounced('a');
    debounced('b');
    debounced('c');

    expect(fn).not.toHaveBeenCalled();

    jest.advanceTimersByTime(100);

    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith('c');
  });

  it('should call function with latest arguments', () => {
    const fn = jest.fn();
    const debounced = debounce(fn, 100);

    debounced(1);
    jest.advanceTimersByTime(50);
    
    debounced(2);
    jest.advanceTimersByTime(50);
    
    debounced(3);
    jest.advanceTimersByTime(100);

    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith(3);
  });
});

describe('debounceAsync', () => {
  it('should debounce async function calls', async () => {
    const fn = jest.fn().mockResolvedValue('result');
    const debounced = debounceAsync(fn, 100);

    const promise1 = debounced('a');
    const promise2 = debounced('b');
    const promise3 = debounced('c');

    expect(fn).not.toHaveBeenCalled();

    jest.advanceTimersByTime(100);

    const [result1, result2, result3] = await Promise.all([
      promise1,
      promise2,
      promise3,
    ]);

    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith('c');
    expect(result1).toBe('result');
    expect(result2).toBe('result');
    expect(result3).toBe('result');
  });
});

