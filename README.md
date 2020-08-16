# Outpost SmartWeave Contracts

Our smart contracts are built on Arweave. Arweave smart contracts, a.k.a. SmartWeave contracts, are super cheap and a lot more flexible than those on any other smart contract platform we've seen. Notably they allow use to use an alternate identity system. Rather than using Arweave public keys as identities, we use 3box 3IDs. 3IDs, an implementation of [w3c's DID spec](https://www.w3.org/TR/did-core/#:~:text=A%20DID%20method%20is%20defined,documents%20are%20written%20and%20updated.) are blockchain agnostic identifiers; they'll allow us to use a single identity system as we plan to add features from multiple blockchains in the future.

## The Repo
- /contracts
  - our smartweave contracts
- /src
  - Arweave's logic for interpreting SmartWeave contracts. Our contracts require an instance of ipfs to run so we created a file readOutpostContract.ts that changes contract-read.ts to pass an instance of ipfs to the contract.
- /test
  - tests for the contracts.
- /bin
  - a script to deploy the contracts.

### Install dependencies
```bash
yarn install
```

### Build the contracts
```bash
yarn build:contracts
```

### Test the contracts
```bash
yarn test:contracts
```

To deploy the contracts and run some of our scripts for posting transactions, you'll need to create and .env file and set DEV_WALLET to the path to your arweave wallet. The file ./.env.example is provided as an example.

### Deploy a contract
```bash
yarn deploy:prod
```

The rest of the readme is from Arweave's SmartWeave repo which we forked. Refer to it for more information on SmartWeave contracts.
# SmartWeave

## Simple, scalable smart contracts on the Arweave protocol

Uses lazy-evaluation to move the burden of contract execution from network nodes
to smart contract users. Currently, SmartWeave supports JavaScript, using the
client's unmodified execution engine.

**Version: 0.3**

For information on how the contracts execute, how to write one, and the API, read the [Contract Guide](CONTRACT-GUIDE.md) and check some of the [examples](examples/)

For information on how to create a new PST token, you can read the [PST Creation Guide](CREATE-PST.md).

For a description of the SDK methods available, you can check [here](SDK.md)

## CLI Usage

Clone this repository and run `npm install`.

You can deploy a contract as follows:

```
node smartweave-cli --key-file [YOUR KEYFILE] \
  --create --contract-src [SRC LOCATION] \
  --init-state [INITIAL STATE FILE]
```

Or, using an existing contract source that is already deployed but with a new initial state and contract id:

```
node smartweave-cli --key-file [YOUR KEYFILE] \
  --create --contract-src-tx [SRC TX] \
  --init-state [INITIAL STATE FILE]
```

Check its state:

```
node smartweave-cli --key-file [YOUR KEYFILE] \
  --contract [CONTRACT TXID] \
  --get-state
```

Interact with it:

```
node smartweave-cli --key-file [YOUR KEYFILE] \
  --contract [CONTRACT TXID] \
  --interact \
  --input "[CONTRACT INPUT STRING HERE]"
```

When interacting with the contract, the value passed to --input must be valid json. Typically an object is used:

`--input '{ "function": "transfer", "qty": 1984 }'`

To test a contract interaction without writing it to the network, append `--dry-run` to your `--interact` call.

## License

This project is licensed under the terms of the MIT license.
