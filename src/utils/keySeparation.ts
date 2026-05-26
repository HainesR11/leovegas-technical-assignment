type TUserKeySeperation = {
  props: Object;
};

/**
 * Function that separates the object key-value pairs into keys and values used in postgres querys.
 *
 * @param props Object properties to be separated
 * @returns 2 Objects containing the object keys and object values
 */

export const postgresObjectSeperator = ({ props }: TUserKeySeperation) => {
  let keys: Array<string> = [];
  let values: Array<string> = [];

  Object.keys(props).forEach((key, i) => {
    keys.push(key + " = $" + (i + 1));
  });

  Object.values(props).forEach((value, i) => {
    return values.push(value as string);
  });

  return { keys, values };
};
