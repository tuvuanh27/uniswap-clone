import React, { ReactNode, useState } from 'react'
import { MetaMaskInpageProvider } from '@metamask/providers'
import { Maybe } from '@metamask/providers/dist/utils'
import { SocketAddress } from 'net'

declare global {
  interface Window {
    ethereum: MetaMaskInpageProvider
  }
}

export interface ITransactionContext {
  currentAccount: string
  connectWallet: (metamask?: MetaMaskInpageProvider) => Promise<void>
}

interface IProps {
  children: ReactNode
}

export const TransactionContext = React.createContext<ITransactionContext | null>(null)

let eth: MetaMaskInpageProvider

if (typeof window !== 'undefined') {
  eth = window.ethereum
}

export const TransactionProvider = ({ children }: IProps) => {
  const [currentAccount, setCurrentAccount] = useState<string>('')
  const connectWallet = async (metamask = eth) => {
    try {
      if (!eth) {
        return alert('Please install Metamask!')
      }
      const accounts = (await metamask.request({
        method: 'eth_requestAccounts',
      })) as string[]
      setCurrentAccount(accounts[0])
    } catch (error: any) {
      console.error(error.message)
      throw new Error('No ethereum object')
    }
  }

  return (
    <TransactionContext.Provider
      value={{
        currentAccount,
        connectWallet,
      }}
    >
      {children}
    </TransactionContext.Provider>
  )
}
