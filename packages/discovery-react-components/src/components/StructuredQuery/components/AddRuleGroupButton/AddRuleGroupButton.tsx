import React, { FC, Dispatch, SetStateAction } from 'react';
import { Button } from 'carbon-components-react';
import Add16 from '@carbon/icons-react/lib/add/16';
import { Messages } from 'components/StructuredQuery/messages';
import { StructuredQuerySelection, getNewId } from 'components/StructuredQuery/utils';

export interface AddRuleGroupButtonProps {
  /**
   * text to display for the Add rule group button
   */
  addRuleGroupText: Messages['addRuleGroupText'];
  /**
   * state that represents the current rules and selections for the structured query
   */
  structuredQuerySelection: StructuredQuerySelection;
  /**
   * used to set the structuredQuerySelection state
   */
  setStructuredQuerySelection: Dispatch<SetStateAction<StructuredQuerySelection>>;
}

export const AddRuleGroupButton: FC<AddRuleGroupButtonProps> = ({
  addRuleGroupText,
  structuredQuerySelection,
  setStructuredQuerySelection
}) => {
  const handleOnClick = () => {
    const newRuleGroupId = getNewId(structuredQuerySelection.groups);
    const newRuleRowId = getNewId(structuredQuerySelection.rows);
    setStructuredQuerySelection({
      ...structuredQuerySelection,
      groups: {
        ...structuredQuerySelection.groups,
        [`${newRuleGroupId}`]: {
          rows: [newRuleRowId]
        }
      },
      rows: {
        ...structuredQuerySelection.rows,
        [`${newRuleRowId}`]: {
          field: null,
          operator: null,
          value: ''
        }
      },
      group_order: structuredQuerySelection.group_order.concat(newRuleGroupId)
    });
  };

  return (
    <Button kind="ghost" renderIcon={Add16} onClick={handleOnClick}>
      {addRuleGroupText}
    </Button>
  );
};
