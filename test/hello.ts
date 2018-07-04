import { hello } from '../src/hello';

it('greets Ann', () => {
  expect(hello('Ann')).toBe('Hello Ann!');
});
