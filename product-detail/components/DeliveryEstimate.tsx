import { useState } from 'react';
import { useDeliveryQuery } from '../data';
import { strings } from '../config/strings';
import { LabeledField } from './LabeledField';

type Props = { productId: string };

export const DeliveryEstimate = ({ productId }: Props) => {
  const [draft, setDraft] = useState('');
  const [postcode, setPostcode] = useState('');
  const delivery = useDeliveryQuery(productId, postcode);

  const message = delivery.isError
    ? strings.deliveryError
    : delivery.data
      ? strings.deliveryAvailable(delivery.data.days)
      : '';

  return (
    <LabeledField
      label={strings.checkDelivery}
      value={draft}
      onChange={setDraft}
      placeholder={strings.postcodePlaceholder}
      message={message}
      action={
        <button type="button" onClick={() => setPostcode(draft.trim())}>
          {strings.check}
        </button>
      }
    />
  );
};
