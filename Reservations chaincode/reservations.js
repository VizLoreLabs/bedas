
'use strict'
const shim = require('fabric-shim')
const util = require('util')

// ===============================================
// Chaincode name:[Reservations.js]
// Asset key:[id]
// Asset values:[Time,OrgId,UserId,DoctorId,ReservationTime]
// ===============================================

let Chaincode = class {
    async Init(stub) {
        let ret = stub.getFunctionAndParameters()
        console.info(ret)
        console.info('=========== Instantiated Chaincode ===========')
        return shim.success()
    }

    async Invoke(stub) {
        console.info('Transaction ID: ' + stub.getTxID())
        console.info(util.format('Args: %j', stub.getArgs()))

        let ret = stub.getFunctionAndParameters()
        console.info(ret)

        let method = this[ret.fcn]
        if (!method) {
            console.log('No function for name:' + ret.fcn + ' found')
            throw new Error('Received unknown function ' + ret.fcn + ' invocation')
        }
        try {
            let payload = await method(stub, ret.params, this)
            return shim.success(payload)
        } catch (err) {
            console.log(err)
            return shim.error(err)
        }
    }

    // ===============================================
    // confirmReservation - insert a new reservation to the ledger
    // ===============================================
    async confirmReservation(stub, args, thisClass) {
        if (args.length != 6) { 
			throw new Error('Incorrect number of arguments. Expecting 6.')
		}
		let id = args[0] 
		let assetState = await stub.getState(id)
		if (assetState.toString()) {
			throw new Error('This asset already exists: ' + id)
		}
		console.info('--- start insertAsset ---')
		let Time = parseInt(args[1])
		let OrgId = args[2] 
		let UserId = args[3] 
		let DoctorId = args[4] 
		let ReservationTime = parseInt(args[5])

		if (id.length <= 0){ 
			return shim.error('Argument id must be a non-empty string') 
		}
		if (typeof Time !== "number") {
			return shim.error('Time is not a number');
		}
		if (OrgId.length <= 0) { 
			throw new Error('Argument OrgId must be a non-empty string') 
		}
		if (UserId.length <= 0) { 
			throw new Error('Argument UserId must be a non-empty string') 
		}
		if (DoctorId.length <= 0) { 
			throw new Error('Argument DoctorId must be a non-empty string') 
		}
		if (typeof ReservationTime !== "number") {
			return shim.error('ReservationTime is not a number');
		}

		let asset = {}
		asset.docType = "reservation"
		asset.id = id
		asset.Time = Time
		asset.OrgId = OrgId
		asset.UserId = UserId
		asset.DoctorId = DoctorId
		asset.ReservationTime = ReservationTime
		asset.Canceled = false 
		asset.Rejected = false 

		await stub.putState(id, Buffer.from(JSON.stringify(asset)))
		let indexName0 = "OrgId~id"
		let OrgIdIdIndexKey = await stub.createCompositeKey(indexName0, [asset.OrgId, asset.id])
		console.info(OrgIdIdIndexKey)
		await stub.putState(OrgIdIdIndexKey, Buffer.from(''))
		let indexName1 = "UserId~id"
		let UserIdIdIndexKey = await stub.createCompositeKey(indexName1, [asset.UserId, asset.id])
		console.info(UserIdIdIndexKey)
		await stub.putState(UserIdIdIndexKey, Buffer.from(''))
		let indexName2 = "DoctorId~id"
		let DoctorIdIdIndexKey = await stub.createCompositeKey(indexName2, [asset.DoctorId, asset.id])
		console.info(DoctorIdIdIndexKey)
		await stub.putState(DoctorIdIdIndexKey, Buffer.from(''))
    }

    // ===============================================
    // readReservationById- read a reservation from chaincode state by key
    // ===============================================
    async readReservationById(stub, args, thisClass) {
        if (args.length != 1) {
            throw new Error('Incorrect number of arguments. Expecting id of the asset to query.')
        }
        let key = args[0]
        if (!key) {
            throw new Error(' Asset key must not be empty.')
        }

        let assetAsBytes = await stub.getState(key)
        if (!assetAsBytes.toString()) {
            let jsonResp = {}
            jsonResp.Error = 'Asset does not exist: ' + key
            throw new Error(JSON.stringify(jsonResp))
        }
        console.info('=======================================')
        console.log(assetAsBytes.toString())
        console.info('=======================================')
        return assetAsBytes
    }
  
    // ===========================================================
    // Update Asset Attributes - each method updates an asset for a certain field
    // ===========================================================
	async updateAssetTime(stub, args, thisClass) {
		if (args.length < 2) {
			throw new Error('Incorrect number of arguments. Expecting key and new value.')
		}
		let key = args[0]
		let newValue = args[1]
		console.info('- Start updating asset - ')
		let assetAsBytes = await stub.getState(key)
		if (!assetAsBytes || !assetAsBytes.toString()) {
			throw new Error('Asset does not exist')
		}
		let asset = {}
		try {
			asset = JSON.parse(assetAsBytes.toString())
		} catch (err) {
			let jsonResp = {}
			jsonResp.error = 'Failed to decode JSON of: ' + key
			throw new Error(jsonResp)
		}
		console.info(asset)
		asset.Time = newValue
		let assetJSONasBytes = Buffer.from(JSON.stringify(asset))
		await stub.putState(key, assetJSONasBytes)
		console.info('- End update asset (success) -')
	}

	async updateAssetOrgId(stub, args, thisClass) {
		if (args.length < 2) {
			throw new Error('Incorrect number of arguments. Expecting key and new value.')
		}
		let key = args[0]
		let newValue = args[1]
		console.info('- Start updating asset - ')
		let assetAsBytes = await stub.getState(key)
		if (!assetAsBytes || !assetAsBytes.toString()) {
			throw new Error('Asset does not exist')
		}
		let asset = {}
		try {
			asset = JSON.parse(assetAsBytes.toString())
		} catch (err) {
			let jsonResp = {}
			jsonResp.error = 'Failed to decode JSON of: ' + key
			throw new Error(jsonResp)
		}
		console.info(asset)
		asset.OrgId = newValue
		let assetJSONasBytes = Buffer.from(JSON.stringify(asset))
		await stub.putState(key, assetJSONasBytes)
		console.info('- End update asset (success) -')
	}

	async updateAssetUserId(stub, args, thisClass) {
		if (args.length < 2) {
			throw new Error('Incorrect number of arguments. Expecting key and new value.')
		}
		let key = args[0]
		let newValue = args[1]
		console.info('- Start updating asset - ')
		let assetAsBytes = await stub.getState(key)
		if (!assetAsBytes || !assetAsBytes.toString()) {
			throw new Error('Asset does not exist')
		}
		let asset = {}
		try {
			asset = JSON.parse(assetAsBytes.toString())
		} catch (err) {
			let jsonResp = {}
			jsonResp.error = 'Failed to decode JSON of: ' + key
			throw new Error(jsonResp)
		}
		console.info(asset)
		asset.UserId = newValue
		let assetJSONasBytes = Buffer.from(JSON.stringify(asset))
		await stub.putState(key, assetJSONasBytes)
		console.info('- End update asset (success) -')
	}

	async updateAssetDoctorId(stub, args, thisClass) {
		if (args.length < 2) {
			throw new Error('Incorrect number of arguments. Expecting key and new value.')
		}
		let key = args[0]
		let newValue = args[1]
		console.info('- Start updating asset - ')
		let assetAsBytes = await stub.getState(key)
		if (!assetAsBytes || !assetAsBytes.toString()) {
			throw new Error('Asset does not exist')
		}
		let asset = {}
		try {
			asset = JSON.parse(assetAsBytes.toString())
		} catch (err) {
			let jsonResp = {}
			jsonResp.error = 'Failed to decode JSON of: ' + key
			throw new Error(jsonResp)
		}
		console.info(asset)
		asset.DoctorId = newValue
		let assetJSONasBytes = Buffer.from(JSON.stringify(asset))
		await stub.putState(key, assetJSONasBytes)
		console.info('- End update asset (success) -')
	}

	async updateAssetReservationTime(stub, args, thisClass) {
		if (args.length < 2) {
			throw new Error('Incorrect number of arguments. Expecting key and new value.')
		}
		let key = args[0]
		let newValue = args[1]
		console.info('- Start updating asset - ')
		let assetAsBytes = await stub.getState(key)
		if (!assetAsBytes || !assetAsBytes.toString()) {
			throw new Error('Asset does not exist')
		}
		let asset = {}
		try {
			asset = JSON.parse(assetAsBytes.toString())
		} catch (err) {
			let jsonResp = {}
			jsonResp.error = 'Failed to decode JSON of: ' + key
			throw new Error(jsonResp)
		}
		console.info(asset)
		asset.ReservationTime = newValue
		let assetJSONasBytes = Buffer.from(JSON.stringify(asset))
		await stub.putState(key, assetJSONasBytes)
		console.info('- End update asset (success) -')
	}
	
	async cancelReservation(stub, args, thisClass) {
		if (args.length < 1) {
			throw new Error('Incorrect number of arguments.')
		}
		let key = args[0]
		console.info('- Start updating asset - ')
		let assetAsBytes = await stub.getState(key)
		if (!assetAsBytes || !assetAsBytes.toString()) {
			throw new Error('Asset does not exist')
		}
		let asset = {}
		try {
			asset = JSON.parse(assetAsBytes.toString())
		} catch (err) {
			let jsonResp = {}
			jsonResp.error = 'Failed to decode JSON of: ' + key
			throw new Error(jsonResp)
		}
		console.info(asset)
		asset.Canceled = true
		let assetJSONasBytes = Buffer.from(JSON.stringify(asset))
		await stub.putState(key, assetJSONasBytes)
		console.info('- End update asset (success) -')
	}
	
	async rejectReservation(stub, args, thisClass) {
		if (args.length < 1) {
			throw new Error('Incorrect number of arguments.')
		}
		let key = args[0]
		console.info('- Start updating asset - ')
		let assetAsBytes = await stub.getState(key)
		if (!assetAsBytes || !assetAsBytes.toString()) {
			throw new Error('Asset does not exist')
		}
		let asset = {}
		try {
			asset = JSON.parse(assetAsBytes.toString())
		} catch (err) {
			let jsonResp = {}
			jsonResp.error = 'Failed to decode JSON of: ' + key
			throw new Error(jsonResp)
		}
		console.info(asset)
		asset.Rejected = true
		let assetJSONasBytes = Buffer.from(JSON.stringify(asset))
		await stub.putState(key, assetJSONasBytes)
		console.info('- End update asset (success) -')
	}

    // ==================================================
    // Mark asset as deleted - remove an asset key/value pair from state
    // ==================================================
    async delete(stub, args, thisClass) {
        if (args.length != 1) {
            throw new Error('Incorrect number of arguments. Expecting name of the asset to delete')
        }
        let keyName = args[0]
        if (!keyName) {
            throw new Error('key name must not be empty')
        }
        let valAsbytes = await stub.getState(keyName) 
        let jsonResp = {}
        if (!valAsbytes) {
            jsonResp.error = 'key does not exist: ' + name
            throw new Error(jsonResp)
        }
        let asset = {}
        try {
            asset = JSON.parse(valAsbytes.toString())
        } catch (err) {
            jsonResp = {}
            jsonResp.error = 'Failed to decode JSON of: ' + keyName
            throw new Error(jsonResp)
        }
        await stub.deleteState(keyName) 
    }
  
    // ===============================================
    // getHistoryForAsset - gets all previous transactions for asset
    // ===============================================
    async getHistoryForAsset(stub, args, thisClass) {
        if (args.length < 1) {
        throw new Error('Incorrect number of arguments. Expecting 1')
        }
        let key = args[0]
        console.info('- start getHistoryForAsset: %s', key)
    
        let resultsIterator = await stub.getHistoryForKey(key)
        let method = thisClass['getAllResults']
        let results = await method(resultsIterator, true)
    
        return Buffer.from(JSON.stringify(results))
    }
	
    // ===============================================
    //  Ad hoc rich query
    // ===============================================
    async queryAssets(stub, args, thisClass) {
        if (args.length < 1) {
            throw new Error('Incorrect number of arguments. Expecting queryString')
        }
        let queryString = args[0]
        if (!queryString) {
            throw new Error('queryString must not be empty')
        }
        let method = thisClass['getQueryResultForQueryString']
        let queryResults = await method(stub, queryString, thisClass)
        return queryResults
    }

    // ===============================================
    // getAllResults - packs the results to JSON array
    // ===============================================
    async getAllResults(iterator, isHistory) {
        let allResults = []
        while (true) {
        let res = await iterator.next()
  
        if (res.value && res.value.value.toString()) {
            let jsonRes = {}
            console.log(res.value.value.toString('utf8'))
            if (isHistory && isHistory === true) {
                jsonRes.TxId = res.value.tx_id
                jsonRes.Timestamp = res.value.timestamp
                jsonRes.IsDelete = res.value.is_delete.toString()
                try {
                    jsonRes.Value = JSON.parse(res.value.value.toString('utf8'))
                } catch (err) {
                    console.log(err)
                    jsonRes.Value = res.value.value.toString('utf8')
                }
            } else {
                jsonRes.Key = res.value.key
                try {
                    jsonRes.Record = JSON.parse(res.value.value.toString('utf8'))
                } catch (err) {
                    console.log(err)
                    jsonRes.Record = res.value.value.toString('utf8')
                }
            }
            allResults.push(jsonRes)
        }
        if (res.done) {
            console.log('end of data')
            await iterator.close()
            console.info(allResults)
            return allResults
            }
        }
    }
  
    // =========================================================================================
    // getQueryResultForQueryString executes the passed in query string.
    // Result set is built and returned as a byte array containing the JSON results.
    // =========================================================================================
    async getQueryResultForQueryString(stub, queryString, thisClass) {
        console.info('- getQueryResultForQueryString queryString:' + queryString)
        let resultsIterator = await stub.getQueryResult(queryString)
        let method = thisClass['getAllResults']
        let results = await method(resultsIterator, false)
        return Buffer.from(JSON.stringify(results))
    }
}
shim.start(new Chaincode())
