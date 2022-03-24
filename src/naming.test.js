const Naming = require('./naming');

describe('#naming', () => {
  describe('#getAlarmCloudFormationRef', () => {
    let naming = null;
    beforeEach(() => (naming = new Naming()));

    it('should get alarm name', () => {
      const expected = 'PrefixFunctionErrorsAlarm';
      const actual = naming.getAlarmCloudFormationRef(
        'functionErrors',
        'prefix'
      );
      expect(actual).toEqual(expected);
    });
  });

  describe('#getLogMetricCloudFormationRef', () => {
    let naming = null;
    beforeEach(() => (naming = new Naming()));

    it('should get alarm name', () => {
      const expected = 'PrefixFunctionErrorsLogMetricFilter';
      const actual = naming.getLogMetricCloudFormationRef(
        'Prefix',
        'functionErrors'
      );
      expect(actual).toEqual(expected);
    });
  });

  describe('#getPatternMetricName', () => {
    let naming = null;
    beforeEach(() => (naming = new Naming()));

    it('should get the pattern metric name', () => {
      const expected = 'MetricNamefoo';
      const actual = naming.getPatternMetricName('MetricName', 'foo');
      expect(actual).toEqual(expected);
    });
  });

  describe('#getDimensionsList', () => {
    let naming = null;
    beforeEach(() => (naming = new Naming()));

    it('should use function name derived from funcref', () => {
      const expected = [
        { Name: 'Duck', Value: 'QUACK' },
        { Name: 'FunctionName', Value: { Ref: 'funcName' } },
      ];
      const actual = naming.getDimensionsList({
        dimensionsList: [
          { Name: 'FunctionName', Value: 'overridden' },
          { Name: 'Duck', Value: 'QUACK' },
        ],
        functionRef: 'funcName',
      });
      expect(actual).toEqual(expected);
    });

    it('should use function name derived from funcref when dimensions are undefined', () => {
      const expected = [{ Name: 'FunctionName', Value: { Ref: 'funcName' } }];
      const actual = naming.getDimensionsList({
        dimensionsList: undefined,
        functionRef: 'funcName',
      });
      expect(actual).toEqual(expected);
    });

    it('should get a mapped dimensions object when FunctionName is missing', () => {
      const expected = [
        { Name: 'Duck', Value: 'QUACK' },
        { Name: 'FunctionName', Value: { Ref: 'funcName' } },
      ];
      const actual = naming.getDimensionsList({
        dimensionsList: [{ Name: 'Duck', Value: 'QUACK' }],
        functionRef: 'funcName',
      });
      expect(actual).toEqual(expected);
    });

    it('should not include FunctionName when omitFunctionNameDimension is true', () => {
      const expected = [{ Name: 'Duck', Value: 'QUACK' }];
      const actual = naming.getDimensionsList({
        dimensionsList: [{ Name: 'Duck', Value: 'QUACK' }],
        functionRef: 'funcName',
        omitDefaultDimension: true,
      });
      expect(actual).toEqual(expected);
    });

    it('should include Resource dimension if functionVersionLogicalId is passed', () => {
      const actual = naming.getDimensionsList({
        functionRef: 'funcRef',
        functionVersionLogicalId: 'funcVersionLogicalId',
        functionFullName: 'funcFullName',
      });

      expect(actual).toEqual([
        {
          Name: 'FunctionName',
          Value: {
            Ref: 'funcRef',
          },
        },
        {
          Name: 'Resource',
          Value: {
            'Fn::Join': [
              ':',
              [
                'funcFullName',
                {
                  'Fn::GetAtt': ['funcVersionLogicalId', 'Version'],
                },
              ],
            ],
          },
        },
      ]);
    });
  });

  describe('#getAlarmName', () => {
    let naming = null;
    beforeEach(() => (naming = new Naming()));

    it('should interpolate alarm name', () => {
      const template =
        '$[functionName]-$[functionId]-$[metricName]-$[metricId]';
      const functionName = 'function';
      const functionLogicalId = 'functionId';
      const metricName = 'metric';
      const metricId = 'metricId';
      const stackName = 'fooservice-dev';

      const expected = `${stackName}-${functionName}-${functionLogicalId}-${metricName}-${metricId}`;
      const actual = naming.getAlarmName({
        template,
        functionName,
        functionLogicalId,
        metricName,
        metricId,
        stackName,
      });

      expect(actual).toEqual(expected);
    });

    it('should interpolate alarm prefix', () => {
      const template =
        '$[functionName]-$[functionId]-$[metricName]-$[metricId]';
      const prefixTemplate = 'notTheStackName';
      const functionName = 'function';
      const functionLogicalId = 'functionId';
      const metricName = 'metric';
      const metricId = 'metricId';
      const stackName = 'fooservice-dev';

      const expected = `notTheStackName-${functionName}-${functionLogicalId}-${metricName}-${metricId}`;
      const actual = naming.getAlarmName({
        template,
        prefixTemplate,
        functionName,
        functionLogicalId,
        metricName,
        metricId,
        stackName,
      });

      expect(actual).toEqual(expected);
    });

    it('should interpolate an empty alarm prefix', () => {
      const template =
        '$[functionName]-$[functionId]-$[metricName]-$[metricId]';
      const prefixTemplate = '';
      const functionName = 'function';
      const functionLogicalId = 'functionId';
      const metricName = 'metric';
      const metricId = 'metricId';
      const stackName = 'fooservice-dev';

      const expected = `${functionName}-${functionLogicalId}-${metricName}-${metricId}`;
      const actual = naming.getAlarmName({
        template,
        prefixTemplate,
        functionName,
        functionLogicalId,
        metricName,
        metricId,
        stackName,
      });

      expect(actual).toEqual(expected);
    });
  });
});
