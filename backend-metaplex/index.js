require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const { Connection , Keypair, clusterApiUrl, PublicKey, } = require('@solana/web3.js');
const cors = require('cors')
const { Metaplex } = require('@metaplex-foundation/js')
const bs58 = require('bs58')
const nacl = require('tweetnacl')
const { loadDB } = require('./db')
const { mint } = require('./aureus')
const secretkey = require('./keypair.json')

const adminAccount = Keypair.fromSecretKey(Uint8Array.from(secretkey))
const mintAccount =  new PublicKey("69qLa4EwR6rfjvzb1qnJcGJRNX1ZXZVUJZtwiYuRnHt") 

const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
const metaplex = new Metaplex(connection);

const app = express()
app.use(cors())
app.use(bodyParser.json())
const port = process.env.PORT || 4000

const mapping = {
  xbow: { 
    collection_mint: "HfhuF6DZY5ez64j51N5VwStDFs6sEk4wmZG6msz9Mb4L",
    candymachine: "8W4F3BoW1BK27YjMASVDFZQDSRVLTxtmPxvFWNNCqD9b"
  },
  townhall: {
    collection_mint: "4VzKDq7svAok7f71Mzh5xpJcXtkd3Auyo9ZD2GgVxyv5",
    candymachine: "AzGzVcoo9uwzUUN8H1uVaBB4DCig6Po8SXcFGRN4PiS5"
  },
  miner: {
    collection_mint: "ESMrdSBZy8dEwsaodvre64NmsGJgrhyPxaVa2wEuTD9X",
    candymachine: "7HnUFoU3j6Dvs6x643SkEE2ZMUvJK1rhnuiLjZe7jSMP"
  },
  tesla: {
    collection_mint: "AeHxXAnQRXjQz1r7sjX9fiujhofDbrrteM88qy3zaZeN",
    candymachine: "DyRkBKQTSvUSqEnmLPdTM8gZ67kUFSjEjkrzKpon7S9Z"
  },
  cannon: {
    collection_mint: "C3JqXHNm27HTaECZEwws6ATaxLhRNaLacDkQ3WWSJGV7",
    candymachine: "6i8ubJ5fSs4BV4vcYe7H7U6NUu74Gj42yZzxfi4rPvSQ"
  },
  archer: {
    collection_mint: "AY4w5vRt8aPtRpgoAVmhfVTkSwqjebV1mmmGBkA3iBg5",
    candymachine: "FxK3GMbxU74WXKFB82ndx99Mcs4t1pMUYtc8xzmXRtyC"
  },
  robot: {
    collection_mint: "CFLknMKXSwip8DLWVNsiVE19HshQhgjMg2BKTFc3LGdW",
    candymachine: "12QVJusmwTxe4XwjUPSrJAdRp13g7h9uY4uyuX2mBoeo"
  },
  valkyriee: {
    collection_mint: "7z3siG2qim1H5C46EMFjLgL7bk2quVeYNprdQCjjiRGr",
    candymachine: "AuPCGX5iE91aVpwZpCvAiQcH6KEJVs9rHZqotrzaxiQa"
  }
}

const indexMap = {
  0: "miner",
  1: "cannon",
  2: "xbow",
  3: "tesla",
  4: "townhall"
}

const filterAssetByPubKey = async (publicKey) => {
  const nfts = await metaplex.nfts().findAllByOwner({ owner: new PublicKey(publicKey) })
  let res = {
    townhall: 0,
    miner: 0,
    cannon: 0,
    xbow: 0,
    tesla: 0,
    archer: 0 ,
    robot: 0,
    valkyriee: 0
  };
  for(let nft of nfts){
    if(!nft.collection){
      continue
    }
    if(nft.collection.address.toBase58() ==  mapping.townhall.collection_mint){
      res.townhall += 1
    }else if(nft.collection.address.toBase58() ==  mapping.miner.collection_mint){
      res.miner += 1
    }else if(nft.collection.address.toBase58() ==  mapping.xbow.collection_mint){
      res.xbow += 1
    }else if(nft.collection.address.toBase58() ==  mapping.tesla.collection_mint){
      res.tesla += 1
    }else if(nft.collection.address.toBase58() ==  mapping.cannon.collection_mint){
      res.cannon += 1
    }else if(nft.collection.address.toBase58() ==  mapping.archer.collection_mint){
      res.archer += 1
    }else if(nft.collection.address.toBase58() ==  mapping.valkyriee.collection_mint){
      res.valkyriee += 1
    }else if(nft.collection.address.toBase58() ==  mapping.robot.collection_mint){
      res.robot += 1
    }
  }
  return res
}

