import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Linkify } from 'Roblox';
import { useTranslation } from 'react-utilities';
import { useGroupProfileHeaderContext } from '../context/GroupProfileHeaderContext';
import GroupDescriptionDialog from './GroupDescriptionDialog';
import { sendCommunityDetailsClickEvent } from '../../shared/userActivity/groupPageEventStream';

type StringWithEscapeHTML = string & { escapeHTML: () => string };

const noOp = (): null => null;

const Description: React.FC = () => {
  const { translate } = useTranslation();
  const { aboutData } = useGroupProfileHeaderContext();
  const [modalOpen, setModalOpen] = useState(false);
  const [descriptionRef, setDescriptionRef] = useState<HTMLPreElement | null>(null);
  const [isDescriptionOverflowed, setIsDescriptionOverflowed] = useState(false);

  const checkDescriptionOverflow = useCallback(() => {
    if (descriptionRef === null) {
      return;
    }
    const { scrollHeight, clientHeight } = descriptionRef;
    setIsDescriptionOverflowed(scrollHeight > clientHeight);
  }, [descriptionRef]);

  useEffect(() => {
    if (!descriptionRef) return noOp;
    checkDescriptionOverflow();

    const observer = new ResizeObserver(() => {
      checkDescriptionOverflow();
    });
    observer.observe(descriptionRef);
    return () => {
      observer.disconnect();
    };
  }, [descriptionRef, checkDescriptionOverflow]);

  const isMoreButtonVisible = useMemo(() => {
    if (!aboutData) {
      return false;
    }

    const isFundsVisible = (aboutData.funds ?? null) !== null;
    const hasSocialLinks = !!aboutData.socialLinks;
    const hasNameHistory = (aboutData.nameHistory ?? []).length > 0;
    return isDescriptionOverflowed || isFundsVisible || hasSocialLinks || hasNameHistory;
  }, [aboutData, isDescriptionOverflowed]);

  // Be cautious editing below code. this can easily create a XSS vulnerability if not handled properly.
  const linkifiedDescription = useMemo(() => {
    if (!aboutData) {
      return '';
    }

    if (!aboutData.description) {
      return translate('Label.NoBioYet');
    }

    if (Linkify !== undefined) {
      // We need to cast content to new type because typescript is unaware of the escapeHTML added to the string prototype
      const escapedContent = (aboutData.description as StringWithEscapeHTML).escapeHTML();
      return Linkify.String(escapedContent);
    }
    // Unsafe to return any content if Linkify is not defined because we need to use escapeHTML method
    return '';
  }, [aboutData, translate]);

  const openModal = useCallback(() => {
    setModalOpen(true);
  }, []);

  const handleMoreClick = useCallback(() => {
    sendCommunityDetailsClickEvent();
    openModal();
  }, [openModal]);

  const closeModal = useCallback(() => {
    setModalOpen(false);
  }, []);

  return (
    <div className='description-container'>
      <pre
        ref={setDescriptionRef}
        className='description-content text-body-medium content-default'
        dangerouslySetInnerHTML={{ __html: linkifiedDescription }}
      />
      {isMoreButtonVisible && (
        <button
          type='button'
          className='description-more-btn text-body-medium content-emphasis'
          onClick={handleMoreClick}>
          {translate('Action.More')}
        </button>
      )}
      <GroupDescriptionDialog
        open={modalOpen}
        onClose={closeModal}
        descriptionWithEscapedHtml={linkifiedDescription}
        funds={aboutData?.funds}
        socialLinks={aboutData?.socialLinks}
        nameHistory={aboutData?.nameHistory}
      />
    </div>
  );
};

export default Description;
