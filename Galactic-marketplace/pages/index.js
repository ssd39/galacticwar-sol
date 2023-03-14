import styles from "../styles/Home.module.css";
import WalletContextProvider from "../components/WalletContextProvider";
import { MintNFTs } from "../components/MintNFTs";
import "@solana/wallet-adapter-react-ui/styles.css";
import dynamic from "next/dynamic";

export default function Home() {
  const ButtonWrapper = dynamic(() =>
    import("@solana/wallet-adapter-react-ui").then(
      (mod) => mod.WalletMultiButton
    )
  );

  return (
    <div>
      <WalletContextProvider>
        <div className={styles.App}>
          <ButtonWrapper />
          <MintNFTs />{" "}
        </div>
      </WalletContextProvider>
    </div>
  );
}
