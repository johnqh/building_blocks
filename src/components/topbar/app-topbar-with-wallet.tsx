import React, { type ReactNode, type ComponentType } from 'react';
import { AppTopBar, type AppTopBarProps } from './app-topbar';
import { cn } from '../../utils';
import { GRADIENT_CLASSES } from '@sudobility/design';

/**
 * Wallet menu item for the connected wallet dropdown.
 */
export interface WalletMenuItem {
  /** Unique identifier */
  id: string;
  /** Display label */
  label: string;
  /** Icon component */
  icon?: ComponentType<{ className?: string }>;
  /** Click handler */
  onClick: () => void;
  /** Whether this is a separator */
  separator?: boolean;
}

/**
 * Auth status enum matching @sudobility/types.
 */
export enum AuthStatus {
  DISCONNECTED = 'disconnected',
  CONNECTED = 'connected',
  VERIFIED = 'verified',
}

/**
 * Chain type enum matching @sudobility/types.
 */
export enum ChainType {
  EVM = 'evm',
  SOLANA = 'solana',
}

/**
 * Props for the WalletDropdownMenu component from @sudobility/web3-components.
 */
export interface WalletDropdownMenuProps {
  walletAddress: string;
  authStatus: AuthStatus | string;
  chainType: ChainType | string | 'unknown';
  menuItems: WalletMenuItem[];
  avatar?: string;
  displayName?: string;
  statusLabels?: {
    verified?: string;
    connected?: string;
    disconnected?: string;
  };
}

export interface AppTopBarWithWalletProps extends Omit<
  AppTopBarProps,
  'renderAccountSection'
> {
  /**
   * WalletDropdownMenu component from @sudobility/web3-components.
   * This is passed as a prop to avoid hard dependency on web3-components.
   */
  WalletDropdownMenuComponent?: ComponentType<WalletDropdownMenuProps>;

  /** Whether wallet is connected */
  isConnected: boolean;

  /** Connected wallet address */
  walletAddress?: string;

  /** Authentication status */
  authStatus?: AuthStatus | string;

  /** Chain type (EVM, Solana, etc.) */
  chainType?: ChainType | string | 'unknown';

  /** Connect button click handler */
  onConnect: () => void;

  /** Disconnect handler */
  onDisconnect: () => Promise<void>;

  /** Custom menu items for wallet dropdown */
  walletMenuItems?: WalletMenuItem[];

  /** Connect button content (default: "Connect Wallet") */
  connectButtonContent?: ReactNode;

  /** Connect button className (supports gradient classes from @sudobility/design) */
  connectButtonClassName?: string;

  /** Use gradient styling for connect button */
  useGradientButton?: boolean;

  /** Optional user avatar */
  avatar?: string;

  /** Optional display name */
  displayName?: string;

  /** Custom status labels */
  statusLabels?: {
    verified?: string;
    connected?: string;
    disconnected?: string;
  };
}

/**
 * Default connect button when WalletDropdownMenuComponent is not provided
 * or when wallet is not connected.
 */
const DefaultConnectButton: React.FC<{
  onClick: () => void;
  content?: ReactNode;
  className?: string;
  useGradient?: boolean;
}> = ({ onClick, content = 'Connect Wallet', className, useGradient }) => (
  <button
    onClick={onClick}
    className={cn(
      useGradient
        ? GRADIENT_CLASSES.headerButton
        : 'px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors',
      className
    )}
  >
    {content}
  </button>
);

/**
 * Simple fallback wallet display when WalletDropdownMenuComponent is not provided.
 */
const FallbackWalletDisplay: React.FC<{
  walletAddress: string;
  onDisconnect: () => Promise<void>;
}> = ({ walletAddress, onDisconnect }) => {
  const truncatedAddress = `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`;

  return (
    <div className='flex items-center gap-2'>
      <span className='text-sm font-medium text-gray-700 dark:text-gray-300'>
        {truncatedAddress}
      </span>
      <button
        onClick={() => onDisconnect()}
        className='text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
      >
        Disconnect
      </button>
    </div>
  );
};

/**
 * AppTopBarWithWallet - TopBar with wallet connection integration.
 *
 * This component wraps AppTopBar and provides wallet connection UI
 * for the account section. Uses WalletDropdownMenu from @sudobility/web3-components
 * when provided.
 *
 * @example
 * ```tsx
 * import { WalletDropdownMenu } from '@sudobility/web3-components';
 *
 * <AppTopBarWithWallet
 *   logo={{ src: '/logo.png', appName: 'My App' }}
 *   menuItems={[...]}
 *   WalletDropdownMenuComponent={WalletDropdownMenu}
 *   isConnected={isConnected}
 *   walletAddress={walletAddress}
 *   authStatus={authStatus}
 *   chainType={chainType}
 *   onConnect={() => navigate('/connect')}
 *   onDisconnect={handleDisconnect}
 *   walletMenuItems={[
 *     { id: 'copy', label: 'Copy Address', icon: ClipboardIcon, onClick: handleCopy },
 *     { id: 'disconnect', label: 'Disconnect', icon: LogoutIcon, onClick: handleDisconnect },
 *   ]}
 * />
 * ```
 */
export const AppTopBarWithWallet: React.FC<AppTopBarWithWalletProps> = ({
  WalletDropdownMenuComponent,
  isConnected,
  walletAddress,
  authStatus = AuthStatus.DISCONNECTED,
  chainType = 'unknown',
  onConnect,
  onDisconnect,
  walletMenuItems = [],
  connectButtonContent,
  connectButtonClassName,
  useGradientButton = true,
  avatar,
  displayName,
  statusLabels,
  ...topBarProps
}) => {
  const renderAccountSection = () => {
    // Not connected - show connect button
    if (!isConnected || !walletAddress) {
      return (
        <DefaultConnectButton
          onClick={onConnect}
          content={connectButtonContent}
          className={connectButtonClassName}
          useGradient={useGradientButton}
        />
      );
    }

    // Connected with WalletDropdownMenu component
    if (WalletDropdownMenuComponent) {
      return (
        <WalletDropdownMenuComponent
          walletAddress={walletAddress}
          authStatus={authStatus}
          chainType={chainType}
          menuItems={walletMenuItems}
          avatar={avatar}
          displayName={displayName}
          statusLabels={statusLabels}
        />
      );
    }

    // Connected without WalletDropdownMenu - fallback display
    return (
      <FallbackWalletDisplay
        walletAddress={walletAddress}
        onDisconnect={onDisconnect}
      />
    );
  };

  return (
    <AppTopBar {...topBarProps} renderAccountSection={renderAccountSection} />
  );
};

export default AppTopBarWithWallet;
