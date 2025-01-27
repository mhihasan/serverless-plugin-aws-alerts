const { upperFirst } = require('./helpers');

const getNormalisedName = (name) =>
  `${upperFirst(name.replace(/-/g, 'Dash').replace(/_/g, 'Underscore'))}`;

class Naming {
  getAlarmCloudFormationRef(alarmName, prefix) {
    const normalizePrefix = getNormalisedName(prefix);
    const normalizedName = getNormalisedName(alarmName);

    return `${normalizePrefix}${normalizedName}Alarm`;
  }

  getLogMetricCloudFormationRef(normalizedName, alarmName) {
    return `${normalizedName}${upperFirst(alarmName)}LogMetricFilter`;
  }

  getPatternMetricName(metricName, functionName) {
    return `${upperFirst(metricName)}${functionName}`;
  }

  getDimensionsList({
    dimensionsList,
    functionRef,
    functionVersionLogicalId,
    omitDefaultDimension,
    functionFullName,
  }) {
    if (omitDefaultDimension) {
      return dimensionsList || [];
    }

    const funcNameDimension = {
      Name: 'FunctionName',
      Value: {
        Ref: functionRef,
      },
    };

    const filteredDimensions = (dimensionsList || []).filter(
      (dim) => dim.Name !== 'FunctionName'
    );
    filteredDimensions.push(funcNameDimension);

    if (functionVersionLogicalId) {
      filteredDimensions.push({
        Name: 'Resource',
        Value: {
          'Fn::Join': [
            ':',
            [
              functionFullName,
              {
                'Fn::GetAtt': [functionVersionLogicalId, 'Version'],
              },
            ],
          ],
        },
      });
    }

    return filteredDimensions;
  }

  getAlarmName(options) {
    const interpolatedTemplate = options.template
      .replace('$[functionName]', options.functionName)
      .replace('$[functionId]', options.functionLogicalId)
      .replace('$[metricName]', options.metricName)
      .replace('$[metricId]', options.metricId);

    const prefixTemplate =
      typeof options.prefixTemplate !== 'undefined'
        ? options.prefixTemplate
        : '$[stackName]';
    const interpolatedPrefix = prefixTemplate.replace(
      '$[stackName]',
      options.stackName
    );

    return interpolatedPrefix
      ? `${interpolatedPrefix}-${interpolatedTemplate}`
      : interpolatedTemplate;
  }
}

module.exports = Naming;
