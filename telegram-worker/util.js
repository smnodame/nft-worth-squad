const getMedian = (array) => {
    array.sort((a, b) => a - b)
    let median
    if (array.length % 2 !== 0) {
        median = array[Math.floor(array.length / 2)]
    } else {
        const mid1 = array[(array.length / 2) -1 ]
        const mid2 = array[array.length / 2 ]
        median = (mid1 + mid2) /2
    }
    return median
}

const numberPrefix = (number) => {
    if (number > 0) {
        return '+'
    } else if (number === 0) {
        return ''
    }

    return '-'
}

module.exports = {
    getMedian,
    numberPrefix
}