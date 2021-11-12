import { authenticateDid } from './3box';

// Maintains state through update by reference
export const handleCustomAwait = async (
  awaitType,
  then,
  setFormState,
  setValue,
  values,
) => {
  setFormState('loading');
  try {
    await awaitType.func(...awaitType.args, setValue, values);
    if (typeof then === 'function') {
      then();
      setFormState('');
    } else {
      setFormState('');
    }
  } catch (error) {
    console.error(error);
    setFormState('error');
  }
};