const filterPlacedAssets =  (buil, assets) => {
  for(let data of buil){
    assets[indexMap[data.buildingIndex]] -= 1
  }
  return assets
}

app.post('/reward/:publicKey', async (req, res) => {
  const publicKey = req.params.publicKey
  const opp = req.body.opponent
  const troops = req.body.troops || 0
  const buildings = req.body.buildings || 0
  if(publicKey && opp){
    await mint(connection, adminAccount, mintAccount,  new PublicKey(publicKey), buildings * 15 )
    await mint(connection, adminAccount, mintAccount,  new PublicKey(opp), troops * 5)
    return res.send({ sucess: true })
  }
  res.send({ status: false, message: "bad payload"})
})

app.get('/startFight/:publicKey', async (req, res) =>{
  const publicKey = req.params.publicKey
  if(publicKey){
    const db = await loadDB()
    let user =  (await db.collection("users").aggregate([
      { $match: { publicKey: { $not: { $eq: publicKey } } } },
      { $sample: { size: 1 } }
    ]).toArray())[0]
    return res.send({ sucess: true, user: user.publicKey })
  }
  return res.send({ status: false, message: "Public key not passed" })
})

app.get('/myassets/:publicKey', async (req,res) => {
  const publicKey = req.params.publicKey
  if(publicKey){
    let assets = await filterAssetByPubKey(publicKey)
    const db = await loadDB()
    let user = await db.collection("users").findOne({ publicKey })
    if(!user){
      user = { publicKey, builDingData: { address: "", buil: [] } }
    }
    let buil = user.builDingData.buil
    assets = filterPlacedAssets(buil, assets)
    return res.send({ sucess: true, assets })
  }
  return res.send({ status: false, message: "Public key not passed" })
})

app.get('/buildings/:publicKey', async (req,res) => {
  const publicKey = req.params.publicKey
  if(publicKey){
    const assets = await filterAssetByPubKey(publicKey)
    const db = await loadDB()
    let user = await db.collection("users").findOne({ publicKey })
    if(!user){
      user = { publicKey, builDingData: { address: "", buil: [] } }
    }
    let buil = user.builDingData.buil
    let count = filterPlacedAssets(buil, assets)
    let newBuil = []
    for(let data of buil){
      if(count[indexMap[data.buildingIndex]]>=0){
        newBuil.push(data)
      }
    }
    return res.send({sucess: true, data: { address: "", buil: newBuil }}) 
  }
  return res.send({ status: false, message: "Public key not passed" })
})

app.get('/startGame/:publicKey', async (req,res) => {
  const publicKey = req.params.publicKey
  if(publicKey){
    const db = await loadDB()
    const user = await db.collection("users").findOne({ publicKey })
    if(!user){
      const assets = await filterAssetByPubKey(publicKey)
      if(assets.townhall<=0){
        return res.send({ sucess: true, message: "Townhall required before starting game" })
      }
      console.log(`New User!: ${publicKey}`)
      let tokenAccount = await mint(connection, adminAccount, mintAccount,  new PublicKey(publicKey), 1000)
      await db.collection("users").insertOne({ publicKey, tokenAccount, builDingData: { address: "", buil: [] } })
    }
    return res.send({ sucess: true })
  }
  res.send({ sucess: false, message: "Public key missing" })
})

app.post("/save/:publicKey", async (req, res) => {
  const signature = req.body.signature
  const data = req.body.data
  const publicKey = req.params.publicKey
  if(signature && publicKey){
    const verified = nacl.sign.detached.verify( new TextEncoder().encode(data), bs58.decode(signature), bs58.decode(publicKey))
    if(!verified){
      console.error(`recived malicious signature from: ${publicKey} `)
      return res.send({ sucess: false})
    }
    const assets = await filterAssetByPubKey(publicKey)
    const buil = JSON.parse(data).buil
    const count = filterPlacedAssets( buil, assets)
    for(let x in count){
      if([count[x]]<0){
        console.error(`${publicKey} sent bad bulding data`)
        return res.send({ sucess: false, message: "bad data payload"})
      }
    }
    const db = await loadDB()
    const user = await db.collection("users").findOne({ publicKey })
    if(user){
      db.collection("users").updateOne( { publicKey }, { $set: { builDingData: { address: "", buil } } } ) 
    }
    return res.send({ sucess: true})
  }
  res.send({status: false, message: "bad payload"})
})

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, async () => {
  console.log(`App listening on port ${port}`)
})
