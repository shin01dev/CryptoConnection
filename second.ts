import * as web3 from "@solana/web3.js"
import * as anchor from '@project-serum/anchor'

export function loadWalletKey(keypairFile: string): web3.Keypair {
    const fs = require("fs");
    const loaded = web3.Keypair.fromSecretKey(
        new Uint8Array(JSON.parse(fs.readFileSync(keypairFile).toString())),
    );
    return loaded;
}

const mpl = require("@metaplex-foundation/mpl-token-metadata");


async function main() {
    console.log("Let's name some tokens");

    const myKeypair = loadWalletKey("7wSpPg7HvYdrs23LiAQNh7VrM11A1xrRw1JWhcE51Xjj.json")
    console.log(myKeypair.publicKey.toBase58())
    const mint = new web3.PublicKey("BkWSdkrLJQ8rWd41itsitq5JRmEbmELHr7Zbx9qhhrLu")


    const seed1 = Buffer.from(anchor.utils.bytes.utf8.encode("metadata"));
    const seed2 = Buffer.from(mpl.PROGRAM_ID.toBytes());
    const seed3 = Buffer.from(mint.toBytes());

    const [metadataPDA, _bump] = web3.PublicKey.findProgramAddressSync([seed1, seed2, seed3], mpl.PROGRAM_ID);


    const accounts = {
        metadata: metadataPDA,
        mint,
        mintAuthority: myKeypair.publicKey,
        payer: myKeypair.publicKey,
        updateAuthority: myKeypair.publicKey,
    }


    const dataV2 = {
        name: "Connection",
        symbol: "$COT",
        uri: "https://jade-equivalent-ox-118.mypinata.cloud/ipfs/QmWLMqS3wdv8v983tU932ETjY6JKvghCnBUuF5DvXDVqua?_gl=1*1kqoe7b*_ga*MTU4MjExNDcxNC4xNjk0OTI5NTk4*_ga_5RMPXG14TE*MTY5NDkyOTU5OC4xLjEuMTY5NDkzMDIwOS42MC4wLjA.",
        // we don't need that
        sellerFeeBasisPoints: 0,
        creators: null,
        collection: null,
        uses: null
    }

    const args = {
        createMetadataAccountArgsV2: {
            data: dataV2,
            isMutable: true
        }
    };

    const ix = mpl.createCreateMetadataAccountV2Instruction(accounts, args);
    const tx = new web3.Transaction();
    tx.add(ix);
    const connection = new web3.Connection("https://api.mainnet.solana.com");
    const txid = await web3.sendAndConfirmTransaction(connection, tx, [myKeypair]);
    console.log(txid);



}

main()