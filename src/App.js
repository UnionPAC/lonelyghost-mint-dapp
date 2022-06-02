import React, { useState, useEffect, Fragment } from "react";
import { ethers } from "ethers";
import LonelyGhosts from "./utils/LonelyGhosts.json";
import { networks } from "./utils/networks";
import hidden from "./imgs/hidden.png";
import LoadingSpinner from "./Components/loading";
import "./App.css";

function App() {
  // Constants
  const CONTRACT_ADDRESS = "0x276Eb5caFC9CDB664A9a9D0032EAdd75059fE20d";

  const MAX_SUPPLY = 1000;
  const TWITTER_HANDLE = "unionpac_";
  const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

  // Elements
  const mintPopup = document.querySelector(".mint-popup");

  // State
  const [network, setNetwork] = useState("");
  const [currentAccount, setCurrentAccount] = useState(null);
  const [price, setPrice] = useState(null);
  const [amountMinted, setAmountMinted] = useState("");
  const [loading, setLoading] = useState(false);
  const [mintPaused, setMintPaused] = useState();

  const newMintTokenId = +amountMinted + 1;

  const checkIfWalletIsConnected = async () => {
    const { ethereum } = window;
    if (!ethereum) {
      console.log("Please get MetaMask!");
      return;
    } else {
      console.log("We have the Ethereum object");
    }

    const accounts = await ethereum.request({ method: "eth_accounts" });

    if (accounts.length !== 0) {
      const account = accounts[0];
      setCurrentAccount(account);
      console.log("Connected Account:", account);
    } else {
      console.log("No authorized account found");
    }

    const chainId = await ethereum.request({ method: "eth_chainId" });
    setNetwork(networks[chainId]);
    console.log(networks[chainId]);

    // reload page on network change
    ethereum.on("chainChanged", handleChainChanged);
    function handleChainChanged(_chainId) {
      window.location.reload();
    }
  };

  const connectWallet = async () => {
    const { ethereum } = window;
    if (!ethereum) {
      alert("Please install MetaMask!");
    }

    const accounts = await ethereum.request({ method: "eth_requestAccounts" });
    const account = accounts[0];
    setCurrentAccount(account);
    console.log("Connected with account:", account);
  };

  const switchNetwork = async () => {
    const { ethereum } = window;
    if (ethereum) {
      try {
        await ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0x89" }],
        });
      } catch (error) {
        // if user doesn't have the Polygon tesnet added to their networks - we'll add it!
        if (error.code === 4902) {
          try {
            await window.ethereum.request({
              method: "wallet_addEthereumChain",
              params: [
                {
                  chainId: "0x89",
                  chainName: "Polygon Mainnet",
                  rpcUrls: ["https://rpc-mainnet.matic.network"],
                  nativeCurrency: {
                    name: "Polygon Matic",
                    symbol: "MATIC",
                    decimals: 18,
                  },
                  blockExplorerUrls: ["https://polygonscan.com/"],
                },
              ],
            });
          } catch (error) {
            console.log(error);
          }
        }
        console.log(error);
      }
    } else {
      alert(
        "MetaMask is not installed. Please install it to use this app: https://metamask.io/download.html"
      );
    }
  };

  const getPrice = async () => {
    const { ethereum } = window;
    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        LonelyGhosts.abi,
        signer
      );

      let tx = await contract.getPrice();
      let price = ethers.utils.formatEther(tx);
      setPrice(price);
      console.log(price);
    }
  };

  const getAmountMinted = async () => {
    const { ethereum } = window;
    if (ethereum) {
      try {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(
          CONTRACT_ADDRESS,
          LonelyGhosts.abi,
          signer
        );

        let tx = await contract.getAmountMinted();
        const amountMinted = tx.toString();
        setAmountMinted(amountMinted);
        console.log(amountMinted);
      } catch (error) {
        console.log(error);
      }
    }
  };

  const getMintState = async () => {
    const { ethereum } = window;
    if (ethereum) {
      try {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(
          CONTRACT_ADDRESS,
          LonelyGhosts.abi,
          signer
        );

        let tx = await contract.paused();
        setMintPaused(tx);
        console.log(mintPaused);
      } catch (error) {
        console.log(error);
      }
    }
  };

  const toggleModal = () => {
    mintPopup.classList.toggle("show-popup");
  };

  const mintGhost = async () => {
    const { ethereum } = window;
    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        LonelyGhosts.abi,
        signer
      );

      setLoading(true);
      let tx = await contract.mintGhost({
        gasLimit: 300000,
        value: ethers.utils.parseEther(price),
      });
      console.log("Mining ...");
      await tx.wait();
      setLoading(false);
      console.log("Mined", tx.hash);

      getAmountMinted();
      toggleModal();
    }
  };

  // Render Methods
  const renderUserConnected = () => {
    if (network !== "Polygon Mainnet") {
      return (
        <div className="text-center">
          <h3 className="italic">Please switch to the Polygon Mainnet!</h3>
          <button onClick={switchNetwork} className="btn m-5">
            Switch Network
          </button>
        </div>
      );
    }
    return (
      <Fragment>
        {mintPaused === true ? (
          <Fragment>
            <h3 className="p-4 italic">
              The contract is currently paused for minting
            </h3>
          </Fragment>
        ) : (
          <Fragment>
            <button onClick={mintGhost} className="btn">
              Mint
            </button>
          </Fragment>
        )}

        <div className="mint-popup">
          <div className="mint-popup-content">
            <span onClick={toggleModal} className="close-button">
              <i className="fa-solid fa-x"></i>
            </span>
            <h1 className="text-2xl font-bold p-3">Congrats! 🎉</h1>
            <p className="text-md">
              Congratulations on your new Lonely Ghost NFT, welcome to the Fam
              ... we're happy to have you on board! Big thanks to you for
              supporting this project and its creator!
            </p>
            <br></br>
            <p className="italic text-xsm">
              Sometimes OpenSea is a bit slow, so your NFT may take a few
              minutes to load
            </p>
            <a
              target="_blank"
              rel="noreferrer"
              href={`https://opensea.io/assets/matic/${CONTRACT_ADDRESS}/${amountMinted}`}
            >
              <button className="btn normal-case m-10">
                View NFT on OpenSea
              </button>
            </a>
            <p className="text-xl">See ya around 👋</p>
          </div>
        </div>
      </Fragment>
    );
  };

  const renderUserNotConnected = () => (
    <Fragment>
      <button onClick={connectWallet} className="btn">
        Connect Wallet
      </button>
    </Fragment>
  );

  // Use Effects
  useEffect(() => {
    checkIfWalletIsConnected();
    getPrice();
    getAmountMinted();
    getMintState();
    // eslint-disable-next-line
  }, []);

  return (
    <div className="App live-gradient">
      <div className="main-card">
        <h1 className="pt-6 pb-10 px-10 text-5xl font-bold title">
          Lonely Ghosts
        </h1>
        <h2 className="text-2xl py-5 numbers">
          {amountMinted} / {MAX_SUPPLY}
        </h2>
        <h4 className="p-3 text-lg">Mint Price: {price} MATIC</h4>
        <div
          style={{
            minHeight: "300px",
            display: "flex",
            alignContent: "center",
            justifyContent: "center",
          }}
        >
          {loading ? (
            <LoadingSpinner type={"spin"} color="#333" />
          ) : (
            <Fragment>
              <img
                src={hidden}
                style={{ height: "250px" }}
                alt="Hidden Lonely Ghost"
                className="m-5 rounded-md"
              />
            </Fragment>
          )}
        </div>
        {currentAccount ? renderUserConnected() : renderUserNotConnected()}
        <a
          href="https://testnets.opensea.io/collection/lonelyghosts-v4"
          target="_blank"
          rel="noreferrer"
        >
          <button className="btn">View on OpenSea</button>
        </a>
        <p className=""> </p>
        <a
          className="mt-5 text-sm italic text-slate-500"
          href={TWITTER_LINK}
          target="_blank"
          rel="noreferrer"
        >{`An NFT Collection by @${TWITTER_HANDLE}`}</a>
      </div>
    </div>
  );
}

export default App;
