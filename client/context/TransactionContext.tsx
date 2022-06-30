import React, { ReactNode, useEffect, useState } from 'react'
import { MetaMaskInpageProvider } from '@metamask/providers'
import { ethers } from 'ethers'
import { alchemyApiKey, contarctAddress, contractAbi } from '../lib/const '
import { client } from '../lib/sanityClient'

declare global {
  interface Window {
    ethereum: MetaMaskInpageProvider
  }
}

export interface ITransactionContext {
  currentAccount: string
  formData: IFormData
  connectWallet: (metamask?: MetaMaskInpageProvider) => Promise<void>
  sendTransaction: (metamask?: MetaMaskInpageProvider, connectedAccount?: string) => Promise<void>
  handleChange: (e: React.ChangeEvent<HTMLInputElement>, name: string) => void
}

interface IProps {
  children: ReactNode
}

interface IFormData {
  addressTo: string
  amount: string
}

export const TransactionContext = React.createContext<ITransactionContext>(
  null as unknown as ITransactionContext
)

let eth: MetaMaskInpageProvider

if (typeof window !== 'undefined') {
  eth = window.ethereum
}

const getEthereumContract = () => {
  const contractAddress = contarctAddress
  const contractABI = contractAbi
  // @ts-ignore
  const provider = new ethers.providers.Web3Provider(eth)
  // const provider = new ethers.providers.AlchemyProvider('rinkeby', alchemyApiKey)

  const signer = provider.getSigner()
  console.log('🚀 ~ file: TransactionContext.tsx ~ line 45 ~ getEthereumContract ~ signer', signer)
  const transactionContract = new ethers.Contract(contractAddress, contractABI, signer)
  console.log(
    '🚀 ~ file: TransactionContext.tsx ~ line 49 ~ getEthereumContract ~ transactionContract',
    transactionContract
  )
  return transactionContract
}

export const TransactionProvider = ({ children }: IProps) => {
  const [currentAccount, setCurrentAccount] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [formData, setFormData] = useState<IFormData>({
    addressTo: '',
    amount: '',
  })

  useEffect(() => {
    if (!currentAccount) return
    ;(async () => {
      const userDoc = {
        _type: 'users',
        _id: currentAccount,
        userName: 'vuanhtu',
        address: currentAccount,
      }
      await client.createIfNotExists(userDoc)
    })()
    console.log('wallet is already connected')
  }, [currentAccount])

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

  const checkIfWalletIsConnected = async (metamask = eth) => {
    try {
      if (!metamask) return alert('Please install Metamask!')
      const accounts = (await metamask.request({
        method: 'eth_accounts',
      })) as string[]
      if (accounts.length > 0) {
        setCurrentAccount(accounts[0])
      }
    } catch (error: any) {
      console.error(error.message)
      throw new Error('No ethereum object')
    }
  }

  const saveTransaction = async (
    txHash: string,
    amount: string,
    fromAddress = currentAccount,
    toAddress: string
  ): Promise<void> => {
    await client.createIfNotExists({
      _type: 'transactions',
      _id: txHash,
      fromWallet: fromAddress,
      toAddress: toAddress,
      timestamp: new Date(Date.now()).toISOString(),
      txHash: txHash,
      amount: parseFloat(amount),
    })

    await client
      .patch(currentAccount)
      .setIfMissing({ transactions: [] })
      .insert('after', 'transactions[-1]', [
        {
          _key: txHash,
          _ref: txHash,
          _type: 'reference',
        },
      ])
      .commit()
    return
  }

  const sendTransaction = async (metamask = eth, connectedAccount = currentAccount) => {
    try {
      console.log('ok')

      if (!metamask) return alert('Please install Metamask!')
      const { addressTo, amount } = formData
      console.log(
        '🚀 ~ file: TransactionContext.tsx ~ line 104 ~ sendTransaction ~ formData',
        formData
      )
      const transactionContract = getEthereumContract()
      console.log(
        '🚀 ~ file: TransactionContext.tsx ~ line 109 ~ sendTransaction ~ transactionContract',
        transactionContract
      )

      const parsedAmount = ethers.utils.parseEther(amount)
      await metamask.request({
        method: 'eth_sendTransaction',
        params: [
          {
            from: connectedAccount,
            to: addressTo,
            gas: '0x7EF40',
            value: parsedAmount._hex,
          },
        ],
      })
      console.log(
        '🚀 ~ file: TransactionContext.tsx ~ line 107 ~ sendTransaction ~ parsedAmount',
        parsedAmount
      )

      const transactionHash = await transactionContract.publishTransaction(
        addressTo,
        parsedAmount,
        `Transfering ETH ${parsedAmount} to ${addressTo}`,
        'TRANSFER'
      )
      console.log(
        '🚀 ~ file: TransactionContext.tsx ~ line 125 ~ sendTransaction ~ transactionHash',
        transactionHash
      )
      setLoading(true)
      await transactionHash.wait()
      await saveTransaction(transactionHash.hash, amount, connectedAccount, addressTo)
      setLoading(false)
    } catch (error) {}
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, name: string) => {
    setFormData((prevState: IFormData) => ({ ...prevState, [name]: e.target.value }))
  }

  return (
    <TransactionContext.Provider
      value={{
        currentAccount,
        formData,
        connectWallet,
        sendTransaction,
        handleChange,
      }}
    >
      {children}
    </TransactionContext.Provider>
  )
}
