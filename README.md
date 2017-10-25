# act-run-crawler-url-list-batch

This act starts crawler runs for a specified list of URLs.

It starts the runs in batches of __"N_OF_URLS_IN_BATCH"__, always waits for one batch to finish before starting the next. After all runs finish, the act returns a list of all ExecutionIDs.

__Example input:__
```javascript
{
    "urls": ["URL_1", "URL_2", "URL_3", ...],
    "label": "START_URL_LABEL",
    "batch": "N_OF_URLS_IN_BATCH"
}
```

__Example output:__
```javascript
{
    "executionIds": [
        "EXECUTION_ID_1",
        "EXECUTION_ID_2",
        "EXECUTION_ID_3",
        ...
    ]
}
```

It is useful to chain output of this act into "petr_cermak/executions_merge" act.
