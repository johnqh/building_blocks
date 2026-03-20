import React from 'react';

export interface EmptyStateProps {
  /** Message text displayed in the empty state */
  message: string;
  /** Label for the primary action button */
  buttonLabel: string;
  /** Callback fired when the button is pressed */
  onPress: () => void;
}

/**
 * EmptyState - Centered message with a primary action button.
 *
 * Use this when a list or page has no content to display.
 *
 * @example
 * ```tsx
 * <EmptyState
 *   message="No items found"
 *   buttonLabel="Create Item"
 *   onPress={() => navigate('/new')}
 * />
 * ```
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  message,
  buttonLabel,
  onPress,
}) => {
  return (
    <div className='flex-1 flex flex-col items-center justify-center px-8'>
      <p className='text-gray-500 dark:text-gray-400 text-center text-[15px] leading-relaxed mb-5'>
        {message}
      </p>
      <button
        type='button'
        onClick={onPress}
        className='bg-blue-600 hover:bg-blue-700 text-white rounded-md px-6 py-2 text-sm font-medium min-h-[44px]'
      >
        {buttonLabel}
      </button>
    </div>
  );
};

export default EmptyState;
