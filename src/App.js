import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import './App.css';
import contract from './utils/WavePortal.json';

const App = () => {
  const [currentAccount, setCurrentAccount] = useState("");
  const [waveCount, setWaveCount] = useState("");

  const [allWaves, setAllWaves] = useState([]);
  const contractAddress = '0x22AE431B8f8bB99ceC39b8f02B3916bFF01128a9';

  const [isGetWaves, setGetWaves] = useState(false);

  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("Make sure you have metamask!");
        return;
      } else {
        console.log("We have the ethereum object", ethereum);
      }

      const accounts = await ethereum.request({ method: 'eth_accounts' });

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        setCurrentAccount(account);
        if (!isGetWaves) {
          getAllWaves();
          setGetWaves(true);
        }
      } else {
        console.log("No authorized account found")
      }
    } catch (error) {
      console.log(error);
    }
  }

  const getAllWaves = async () => {
    const { ethereum } = window;

    try {
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contract.abi, signer);
        const waves = await wavePortalContract.getAllWaves();

        const wavesCleaned = waves.map(wave => {
          return {
            address: wave.waver,
            timestamp: new Date(wave.timestamp * 1000),
            message: wave.message,
          };
        });

        setAllWaves(wavesCleaned);
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  /**
  * Implement your connectWallet method here
  */
  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error)
    }
  }

  const wave = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contract.abi, signer);

        let count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());

        /*
        * Execute the actual wave from your smart contract
        */
        const waveTxn = await wavePortalContract.wave("this is a message", { gasLimit: 300000 });
        console.log("Mining...", waveTxn.hash);

        //setLoading(true);

        await waveTxn.wait();

        console.log("Mined -- ", waveTxn.hash);
        setGetWaves(false);

        count = await wavePortalContract.getTotalWaves();
        setWaveCount(count.toNumber());
        console.log("Retrieved total wave count...", count.toNumber());
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    let wavePortalContract;

    const onNewWave = (from, timestamp, message) => {
      console.log('NewWave', from, timestamp, message);
      setAllWaves(prevState => [
        ...prevState,
        {
          address: from,
          timestamp: new Date(timestamp * 1000),
          message: message,
        },
      ]);
    };

    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      wavePortalContract = new ethers.Contract(contractAddress, contract.abi, signer);
      wavePortalContract.on('NewWave', onNewWave);
    }

    return () => {
      if (wavePortalContract) {
        wavePortalContract.off('NewWave', onNewWave);
      }
    };
  }, []);

  return (
    <div className="mainContainer">
      <div className="dataContainer">
        <div className="header-container">
          <div className="header">
            <span role="img" aria-label="hey">👋 Hey there!</span>
          </div>

          <div className="bio">
            I am Mehmet, and I am a Technical Product Manager <a href="https://leanscale.com">@Leanscale</a>
            {waveCount && (
              <p>I received <span className="wave-text">{waveCount}</span> until now.</p>
            )}
          </div>
          <button className="waveButton" onClick={wave}>
            Wave at Me
          </button>
        </div>


        {/*
        * If there is no currentAccount render this button
        */}
        {!currentAccount && (
          <button className="waveButton" onClick={connectWallet}>
            Connect Wallet
          </button>
        )}

        {allWaves.map((wave, index) => {
          return (
            <div key={index} style={{ backgroundColor: "OldLace", marginTop: "16px", padding: "8px" }}>
              <div>Address: {wave.address}</div>
              <div>Time: {wave.timestamp.toString()}</div>
              <div>Message: {wave.message}</div>
            </div>)
        })}

      </div>
    </div>
  );
}

export default App







//<span role="img" aria-label="hey">👋 Hey there!</span>