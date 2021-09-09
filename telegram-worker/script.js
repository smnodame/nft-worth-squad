const { getMedian, numberPrefix } = require('./util')
const fs = require('fs')
const { exec } = require('child_process')

// TODO need to fetch the current from some where
const BNB_PRICE = 418
const AVG_AMOUNT = 20
const CHEAPEST_AMOUNT = 3

process.env.TZ = 'UTC'

const generateStat = (content) => {
    const result = content.data.list.reduce((o, n) => {
        const prices = o[n.name]?.prices || []
        const ids = o[n.name]?.ids || []
        const count = o[n.name]?.count || 0
        const sum = o[n.name]?.sum || 0
        const price = parseFloat(n.price) / 1000000000000000000
    
        const high = o[n.name]?.high || 0
        const low = o[n.name]?.low || 9999999999
        
        if (n.symbol !== 'BNB') {
            return o
        }
    
        return {
            ...o,
            [n.name]: {
                prices: [...prices, price].sort((a, b) => a-b),
                ids: [...ids, n.token_id],
                name: n.name,
                count: count + 1,
                sum: sum + price,
                high: price > high ? price.toFixed(4) : high,
                low: price < low ? price.toFixed(4) : low,
            }
        }
    }, {})
    
    return Object.entries(result).map(([key, v]) => {
        const prices = v.prices.filter((price, i) => {
            return i < AVG_AMOUNT
        })
        
        const sum = prices.reduce((o, price) => {
            return o + price
        }, 0)
    
        return {
            ...v,
            avg: (sum / prices.length),
            prices: prices,
            median: getMedian(v.prices),
        }
    }).reduce((o, n) => {
        return {
            ...o,
            [n.name]: n
        }
    }, {})
}

const generateReport = (todayResult, ytdResult) => {
    return Object.values(todayResult).map((v) => {
        const priceChanged = v.avg - ytdResult[v.name]?.avg
        const countChanged = v.count - ytdResult[v.name]?.count
        const lowChanged = v.low - (ytdResult[v.name]?.low || 0)

        return {
            name: v.name,
            'count (changed)': `${v.count} (${countChanged == 0 ? '0' : numberPrefix(countChanged) + countChanged})`,
            sort: v.count,
            'lowest (bnb)': `${v.low} (${lowChanged == 0 ? '0' : numberPrefix(lowChanged) + lowChanged.toFixed(4)})`,
            'highest (bnb)': v.high,
            [`${CHEAPEST_AMOUNT} cheapest`]: v.prices.sort((a, b) => a.sort-b.sort).filter((v, i) => i < CHEAPEST_AMOUNT).join(', '),
            'median (bnb)': v.median.toFixed(4),
            'avg (by most 20 cheapest price)': v.avg.toFixed(4),
            [`$ (1bnb=${BNB_PRICE}$)`]: (v.avg * BNB_PRICE).toFixed(4),
            'changed (bnb)': priceChanged.toFixed(4) === '-0.00' || priceChanged.toFixed(4) === '0.00' ? '' : numberPrefix(priceChanged) + priceChanged.toFixed(4)
        }
    }).sort((a, b) => a.sort-b.sort).map((v) => {
        delete v.sort
        return v
    })
}

function main() {
    const files = fs.readdirSync('../data')

    const datetimes = files.map((file) => {
        const datetimeStr = file.replace('pancakenft-', '').replace('.json', '')
        return new Date(datetimeStr)
    }).sort((a, b) => a.sort-b.sort)

    const yesterdayDate = new Date(new Date().getTime() - (24 * 60 * 60 * 1000))
    
    const beforeYesterdayFiles = datetimes.filter((datetime) => {
        return datetime < yesterdayDate
    })

    const yesterdayDatetime = beforeYesterdayFiles[beforeYesterdayFiles.length - 1]
    const todayDatetime = datetimes[datetimes.length - 1]

    const yesterdayData = fs.readFileSync(`../data/pancakenft-${yesterdayDatetime.toISOString()}.json`);
    const todayData = fs.readFileSync(`../data/pancakenft-${todayDatetime.toISOString()}.json`);
    
    const todayStat = generateStat(JSON.parse(todayData))
    const ytdStat = generateStat(JSON.parse(yesterdayData))

    const report = generateReport(todayStat, ytdStat)
    console.log('')
    console.log('')
    console.log('')
    console.log('Pancake NFTs on Treasureland')
    console.log('------------------------')
    console.log(`From ${yesterdayDatetime}`)
    console.log(`To ${todayDatetime}`)
    console.table(report)
    console.log('')
    console.log('')
    console.log('')
}


if (require.main === module) {
    main()
}