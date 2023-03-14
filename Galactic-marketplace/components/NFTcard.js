import React from "react";
import PropTypes from "prop-types";
import styles from "../styles/Home.module.css";

const NFTCard = ({ name, price, currency }) => {
  return (
    <div className={styles.nftcard}>
      <div className={styles.nftcardheader}>
        <h1 style={{ color: "black", fontWeight: 'bold' }}> {name} </h1>
      </div>
      <div className={styles.nftcardbody}>
        <h3 style={{ color: "black", fontWeight:'bolder' }}>
          {price} {currency}
        </h3>
      </div>
      <div className={styles.nftcardfooter}></div>
    </div>
  );
};

NFTCard.propTypes = {
  name: PropTypes.string.isRequired,
  price: PropTypes.number.isRequired,
};

export default NFTCard;
