import { HandableInvocations } from "../types/handlable";

/**
 * 
 * Im not happy with this functionality and it will eventually have to be refactored.
 * The idea is to allow for complex attribute matching, such as nested attributes and custom logic.
 * This is a work in progress and will be improved over time.
 * 
 */

enum $ATTRIBUTE_CHAINS {
  AND = "and",
  OR = "or",
  NOT = "not",
  XOR = "xor",
  NOR = "nor",
  NAND = "nand",
  XNOR = "znor",
}

export type AttributeConstruction = {
  /**
   * Can be a nested attribute eg: user.name.firstName
   */
  attribute?: string;
  /**
   * Expected value of the attribute, for more complex comparisons use the 'test' attribute.
   */
  value?: string;
  test?: (value: string) => boolean;
  previousAttributes?: Array<
    Pick<
      AttributeConstruction,
      "attribute" | "value" | "test" | "$ATTR_CONDITION"
    >
  >;
  /**
   * Custom logic handler that determines how to obtain the image from the event.
   * This is useful for events that do not have a direct image, such as SQS messages.
   */
  obtainImage?: (invocation: HandableInvocations) => object | undefined;
  ["$ATTR_CONDITION"]?: $ATTRIBUTE_CHAINS;
};

// TO DO: implement nested attributes in a clean way
export type ConstructedAttribute = AttributeConstruction & {
  [$ATTRIBUTE_CHAINS.AND]: (
    props: AttributeConstruction
  ) => AttributeConstruction;
  [$ATTRIBUTE_CHAINS.OR]: (
    props: AttributeConstruction
  ) => AttributeConstruction;
  [$ATTRIBUTE_CHAINS.XOR]: (
    props: AttributeConstruction
  ) => AttributeConstruction;
  [$ATTRIBUTE_CHAINS.NOR]: (
    props: AttributeConstruction
  ) => AttributeConstruction;
  [$ATTRIBUTE_CHAINS.NAND]: (
    props: AttributeConstruction
  ) => AttributeConstruction;
  [$ATTRIBUTE_CHAINS.XNOR]: (
    props: AttributeConstruction
  ) => AttributeConstruction;
  [$ATTRIBUTE_CHAINS.NOT]: (
    props: AttributeConstruction
  ) => AttributeConstruction;
};

/**
 * It is recommended to keep common attribute checks in a shared file to reduce code reuse and improve
 * readability.
 */
export const heidiAttribute = (
  props: AttributeConstruction
): ConstructedAttribute => {
  return {
    attribute: props.attribute,
    value: props.value,
    test: props.test,
    [$ATTRIBUTE_CHAINS.AND]: (_props: AttributeConstruction) => {
      _props.previousAttributes = props.previousAttributes || [];
      _props.previousAttributes.push({
        attribute: props.attribute,
        value: props.value,
        test: props.test,
        $ATTR_CONDITION: $ATTRIBUTE_CHAINS.AND,
      });
      return heidiAttribute(_props);
    },
    [$ATTRIBUTE_CHAINS.OR]: (_props: AttributeConstruction) => {
      _props.previousAttributes = props.previousAttributes || [];
      _props.previousAttributes.push({
        attribute: props.attribute,
        value: props.value,
        test: props.test,
        $ATTR_CONDITION: $ATTRIBUTE_CHAINS.OR,
      });
      return heidiAttribute(_props);
    },
    [$ATTRIBUTE_CHAINS.XOR]: (_props: AttributeConstruction) => {
      _props.previousAttributes = props.previousAttributes || [];
      _props.previousAttributes.push({
        attribute: props.attribute,
        value: props.value,
        test: props.test,
        $ATTR_CONDITION: $ATTRIBUTE_CHAINS.XOR,
      });
      return heidiAttribute(_props);
    },
    [$ATTRIBUTE_CHAINS.NOR]: (_props: AttributeConstruction) => {
      _props.previousAttributes = props.previousAttributes || [];
      _props.previousAttributes.push({
        attribute: props.attribute,
        value: props.value,
        test: props.test,
        $ATTR_CONDITION: $ATTRIBUTE_CHAINS.NOR,
      });
      return heidiAttribute(_props);
    },
    [$ATTRIBUTE_CHAINS.NAND]: (_props: AttributeConstruction) => {
      _props.previousAttributes = props.previousAttributes || [];
      _props.previousAttributes.push({
        attribute: props.attribute,
        value: props.value,
        test: props.test,
        $ATTR_CONDITION: $ATTRIBUTE_CHAINS.NAND,
      });
      return heidiAttribute(_props);
    },
    [$ATTRIBUTE_CHAINS.XNOR]: (_props: AttributeConstruction) => {
      _props.previousAttributes = props.previousAttributes || [];
      _props.previousAttributes.push({
        attribute: props.attribute,
        value: props.value,
        test: props.test,
        $ATTR_CONDITION: $ATTRIBUTE_CHAINS.XNOR,
      });
      return heidiAttribute(_props);
    },
    [$ATTRIBUTE_CHAINS.NOT]: (_props: AttributeConstruction) => {
      _props.previousAttributes = props.previousAttributes || [];
      _props.previousAttributes.push({
        attribute: props.attribute,
        value: props.value,
        test: props.test,
        $ATTR_CONDITION: $ATTRIBUTE_CHAINS.NOT,
      });
      return heidiAttribute(_props);
    },
  };
};
