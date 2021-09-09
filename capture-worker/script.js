import axios from 'axios'
import fs from 'fs'
import Web3 from 'web3'

import { PANCAKE_BUNNY_CONTRACT_ADDRESS, API_URL } from './lib/constants.js'
import { pbTokenABI } from './lib/pbTokenABI.js'
import { bunnies } from './lib/bunnies.js'

const nonCheckSummedAddress = "0xdf7952b35f24acf7fc0487d01c8d5690a60dba07"
const chainId = 56
const limit = 1000

process.env.TZ = 'UTC'

// NOTE to run node --experimental-modules script.js
const main = async () => {
    const web3 = new Web3(new Web3.providers.HttpProvider('https://bsc-dataseed1.ninicoin.io/56'))

    const contract = new web3.eth.Contract(pbTokenABI, PANCAKE_BUNNY_CONTRACT_ADDRESS)

    for(let bunny in bunnies) {
        console.log(bunny)

        let totalBurned = await contract.methods.bunnyBurnCount(bunnies[bunny].id).call()
        let totalMint = await contract.methods.bunnyCount(bunnies[bunny].id).call()
        console.log(totalBurned)
        console.log(totalMint)
    }
    // TODO: Build stats from orders found and quantity minted

    // TODO: Recursion for multiple pages
    const { data } = await axios.get(`${API_URL}/nft/items?chain_id=${chainId}&page_no=1&page_size=${limit}&contract=${nonCheckSummedAddress}&sort_type=1`)
    fs.writeFile(`../data/pancakenft-${new Date().toISOString()}.json`, JSON.stringify(data), (err) => {
        if (err)  return console.log(err)

        console.log("The file was saved!")
    })
    // TODO: Fetch transactions based on block number and query each
    // NOTE: This takes time, but once we build historical, the challenge is it's token IDS from the orders
    // so it kind of needs to be run regularly (or at least once a day) to keep up to date
    // NOTE: The most important thing outside of current orders, is actually sold products, as that gives a much better
    // sense of the market.
    // {api_url}/nft/history?chain_id=56&contract={contract}&token_id={token_id}
}

main()