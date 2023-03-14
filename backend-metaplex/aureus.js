const { getOrCreateAssociatedTokenAccount, mintTo } = require('@solana/spl-token')
const baseAmount = 100

const mint = async (connection, adminAccount, mintAccount, reciverPubKey, amount) => {
    const tokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        adminAccount,
        mintAccount,
        reciverPubKey
    )
    const transactionId = await mintTo(
        connection,
        adminAccount,
        mintAccount,
        tokenAccount.address,
        adminAccount,
        amount * baseAmount
    )
    console.log(`Mint Transaction: ${transactionId}`)
    const txDetails = await connection.getTransaction(transactionId, 'confirmed');
    if(!txDetails){
        throw(`Not able to mint aureus for ${reciverPubKey.toBase58()}`)
    }
    return tokenAccount.address.toBase58()
}

module.exports = { mint }