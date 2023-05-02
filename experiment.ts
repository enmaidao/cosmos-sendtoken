import { Tx } from "cosmjs-types/cosmos/tx/v1beta1/tx"
import  { IndexedTx , SigningStargateClient , StargateClient }  from  "@cosmjs/stargate"
import  { readFile }  from  "fs/promises"
import  { DirectSecp256k1HdWallet , OfflineDirectSigner }  from  "@cosmjs/proto-signing"
import  {
    calculateFee,
  } from "@cosmjs/stargate";
import { parse } from "papaparse";
import fs from "fs"
import csv from "csv-parser"
import iconv from "iconv-lite"



const getAliceSignerFromMnemonic =  async  ( ) :  Promise < OfflineDirectSigner >  =>  { 
    return DirectSecp256k1HdWallet . fromMnemonic ( ( await  readFile ( "./testnet.alice.mnemonic.key" ) ) . toString ( ) ,  { 
        prefix :  "sei" , 
    } ) 
}

const rpc = '';
const runAll = async(): Promise<void> => {
    const client = await StargateClient.connect(rpc)

    // Check the balance of Alice and the Faucet
    const aliceSigner: OfflineDirectSigner = await getAliceSignerFromMnemonic()
    const signingClient = await SigningStargateClient.connectWithSigner(rpc, aliceSigner)
    // const faucet: string = 'sei1vyx48apc22fefr99n4t3sdghtulwywzp6g8g0v'
    const alice: string = 'sei1mrauz7fgzmj42nvfgz0n3pe8eurwnm3w9a7ves'

     // Read CSV file
    const results: any[] = [];
    fs.createReadStream('./test.csv')
        .pipe(iconv.decodeStream('utf-8'))
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', async () => {
        // Loop through each row in the CSV file
        // console.log(results)
        for (const row of results) {
            const faucet = row.public;
            const key = row.private;

            // Check the balance of Alice and the Faucet
            const aliceSigner: OfflineDirectSigner = await getAliceSignerFromMnemonic()
            const signingClient = await SigningStargateClient.connectWithSigner(rpc, aliceSigner)

            console.log("Alice balance before:", await client.getAllBalances(alice))
            console.log("Faucet balance before:", await client.getAllBalances(faucet))
            console.log(alice)
            console.log(faucet)

            const fee = calculateFee(500000, "0.1usei");

            // Execute the sendTokens Tx and store the result
            const result = await signingClient.sendTokens(
            alice,
            faucet,
            [{ denom: 'usei', amount: "100000" }],
            fee
            )

            // Output the result of the Tx
            console.log("Transfer result:", result)
            console.log("Alice balance after:", await client.getAllBalances(alice))
            console.log("Faucet balance after:", await client.getAllBalances(faucet))
        }
    });
}

runAll()
