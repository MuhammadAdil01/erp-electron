import React from 'react';
import { CapitalizationDocumentWindow, type CapitalizationWindowProps } from './CapitalizationDocumentWindow';

/** Financials → Fixed Assets → Capitalization Credit Memo. */
export const CapitalizationCreditMemoWindow: React.FC<CapitalizationWindowProps> = (props) => (
  <CapitalizationDocumentWindow kind="CREDIT_MEMO" {...props} />
);
