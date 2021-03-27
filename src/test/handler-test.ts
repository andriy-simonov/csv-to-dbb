import { rotateColumns } from '../csv-transformer';


test('CSV columns rotated one position', done => {
  function callback(error, data) {
    try {
      expect(data).toStrictEqual(['0.34', 'af001']);
      done();
    } catch (error) {
      done(error);
    }
  }

  rotateColumns(['af001', '0.34'], callback);
});

test('CSV columns rotated one position, one of the values is empty', done => {
  function callback(error, data) {
    try {
      expect(data).toStrictEqual(['0.34', '']);
      done();
    } catch (error) {
      done(error);
    }
  }

  rotateColumns(['', '0.34'], callback);
});
