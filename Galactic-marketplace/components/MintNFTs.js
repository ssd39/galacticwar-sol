import styles from "../styles/Home.module.css";
import { useState } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { css } from "@emotion/react";
import { RingLoader } from "react-spinners";
import dynamic from "next/dynamic";
import { Metaplex, bundlrStorage, walletAdapterIdentity } from "@metaplex-foundation/js";
import NFTCard from "./NFTcard";


const GLBViewer = dynamic(() => import("./Glbviewer"), { ssr: false });

export const MintNFTs = () => {

  const wallet = useWallet();
  const { connection } = useConnection();

  const override = css`
    display: block;
    margin: 0 auto;
    border-color: red;
    width: 20px;
    height: 20px;
  `;

    const [nft, setNft] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const [disableMint, setDisableMint] = useState(false);
    const mapping = {
        xbow: {
            src: "./xbow.glb",
            price: "100",
            currency: "Aureus",
            candymachine: "8W4F3BoW1BK27YjMASVDFZQDSRVLTxtmPxvFWNNCqD9b",
        },
        townhall: {
            src: "./townhall.glb",
            price: "0.01",
            currency: "Solana",
            candymachine: "AzGzVcoo9uwzUUN8H1uVaBB4DCig6Po8SXcFGRN4PiS5",
        },
        miner: {
            src: "./miner.glb",
            price: "0.1",
            currency: "Solana",
            candymachine: "7HnUFoU3j6Dvs6x643SkEE2ZMUvJK1rhnuiLjZe7jSMP",
        },
        tesla: {
            src: "./tesla.glb",
            price: "120",
            currency: "Aureus",
            candymachine: "DyRkBKQTSvUSqEnmLPdTM8gZ67kUFSjEjkrzKpon7S9Z",
        },
        cannon: {
            src: "./cannon.glb",
            price: "130",
            currency: "Aureus",
            candymachine: "6i8ubJ5fSs4BV4vcYe7H7U6NUu74Gj42yZzxfi4rPvSQ",
        },
        archer: {
            src: "./archer.glb",
            price: "70",
            currency: "Aureus",
            candymachine: "FxK3GMbxU74WXKFB82ndx99Mcs4t1pMUYtc8xzmXRtyC",
        },
        robot: {
            src: "./robot.glb",
            price: "90",
            currency: "Aureus",
            candymachine: "12QVJusmwTxe4XwjUPSrJAdRp13g7h9uY4uyuX2mBoeo",
        },
        valkyrie: {
            src: "./valkyrie.glb",
            price: "80",
            currency: "Aureus",
            candymachine: "AuPCGX5iE91aVpwZpCvAiQcH6KEJVs9rHZqotrzaxiQa",
        },
    };

    let walletBalance;
    const [selectedValue, setSelectedValue] = useState("xbow");

    const handleRadioChange = (event) => {
        setSelectedValue(event.target.value);
    };

    // show and do nothing if no wallet is connected
    if (!wallet.connected) {
        return null;
    }

  const onClick = async () => {
    setIsLoading(true);

    const metaplex = Metaplex.make(connection).use(walletAdapterIdentity(wallet)).use(bundlrStorage());
    const candyMachineAddress = new PublicKey(mapping[selectedValue].candymachine);
    let candyMachine = await metaplex.candyMachines().findByAddress({ address: candyMachineAddress })
    const { nft } = await metaplex.candyMachines().mint({
      candyMachine,
      collectionUpdateAuthority: candyMachine.authorityAddress,
    });
 
    setIsLoading(false);
    alert("NFT minted Successfully");
    setNft(nft);
  };

  return (
    <div className={styles.separator}>
      <div>
        <div
          style={{
            display: "flex",
            "flexWrap": "wrap",
            "marginRight": "10px",
            width: "150%",
          }}
        >
          <label>
            <input
              type="radio"
              value="xbow"
              checked={selectedValue === "xbow"}
              onChange={handleRadioChange}
            />
            <div style={{ padding: "5px", fontSize: 22, color:'whitesmoke', fontWeight:'bold' }}e>
              Xbow
            </div>
          </label>
          <label>
            <input
              type="radio"
              value="tesla"
              checked={selectedValue === "tesla"}
              onChange={handleRadioChange}
            />
            <div style={{ padding: "5px", fontSize: 22, color:'whitesmoke', fontWeight:'bold' }}e>
              Tesla
            </div>
          </label>
          <label>
            <input
              type="radio"
              value="cannon"
              checked={selectedValue === "cannon"}
              onChange={handleRadioChange}
            />
            <div  style={{ padding: "5px", fontSize: 22, color:'whitesmoke', fontWeight:'bold' }}e>
              Canon
            </div>
          </label>
          <label>
            <input
              type="radio"
              value="valkyrie"
              checked={selectedValue === "valkyrie"}
              onChange={handleRadioChange}
            />
            <div  style={{ padding: "5px", fontSize: 22, color:'whitesmoke', fontWeight:'bold' }}e>
              Valkyrie
            </div>
          </label>
          <label>
            <input
              type="radio"
              value="robot"
              checked={selectedValue === "robot"}
              onChange={handleRadioChange}
            />
            <div  style={{ padding: "5px", fontSize: 22, color:'whitesmoke', fontWeight:'bold' }}e>
              Robot
            </div>
          </label>
          <label>
            <input
              type="radio"
              value="archer"
              checked={selectedValue === "archer"}
              onChange={handleRadioChange}
            />
            <div  style={{ padding: "5px", fontSize: 22, color:'whitesmoke', fontWeight:'bold' }}e>
              Archer
            </div>
          </label>
          <label>
            <input
              type="radio"
              value="miner"
              checked={selectedValue === "miner"}
              onChange={handleRadioChange}
            />
            <div  style={{ padding: "5px", fontSize: 22, color:'whitesmoke', fontWeight:'bold' }}e>
              Miner
            </div>
          </label>
          <label>
            <input
              type="radio"
              value="townhall"
              checked={selectedValue === "townhall"}
              onChange={handleRadioChange}
              style={{backgroundColor:'black'}}
            />
            <div  style={{ padding: "5px", fontSize: 22, color:'whitesmoke', fontWeight:'bold' }}>
              Townhall
            </div>
          </label>
        </div>
        <div style={{'display': 'flex', marginTop: 25}}>
          <div>
            <GLBViewer src={mapping[selectedValue].src} />
          </div>
          <div>
          <div className={styles.container}>
            <div className={styles.nftForm}></div>
          </div>
          <div className={styles.nftcontainer}>
            <NFTCard
              name={selectedValue}
              price={Number(mapping[selectedValue].price)}
              currency={mapping[selectedValue].currency}
            />
          </div>
          <button
            className={styles.nftcardbutton}
            onClick={onClick}
            disabled={disableMint}
            style={{ fontWeight: 'bold'}}
          >
            Mint
          </button>
          </div>
        </div>
      </div>
      <RingLoader color={"white"}  style={{ position: 'absolute', left: '45%', top: '45%'}} loading={isLoading} />
    </div>
  );
};