import { rotateColumns } from '../transformers/csv-transformer';
import { Describe, Test } from 'jest-decorator';

@Describe('Transformer Test')
class CSVTransformerTest {

  @Test('CSV columns rotated one position')
  private rotateColumsOnePosition () {
    done => {
      function callback(error, data) {
        try {
          expect(data).toStrictEqual(['0.34', 'af001']);
          done();
        } catch (error) {
          done(error);
        }
      }
      rotateColumns(['af001', '0.34'], callback);
    };
  }

  @Test('CSV columns rotated one position, one of the values is empty')
  private rotateColumsOnePositionEmptyValue () {
    done => { 
      function callback(error, data) {
        try {
          expect(data).toStrictEqual(['0.34', '']);
          done();
        } catch (error) {
          done(error);
        }
      } 
      rotateColumns(['', '0.34'], callback);
    };
  }
}