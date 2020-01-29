import React, { FC, Dispatch, SetStateAction, useContext, SyntheticEvent } from 'react';
import { ComboBox, TextInput } from 'carbon-components-react';
import { RemoveRuleRowButton } from '../RemoveRuleRowButton/RemoveRuleRowButton';
import { Messages } from 'components/StructuredQuery/messages';
import { structuredQueryRulesClass } from 'components/StructuredQuery/cssClasses';
import {
  StructuredQuerySelection,
  OperatorDropdownSelectedItem
} from 'components/StructuredQuery/utils/structuredQueryInterfaces';
import { SearchContext } from 'components/DiscoverySearch/DiscoverySearch';
import { getFieldNames } from 'components/StructuredQuery/utils';

export interface RuleRowProps {
  /**
   * override default messages for the component by specifying custom and/or internationalized text strings
   */
  messages: Messages;
  /**
   * id of the group for the rule row to render
   */
  groupId: number;
  /**
   * id of the rule row to render
   */
  rowId: number;
  /**
   * state that represents the current rules and selections for the structured query
   */
  structuredQuerySelection: StructuredQuerySelection;
  /**
   * used to set the structuredQuerySelection state
   */
  setStructuredQuerySelection: Dispatch<SetStateAction<StructuredQuerySelection>>;
  touched: boolean;
}

export const RuleRow: FC<RuleRowProps> = ({
  messages,
  groupId,
  rowId,
  structuredQuerySelection,
  setStructuredQuerySelection,
  touched
}) => {
  const {
    fieldsStore: { data: fieldsResponse, isLoading: fieldStoreLoading, isError: fieldStoreError }
  } = useContext(SearchContext);
  const projectFields: string[] = getFieldNames(fieldsResponse);

  const operatorDropdownItems = [
    { label: messages.operatorDropdownIsOptionText, value: '::' },
    { label: messages.operatorDropdownIsNotOptionText, value: '::!' },
    { label: messages.operatorDropdownContainsOptionText, value: ':' },
    { label: messages.operatorDropdownDoesNotContainOptionText, value: ':!' }
  ];
  const isTopLevelGroup = groupId === 0;
  const showRemoveRuleRowButton =
    structuredQuerySelection.groups[groupId].rows.length > 1 || !isTopLevelGroup;

  const handleFieldDropdownChange = (fieldSelection: { selectedItem: string }) => {
    setStructuredQuerySelection({
      ...structuredQuerySelection,
      rows: {
        ...structuredQuerySelection.rows,
        [`${rowId}`]: {
          ...structuredQuerySelection.rows[rowId],
          field: fieldSelection.selectedItem
        }
      }
    });
  };

  const handleOperatorDropdownChange = (operatorSelection: OperatorDropdownSelectedItem) => {
    const newValue =
      operatorSelection.selectedItem === null ? null : operatorSelection.selectedItem.value;
    setStructuredQuerySelection({
      ...structuredQuerySelection,
      rows: {
        ...structuredQuerySelection.rows,
        [`${rowId}`]: {
          ...structuredQuerySelection.rows[rowId],
          operator: newValue
        }
      }
    });
  };

  const handleValueInputChange = (event: SyntheticEvent<HTMLInputElement>) => {
    const valueText: HTMLInputElement['value'] = event.currentTarget.value;
    setStructuredQuerySelection({
      ...structuredQuerySelection,
      rows: {
        ...structuredQuerySelection.rows,
        [`${rowId}`]: {
          ...structuredQuerySelection.rows[rowId],
          value: valueText
        }
      }
    });
  };

  let placeholderText: string;
  if (fieldStoreLoading) {
    placeholderText = messages.fieldDropdownLoadingText;
  } else if (fieldStoreError) {
    placeholderText = messages.fieldDropdownErrorText;
  } else {
    placeholderText = messages.fieldDropdownPlaceholderText;
  }

  return (
    <div className={structuredQueryRulesClass} data-testid={`rule-row-${groupId}`}>
      <ComboBox
        id={`structured-query-rules-field-${groupId}`}
        items={projectFields}
        placeholder={placeholderText}
        titleText={messages.fieldDropdownTitleText}
        disabled={fieldStoreLoading || fieldStoreError}
        onChange={handleFieldDropdownChange}
        invalid={touched && structuredQuerySelection.rows[rowId].field === null}
      />
      <ComboBox
        id={`structured-query-rules-operator-${groupId}`}
        items={operatorDropdownItems}
        placeholder={messages.operatorDropdownPlaceholderText}
        titleText={messages.operatorDropdownTitleText}
        onChange={handleOperatorDropdownChange}
        invalid={touched && structuredQuerySelection.rows[rowId].operator === null}
      />
      <TextInput
        id={`structured-query-rules-value-${groupId}`}
        labelText={messages.valueInputLabelText}
        placeholder={messages.valueInputPlaceholderText}
        onChange={handleValueInputChange}
        invalid={touched && structuredQuerySelection.rows[rowId].value === ''}
      />
      {showRemoveRuleRowButton && (
        <RemoveRuleRowButton
          removeRuleRowButtonIconDescription={messages.removeRuleRowButtonIconDescription}
          groupId={groupId}
          rowId={rowId}
          structuredQuerySelection={structuredQuerySelection}
          setStructuredQuerySelection={setStructuredQuerySelection}
        />
      )}
    </div>
  );
};
