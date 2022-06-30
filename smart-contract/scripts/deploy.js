const main = async () => {
  const transactionFactory = await hre.ethers.getContractFactory('Transaction')
  const transactionContract = await transactionFactory.deploy()

  await transactionContract.deployed()

  console.log('Transaction deployed to:', transactionContract.address);
}

;(async () => {
  try {
    await main()
  } catch (error) {
    console.error(error.message);
    process.exit(1)
  }
})()