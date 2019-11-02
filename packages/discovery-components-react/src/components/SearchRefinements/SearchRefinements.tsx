import React, { FC, useContext, useEffect } from 'react';
import DiscoveryV2 from '@disco-widgets/ibm-watson/discovery/v2';
import { Button } from 'carbon-components-react';
import { SearchContext, SearchApi } from '../DiscoverySearch/DiscoverySearch';
import { mergeFilterRefinements } from './utils/mergeFilterRefinements';
import { mergeSuggestedRefinements } from './utils/mergeSuggestedRefinements';
import { SearchFilterTransform } from './utils/searchFilterTransform';
import { displayMessage, noAvailableRefinementsMessage } from './utils/searchRefinementMessages';
import {
  SearchFilterRefinements,
  SelectableQuerySuggestedRefinement
} from './utils/searchRefinementInterfaces';
import get from 'lodash/get';
import { CollectionRefinements } from './components/CollectionRefinements';
import { FieldRefinements } from './components/FieldRefinements';
import { SuggestedRefinements } from './components/SuggestedRefinements';
import defaultMessages, { Messages } from './messages';

interface SearchRefinementsProps {
  /**
   * Show list of collections as refinements
   */
  showCollections?: boolean;
  /**
   * label shown above the collection selection refinement control
   */
  collectionSelectLabel?: string;
  /**
   * tooltip text for collection selection refinement control
   */
  collectionSelectTitleText?: string;
  /**
   * Show list of suggested refinements
   */
  showSuggestedRefinements?: boolean;
  /**
   * Label used for suggested refinements group
   */
  suggestedRefinementsLabel?: string;
  /**
   * i18n messages for the component
   */
  messages?: Messages;
  /**
   * Override aggregation component settings
   */
  overrideComponentSettingsAggregations?: DiscoveryV2.ComponentSettingsAggregation[];
}

export const SearchRefinements: FC<SearchRefinementsProps> = ({
  showCollections,
  collectionSelectLabel = 'Available collections',
  collectionSelectTitleText = 'Collections',
  showSuggestedRefinements,
  suggestedRefinementsLabel = 'Suggested Enrichments',
  messages = defaultMessages,
  overrideComponentSettingsAggregations
}) => {
  const {
    aggregationResults,
    searchParameters,
    searchParameters: { filter },
    searchResponse,
    collectionsResults,
    componentSettings
  } = useContext(SearchContext);
  const { fetchAggregations, performSearch } = useContext(SearchApi);
  const aggregations = aggregationResults || [];
  const collections = (collectionsResults && collectionsResults.collections) || [];
  const mergedMessages = { ...defaultMessages, ...messages };
  const componentSettingsAggregations =
    overrideComponentSettingsAggregations ||
    (componentSettings && componentSettings.aggregations) ||
    [];

  useEffect(() => {
    fetchAggregations(searchParameters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParameters.aggregation]);

  const { filterFields, filterSuggested } = SearchFilterTransform.fromString(filter || '');
  const allFieldRefinements = mergeFilterRefinements(
    aggregations,
    filterFields,
    componentSettingsAggregations
  );
  const allSuggestedRefinements: SelectableQuerySuggestedRefinement[] = mergeSuggestedRefinements(
    get(searchResponse, 'suggested_refinements', []),
    filterSuggested
  );
  const shouldShowCollections = showCollections && !!collections;
  const shouldShowFields = !!allFieldRefinements && allFieldRefinements.length > 0;
  const shouldShowSuggested = showSuggestedRefinements && !!allSuggestedRefinements;
  const originalFilters = {
    filterFields: allFieldRefinements,
    filterSuggested: allSuggestedRefinements
  };

  const handleOnChange = (updatedRefinements: Partial<SearchFilterRefinements>): void => {
    const newFilters = { ...originalFilters, ...updatedRefinements };
    const filter = SearchFilterTransform.toString(newFilters);
    performSearch({ ...searchParameters, offset: 0, filter }, false);
  };

  const handleOnClear = (): void => {
    performSearch({ ...searchParameters, collectionIds: [], offset: 0, filter: '' }, false);
  };

  if (shouldShowFields || shouldShowCollections) {
    return (
      <div>
        {filter && (
          <Button kind="ghost" size="small" onClick={handleOnClear}>
            {messages.clearAllButtonText}
          </Button>
        )}
        {shouldShowCollections && (
          <CollectionRefinements
            label={collectionSelectLabel}
            titleText={collectionSelectTitleText}
          />
        )}
        {shouldShowFields && (
          <FieldRefinements
            allRefinements={allFieldRefinements}
            onChange={handleOnChange}
            componentSettingsAggregations={componentSettingsAggregations}
            messages={mergedMessages}
          />
        )}
        {shouldShowSuggested && (
          <SuggestedRefinements
            suggestedRefinements={allSuggestedRefinements}
            suggestedRefinementsLabel={suggestedRefinementsLabel}
            messages={mergedMessages}
            onChange={handleOnChange}
          />
        )}
      </div>
    );
  } else {
    return displayMessage(noAvailableRefinementsMessage);
  }
};
