const { mint } = require('./aureus')
const { Connection , Keypair, clusterApiUrl, PublicKey } = require('@solana/web3.js');
const secretkey = require('./keypair.json')

const adminAccount = Keypair.fromSecretKey(Uint8Array.from(secretkey))
const mintAccount =  new PublicKey("69qLa4EwR6rfjvzb1qnJcGJRNX1ZXZVUJZtwiYuRnHt") 

const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

mint(connection, adminAccount, mintAccount, new PublicKey(process.argv[2]))