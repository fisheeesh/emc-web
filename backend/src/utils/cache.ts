import { redis } from "../config/redis-client"

export const getOrSetCache = async (key: any, cb: any) => {
    try {
        //* Check if there is cachedData in redis with key
        const cachedData = await redis.get(key)

        if (cachedData) {
            console.log('Cahche hit')
            //* If it is, return it
            return JSON.parse(cachedData)
        }

        console.log('Cache miss')
        //* If not, go and grab data from db
        const freshData = await cb()
        //* And store it in redis
        await redis.setex(key, 3600, JSON.stringify(freshData))

        return freshData
    } catch (error) {
        console.log(error)
    }
}

export const invalidateCache = async (pattern: string) => {
    try {
        const stream = redis.scanStream({
            match: pattern,
            count: 100
        })

        const pipeline = redis.pipeline()
        let totalKeys = 0

        stream.on('data', (keys: string[]) => {
            if (keys.length > 0) {
                pipeline.del(keys)
                totalKeys++
            }
        })

        await new Promise<void>((resolve, reject) => {
            stream.on("end", async () => {
                try {
                    if (totalKeys > 0) {
                        await pipeline.exec()
                        console.log(`Invalidated ${totalKeys} keys`)
                    }

                    resolve()
                } catch (error) {
                    console.log(error)
                    reject(error)
                }
            })

            stream.on("error", (error) => {
                reject(error)
            })
        })
    } catch (error) {
        console.log('Cache Invalidation Error: ', error)
    }
}