import { useEffect } from "react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { PublicKey } from "@solana/web3.js";
import { getAssociatedTokenAddress, getAccount } from "@solana/spl-token";
import bs58 from 'bs58'
import { Metaplex, bundlrStorage, walletAdapterIdentity } from "@metaplex-foundation/js";

function App() {

  const mintAccount = new PublicKey("69qLa4EwR6rfjvzb1qnJcGJRNX1ZXZVUJZtwiYuRnHt") 

  const serverUrl = "https://galacticwar-sol.onrender.com"
  const { setVisible } = useWalletModal()
  const wallet = useWallet();
  const { connection } = useConnection();

  const setAurues = async () => {
    const aureusAssociatedToken = await getAssociatedTokenAddress(
      mintAccount,
      new PublicKey(window.accountId)
    );
    const auruesAccount = await getAccount(connection, aureusAssociatedToken)
    window.aureus =  Number(auruesAccount.amount.toString())/100
  }

  window.fetchWar = async () => {
    let userData = await (await fetch(`${serverUrl}/startFight/${window.accountId}`)).json()
    window.opponent = userData.user
    let oppoBaseData = await (await fetch(`${serverUrl}/buildings/${window.opponent}`)).json()
    window.myGameInstance.SendMessage("WarManager", "onWarData", JSON.stringify(oppoBaseData.data));
  }

  window.openMarketPlace = () => {
    window.open("https://galactic-marketplace-11xg.vercel.app/");
  };

  window.collectwin = async  (troopsDeadCnt, buildingamount, troopsamount) => {
    await (await fetch(`${serverUrl}/reward/${window.accountId}`, {
      method: 'POST',
      headers: {
        'Content-Type' : 'application/json'
      },
      body: JSON.stringify({
        opponent: window.opponent,
        troops: troopsamount,
        buildings: buildingamount
      })
    })).json()
    try{
      await wallet.disconnect()
    }catch(e){
      console.error(e)
    }
    window.myGameInstance.SendMessage("Button_AD", "showData");
  }

  window.savegame = async (str) => {
    try{
      const message = new TextEncoder().encode(str);
      const signature = await wallet.signMessage(message);
      await (await fetch(`${serverUrl}/save/${window.accountId}`, {
        method: 'POST',
        headers: {
          'Content-Type' : 'application/json'
        },
        body: JSON.stringify({
          data: str,
          signature: bs58.encode(signature)
        })
      })).json()
    }catch(e){
      console.error(e)
    }
    window.myGameInstance.SendMessage("syncButton", "onSave");
  }

  window.userdata = async () => {
    let assetsData = await (await fetch(`${serverUrl}/myassets/${window.accountId}`)).json()
    if(assetsData.sucess){
      let assets = assetsData.assets
      for(let asset in assets){
        window[asset] = assets[asset]
      } 
    }
    await setAurues()
    window.myGameInstance.SendMessage("RTS_Camera", "onDone");
  }

  window.connect = async function () {
    setVisible(true)
  }

  const checkUser = async () => {
    try{
      window.accountId = wallet.publicKey.toBase58()
      let assetsData = await (await fetch(`${serverUrl}/myassets/${window.accountId}`)).json()
      if(assetsData.sucess){
        let assets = assetsData.assets
        if(assets.townhall<=0){
          // mint townhall
          const metaplex = Metaplex.make(connection).use(walletAdapterIdentity(wallet)).use(bundlrStorage());
          const candyMachineAddress = new PublicKey("AzGzVcoo9uwzUUN8H1uVaBB4DCig6Po8SXcFGRN4PiS5");
          let candyMachine = await metaplex.candyMachines().findByAddress({ address: candyMachineAddress })
          const { nft } = await metaplex.candyMachines().mint({
            candyMachine,
            collectionUpdateAuthority: candyMachine.authorityAddress,
          });
        }
      }else{
        throw(assetsData.message)
      }
      let data = await (await fetch(`${serverUrl}/startGame/${window.accountId}`)).json()
      if(data.sucess){
        let b_data = await (await fetch(`${serverUrl}/buildings/${window.accountId}`)).json()
        window.building_data = JSON.stringify(b_data.data)
        window.userdata()
      }else{
        throw(data.message)
      }
    }catch(e){
      console.error(e)
      alert("Error while fetching user!")
    }
  }

  useEffect(()=>{
    if (wallet.publicKey) {
        if(!window.myGameInstance){
          wallet.disconnect()
          return
        }
        window.myGameInstance.SendMessage("RTS_Camera", "onConnect");
        checkUser()
    }
  }, [wallet.publicKey, connection])

  useEffect(()=>{
    window.loadUnity()
  },[])

  return (
    <div id="unity-container" class="unity-desktop">
      <canvas id="unity-canvas"></canvas>
      <div id="unity-loading-bar">
        <div id="unity-logo"></div>
        <div id="unity-progress-bar-empty">
          <div id="unity-progress-bar-full"></div>
        </div>
      </div>
      <div id="unity-mobile-warning">
        WebGL builds are not supported on mobile devices.
      </div>
    </div>
  );
}

export default App;
