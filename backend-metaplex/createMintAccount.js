require('dotenv').config()
const { Connection , Keypair, clusterApiUrl, PublicKey, sendAndConfirmTransaction, Transaction } = require('@solana/web3.js');
const { createMint } = require('@solana/spl-token')
const { createCreateMetadataAccountInstruction   } = require('@metaplex-foundation/mpl-token-metadata')
const { Web3Storage,  getFilesFromPath } = require('web3.storage')
const fs = require('fs');

const secretkey = require('./keypair.json')

const adminAccount = Keypair.fromSecretKey(Uint8Array.from(secretkey))
const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

const main = async () => {
    const mint = await createMint(
        connection,
        adminAccount,
        adminAccount.publicKey,
        adminAccount.publicKey,
        2
    );
    
    fs.writeFileSync("./tokenData.json", JSON.stringify({
        "name": "Aureus",
        "symbol": "AU",
        "description": "In game currency of galacticwar.",
        "image": "https://galacticwar.live/logo.jpg"
      }))
    const storage = new Web3Storage({ token: process.env.WEB3_STORAGE_TOKEN })


    const cid = await storage.put(await getFilesFromPath("./tokenData.json",))

    const programId = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s');
    const seeds = [Buffer.from('metadata', 'utf-8'),programId.toBuffer(),  mint.toBuffer()];
    const pda = PublicKey.findProgramAddressSync(seeds, programId)[0];

    const metadata = createCreateMetadataAccountInstruction({
        metadata: pda,
        mint: new PublicKey(mint.toBase58()),
        mintAuthority: adminAccount.publicKey,
        payer: adminAccount.publicKey,
        updateAuthority: adminAccount.publicKey
    },{
        createMetadataAccountArgs:{
            data:    { 
              name: "Aureus",
              symbol: "AU",
              uri: `https://ipfs.io/ipfs/${cid}/tokenData.json`,
              sellerFeeBasisPoints: null,
              creators: null
            },
            isMutable: false
        }
    })
    let allocateTransaction = new Transaction({
        feePayer: adminAccount.publicKey,
    });
    allocateTransaction.add(metadata)

    await sendAndConfirmTransaction(connection, allocateTransaction, [
        adminAccount
    ]);
    console.log("Mint Account:", mint.toBase58())
}

main()