# poller-service

## Overview

`poller-service` is a framework service that is structured to poll messages from a source to individually process in Activities.

In the implementation, the service polls from a mock client and processes each message in an Activity with a:

- Parser that breaks the message into units
- Grouper that groups the units based on a property
- Servicer that calls a mock external service on each group
- Filter to filter out units that do not meet the criteria
- Writer to write the units based on property into files.

The code can be modified with similar abstractions to produce an organized and functional poller service for real use cases: polling from an external source, calling external services, and transforming input into meaningful data.

## Workflow

The general workflow for polling in this example is as follows:

1. [`build.js`](build.js) is the entry point of the service, called from [`yarn start`](package.json)
    - Environmental Variables are configured from `config/.env`
    - `Sourcer` is called from [`config/Sourcer.js`](config/Sourcer.js)
2. `Sourcer` starts polling from the configured source
    - The `Sourcer` polls from the source at a defined interval
    - The message is sent to an `Activity` from [`src/activity/Activity.js`](src/activity/Activity.js)
    - In this example, the source is mocked by `#pollClient` in `Sourcer`
3. `Activity` defines the process applied to a message
    - In this example, the process the message goes through is as follows:
        - Parsed by [`SubfolderParser`](src/subfolder/SubfolderParser.js) on `,` and `|`  into [`SubfolderUnit`](src/subfolder/utils/SubfolderUnit.js)s
        - Grouped and transformed by [`SubfolderGrouper`](src/subfolder/SubfolderGrouper.js)
        - Called by `SubfolderServicer` to the [`Service`](src/external/Service.js)
        - Filtered by [`SubfolderFilter`](src/subfolder/SubfolderFilter.js) based on configured criteria
        - Written by [`SubfolderWriter`](src/subfolder/SubfolderWriter.js) to a configured destination folder
    - `Activity`s should be independent of other `Activity`s like traditional request handlers
4. The files can be removed with [`yarn clean`](package.json) after adjusting the folder to `rm -rf` in the script

## Structure

The structure follows a traditional service structure with the main codebase in [`src/`](src/): separated by responsibility: [`activity/`](src/activity/), [`external/`](src/external), [`subfolder/`](src/subfolder), and [`utils/`](src/utils).

```text
poller-service
├── README.md
├── build.js
├── config
│   └── Sourcer.js
├── package.json
└── src
    ├── activity
    │   └── Activity.js
    ├── external
    │   └── Service.js
    ├── subfolder
    │   ├── SubfolderFilter.js
    │   ├── SubfolderGrouper.js
    │   ├── SubfolderParser.js
    │   ├── SubfolderServicer.js
    │   ├── SubfolderWriter.js
    │   └── utils
    │       └── SubfolderUnit.js
    └── utils
        └── UnitSerializer.js
Note: Excluding node_modules/
```

### Activity

An Activity is the main handler for a polled message from the Sourcer and follows a few principles:

- An Activity is atomic, meaning Activities can run concurrently
- An Activity encapsulates all business logic applied to the message
- An Activity is simple for semantics rather than convoluted code

In [`src/activity/Activity.js`](src/activity/Activity.js), `Activity` is defined. The code for the Activity is minimal, only including the import and usage of the Classes from the Subfolder.

Although there is only one Activity defined in the project, the [`Sourcer`](config/Sourcer.js) `start` method could be modified to poll from more Sources with corresponding Activities, allowing the service to expand past a specific stack.

### Subfolder

A Subfolder is a generalization for the Classes corresponding to an Activity. By nature, these definitions implement the business logic for the input to go through. By hosting the business logic inside the Subfolder, each step of the Activity can be easily organized, leading to benefits such as easy unit testing and maintaining single responsibility in simple classes.

In [`src/subfolder/`](src/subfolder/), these are the Classes that correspond to the Activity.

- [`SubfolderParser`](src/subfolder/SubfolderParser.js)
- [`SubfolderGrouper`](src/subfolder/SubfolderGrouper.js)
- [`SubfolderServicer`](src/subfolder/SubfolderServicer.js)
- [`SubfolderFilter`](src/subfolder/SubfolderFilter.js)
- [`SubfolderWriter`](src/subfolder/SubfolderWriter.js)

