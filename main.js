const Apify = require('apify');
const _ = require('underscore');
const Promise = require('bluebird');
Apify.setPromisesDependency(Promise);

async function startRuns(urls, key, offset, limit){
    const execIds = [];
    const execPromises = [];
    const urlSlice = limit ? urls.slice(offset, offset + limit) : urls;
    _.each(urlSlice, function(url){
        console.log('starting execution, url: ' + url);
        const ePromise = Apify.client.crawlers.startExecution({settings: {startUrls: [{key: key, value: url}]}});
        ePromise.then(function(result){
            //console.log('execution started, id: ' + result._id);
            execIds.push(result._id);
        });
        execPromises.push(ePromise);
    });
    await Promise.all(execPromises);
    console.log('all executions started');
    return execIds;
}

function waitForFinish(execId, callback){
    const interval = setInterval(async function(){
        const exec = await Apify.client.crawlers.getExecutionDetails({executionId: execId});
        if(exec.status != 'RUNNING'){
            clearInterval(interval);
            callback(null, exec);
        }
    }, 1000);
}
const waitForFinishAsync = Promise.promisify(waitForFinish);

async function waitForExecs(execIds){
    const waitPromises = [];
    _.each(execIds, function(eId){
        console.log('waiting for finish, executionId: ' + eId);
        waitPromises.push(waitForFinishAsync(eId));
    });
    await Promise.all(waitPromises);
    console.log('all executions finished');
}

async function runBatches(urls, key, count){
    let offset = 0;
    let execIds = [];
    while(offset <= urls.length){
        const execs = await startRuns(urls, key, offset, count);
        await waitForExecs(execs);
        execIds = execIds.concat(execs);
        offset += count;
        console.log('finished: ' + offset + '/' + urls.length);
    }
    return execIds;
}

Apify.main(async () => {
    const input = await Apify.getValue('INPUT');
    if(!input.crawlerId){
        console.log('ERROR: missing "crawlerId" attribute in INPUT');
        return null;
    }
    if(!input.urls){
        console.log('ERROR: missing "urls" attribute in INPUT');
        return null;
    }
    Apify.client.setOptions({crawlerId: input.crawlerId});
    const execIds = await runBatches(input.urls, input.label || '', input.batch || 5);
    await Apify.setValue('OUTPUT', {executionIds: execIds});
    console.dir(execIds);
});
