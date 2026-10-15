import React from 'react';
import { CapitalizationDocumentWindow, type CapitalizationWindowProps } from './CapitalizationDocumentWindow';

/** Financials → Fixed Assets → Capitalization. */
export const CapitalizationWindow: React.FC<CapitalizationWindowProps> = (props) => (
  <CapitalizationDocumentWindow kind="CAPITALIZATION" {...props} />
);