The message process most closely resembles the [chain of responsibility design pattern](https://refactoring.guru/design-patterns/chain-of-responsibility), passing the outputs from each method call to the next Subfolder Class. Although there are no errors in this example, service errors need to be handled at every step of the process.

### External

Services often have to call other Services, whether it is for fetching data or validating information. External Classes act as an interface, wrapping specific methods of the native service client with service specific context, limiting extraneous behavior.

In [`src/external/Service.js`](src/external/Service.js), the `Service` class has a `call` method which returns a transformed version of the object provided, tremendously generalized compared to real external services.

A theoretical example could be calling a `UserService` Class that would wrap around a DynamoDbClient. The classs could specify a method like `getUser` that would take as input a `primaryKey` (email, username, etc.), calling `getItem` on the DynamoDbClient. Not only that, parameters like `TableName` could be predefined in the service to avoid configuration errors.

### Utilities

Utilities are generalized classes that can be used across any Subfolder.

For example, the [`UnitSerializer`](src/utils/UnitSerializer.js) takes an object and converts it into a JSON string. Although the implemented process uses `UnitSerializer` to prepare units before writing them to files, the class could be used across a general range of use cases not limited to the implemented Activity, thus categorized a Utility.

## Configuration

Although a `config/.env` file is not included due to privacy concerns, here is an example of a configuration file for the implementation.

Variable    | Value     | Description
----------- | --------- | -----------
SOURCE_NAME | "sqs"     | SOURCE_NAME is the mock [SQS](https://aws.amazon.com/sqs/) queue name
DEAD_NAME   | "dlq"     | DEAD_NAME is the mock [Dead Letter Queue](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-dead-letter-queues.html) name
DEST        | "dest/"   | DEST is the name of the folder of the processed messsages
CRITERIA1   | "abc"     | CRITERIA1 defines the property `#criteria1` used in [`SubfolderFilter`](src/subfolder/SubfolderFilter.js)
CRITERIA2   | "def"     | CRITERIA2 defines the property `#criteria2` used in [`SubfolderFilter`](src/subfolder/SubfolderFilter.js)
INTERVAL    | 2000      | INTERVAL is the time in milliseconds between each poll used in [`Sourcer`](config/Sourcer.js)
TRANSFORM   | "special" | TRANSFORM is a property defined for the `transform` method in [`SubfolderGrouper`](src/subfolder/SubfolderGrouper.js)
NUM_FIELDS  | 3         | NUM_FIELDS defines the number of properties a [`SubfolderUnit`](src/subfolder/utils/SubfolderUnit.js) used in [`Sourcer`](config/Sourcer.js)
FIELD_COUNT | 16        | FIELD_COUNT defines the number of values to choose from per poll for creating a message used in [`Sourcer`](config/Sourcer.js)

These environment variables should be modified to fit the implementation of each modified poller service, from configuring a different source to providing additional variables for Subfolder transformations.

## Sourcer

The [Sourcer](config/Sourcer.js) is the most complex part of the service due the mock `#pollClient`. For each poll, the workflow is as follows:

- Creating a poll which comprises of multiple messages, which requires
- Creating messages by joining a random number of units, which requires
- Creating units by [randomly picking fields](https://stackoverflow.com/questions/19269545/how-to-get-a-number-of-random-elements-from-an-array) equal to the configured number of fields, which requires
- [Creating random strings](https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript) for potential field values equal to the configured field count

In essence, each poll can contain a random amount of messages, and each message can contain a random amount of units, and each unit contains a configured number of fields randomly chosen from a range of values which size is the configured field count.

The `start` and `stop` methods are straight forward, setting the interval to poll and process the mock messsages. Also, the `start` method attaches the `stop` method to the process `exit` event to clean up any last functions yet to be executed.

## Notes

### Node.js

The service requires node v13.0.0 or above to natively support ES6 modules. Using the keywords `import` and `export` felt much more natural given the number of classes defined in the service, a welcomed alternative as opposed to `require` and `module.exports`.

However, it should be noted that not every package can be destructured on import, namely CommonJS modules. For example, the file names originally used [`uuid.v4`](https://www.npmjs.com/package/uuid) to generate unique random strings, but node did not allow destructuring `v4` on import.

### Motivation

I am currently working on a service codebase at my internship at Amazon and was surprised by how semantically organized the code is. Coming from a background of toying with express.js servers and programming language design, the code seemed to strike a perfect balance.

- The service created handlers known as Activities for each message from a source SQS queue, similar to express.js having a route handling a request with a callback function.
- The Activity implementation followed a chain of responsibility design pattern to process a message in steps reliant on the previous step's result, similar to a compiler processing source code by lexing, parsing, optimizing, and assembling.

Looking at the simple implementation of a service, two seemingly separate fields of experience I had seemed to come together seemlessly. These fundamentals can appear in everyday work, leading to the hope that I would not only be able to recognize these patterns in the code but also be a contributor of knowledge from my niche experience of both practical software engineering and theoretical computer science.
