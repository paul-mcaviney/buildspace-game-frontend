import React, { useEffect, useState } from "react";
import "./SelectCharacter.css";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, transformCharacterData } from "../../constants";
import blockchainGame from "../../utils/BlockchainGame.json";


const SelectCharacter = ({ setCharacterNFT }) => {
  const [characters, setCharacters] = useState([]);
  const [gameContract, setGameContract] = useState(null);

  useEffect(() => {
    const { ethereum } = window;

    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const gameContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        blockchainGame.abi,
        signer
      );

      setGameContract(gameContract);
    } else {
      console.log("Ethereum Object Not Found");
    }
  }, []);


  useEffect(() => {
    const getCharacters = async () => {
      try {
        console.log("Getting contract characters to mint");

        // Call contract to get all mint-able characters 
        const charactersTxn = await gameContract.getAllDefaultCharacters();
        console.log("charactersTxn:", charactersTxn);

        // Go through characters and transform the data 
        const characters = charactersTxn.map((characterData) =>
        transformCharacterData(characterData));

        // set all mint-able characters in state 
        setCharacters(characters);
      } catch (error) {
        console.log("Something went wrong fetching characters:", error);
      }
    };

    // Callback method that fires when event is received
    const onCharacterMint = async (sender, tokenId, characterIndex) => {
      console.log(`CharacterNFTMinted - sender: ${sender} tokenId: ${tokenId.toNumber()} characterIndex: ${characterIndex.toNumber()}`);

      // Fetch metadata from contract and set it in state to move onto the arena
      if (gameContract) {
        const characterNFT = await gameContract.checkIfUserHasNFT();
        console.log("CharacterNFT: ", characterNFT);
        setCharacterNFT(transformCharacterData(characterNFT));
      }
    };

    if (gameContract) {
      getCharacters();

      //NFT minted listener
      gameContract.on("CharacterNFTMinted", onCharacterMint);
    }

    return () => {
      if (gameContract) {
        gameContract.off("CharacterNFTMinted", onCharacterMint);
      }
    };
  }, [gameContract]);


  // Actions
  const mintCharacterNFTAction = (characterId) => async () => {
    try {
      if (gameContract) {
        console.log("Minting Character in progress...");
        const mintTxn = await gameContract.mintCharacterNFT(characterId);
        await mintTxn.wait();
        console.log("mintTxn:", mintTxn);
        // alert(`Your NFT is all done -- see it here: https://testnets.opensea.io/assets/${gameContract}/${tokenId.toNumber()}`);
      }
    } catch (error) {
      console.warn("MintCharacterAction Error:", error);
    }
  };


  // Render Functions
  const renderCharacters = () => 
    characters.map((character, index) => (
      <div className="character-item" key={character.name}>
        <div className="name-container">
          <p>{character.name}</p>
        </div>
        <img src={character.imageURI} alt={character.name} />
        <button
          type="button"
          className="character-mint-button"
          onClick={mintCharacterNFTAction(index)}
        >{`Mint ${character.name}`}</button>
      </div>
    ));
  
  

  return (
    <div className="select-character-container">
      <h2>Mint You Hero. Choose Wisely.</h2>
      
      {characters.length > 0 && (
        <div className="character-grid">{renderCharacters()}</div>
      )}
    </div>
  );
};

export default SelectCharacter;