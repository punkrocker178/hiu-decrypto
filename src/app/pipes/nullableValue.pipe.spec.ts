import { NullableValuePipe } from './nullableValue.pipe';

describe('NullableValuePipe', () => {
  it('create an instance', () => {
    const pipe = new NullableValuePipe();
    expect(pipe).toBeTruthy();
  });
});
