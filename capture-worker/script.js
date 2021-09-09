const axios = require('axios')
const fs = require('fs')

process.env.TZ = 'UTC'

const main = async () => {
    const { data } = await axios.get('https://api.treasureland.market/v2/v1/nft/items?chain_id=0&page_no=1&page_size=20&contract=0xdf7952b35f24acf7fc0487d01c8d5690a60dba07&sort_type=1&pros=')
    fs.writeFile(`../data/pancakenft-${new Date().toISOString()}.json`, JSON.stringify(data), (err) => {
        if (err)  return console.log(err)

        console.log("The file was saved!")
    })
}

main()