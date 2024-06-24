const { calculatePrecision, calculatePrecisionValues, calculateAverage } = require('../js/precision_calculation.js');

describe('EyeTracking functions', () => {
  describe('calculatePrecision', () => {
    it('should return an array with precision percentages and pixels', () => {
      const past50Array = [[/* x values */], [/* y values */]];
      const method = 'percents';
      const precision = calculatePrecision(past50Array, method);
      expect(precision).toHaveLength(2);
      expect(precision[0]).toBeGreaterThanOrEqual(0);
      expect(precision[0]).toBeLessThanOrEqual(100);
    });
  });

  describe('calculatePrecisionValues', () => {
    it('should calculate precision percentages and distances', () => {
      const percentageValues = [];
      const distanceValues = [];
      const windowHeight = 800;
      const x50 = [/* x values */];
      const y50 = [/* y values */];
      const staringPointX = 400;
      const staringPointY = 400;
      const method = 'percents';
      calculatePrecisionValues(percentageValues, distanceValues, windowHeight, x50, y50, staringPointX, staringPointY, method);
      percentageValues.forEach(percentage => {
        expect(percentage).toBeGreaterThanOrEqual(0);
        expect(percentage).toBeLessThanOrEqual(100);
      });
      distanceValues.forEach(distance => {
        expect(distance).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe('calculateAverage', () => {
    it('should calculate the average precision percentage', () => {
      const precisionPercentages = [/* values */];
      const averagePrecision = calculateAverage(precisionPercentages);
      expect(averagePrecision).toBeGreaterThanOrEqual(0);
      expect(averagePrecision).toBeLessThanOrEqual(100);
      console.log(averagePrecision);
    });
  });
});
