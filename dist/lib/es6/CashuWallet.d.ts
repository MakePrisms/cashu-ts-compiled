import { CashuMint } from './CashuMint.js';
import { AmountPreference, MeltQuoteResponse, MintKeys, MeltTokensResponse, Proof, ReceiveResponse, ReceiveTokenEntryResponse, SendResponse, Token, TokenEntry } from './model/types/index.js';
/**
 * Class that represents a Cashu wallet.
 * This class should act as the entry point for this library
 */
declare class CashuWallet {
    private _keys;
    private _seed;
    mint: CashuMint;
    unit: string;
    /**
     * @param keys public keys from the mint
     * @param mint Cashu mint instance is used to make api calls
     * @param mnemonicOrSeed mnemonic phrase or Seed to initial derivation key for this wallets deterministic secrets. When the mnemonic is provided, the seed will be derived from it.
     * This can lead to poor performance, in which case the seed should be directly provided
     */
    constructor(mint: CashuMint, keys?: MintKeys, mnemonicOrSeed?: string | Uint8Array);
    get keys(): MintKeys;
    set keys(keys: MintKeys);
    /**
     * Receive an encoded or raw Cashu token
     * @param {(string|Token)} token - Cashu token
     * @param preference optional preference for splitting proofs into specific amounts
     * @param counter? optionally set counter to derive secret deterministically. CashuWallet class must be initialized with seed phrase to take effect
     * @returns New token with newly created proofs, token entries that had errors
     */
    receive(token: string | Token, preference?: Array<AmountPreference>, counter?: number): Promise<ReceiveResponse>;
    /**
     * Receive a single cashu token entry
     * @param tokenEntry a single entry of a cashu token
     * @param preference optional preference for splitting proofs into specific amounts.
     * @param counter? optionally set counter to derive secret deterministically. CashuWallet class must be initialized with seed phrase to take effect
     * @returns New token entry with newly created proofs, proofs that had errors
     */
    receiveTokenEntry(tokenEntry: TokenEntry, preference?: Array<AmountPreference>, counter?: number): Promise<ReceiveTokenEntryResponse>;
    /**
     * Splits and creates sendable tokens
     * if no amount is specified, the amount is implied by the cumulative amount of all proofs
     * if both amount and preference are set, but the preference cannot fulfill the amount, then we use the default split
     * @param amount amount to send while performing the optimal split (least proofs possible). can be set to undefined if preference is set
     * @param proofs proofs matching that amount
     * @param preference optional preference for splitting proofs into specific amounts. overrides amount param
     * @param counter? optionally set counter to derive secret deterministically. CashuWallet class must be initialized with seed phrase to take effect
     * @returns promise of the change- and send-proofs
     */
    send(amount: number, proofs: Array<Proof>, preference?: Array<AmountPreference>, counter?: number): Promise<SendResponse>;
    /**
     * Regenerates
     * @param start set starting point for count (first cycle for each keyset should usually be 0)
     * @param count set number of blinded messages that should be generated
     * @returns proofs
     */
    restore(start: number, count: number, keysetId?: string): Promise<{
        proofs: Array<Proof>;
    }>;
    /**
     * Initialize the wallet with the mints public keys
     */
    private getKeys;
    /**
     * Requests a mint quote form the mint. Response returns a Lightning payment request for the requested given amount and unit.
     * @param amount Amount requesting for mint.
     * @returns the mint will create and return a Lightning invoice for the specified amount
     */
    getMintQuote(amount: number): Promise<import("./model/types/index.js").RequestMintResponse>;
    /**
     * Mint tokens for a given mint quote
     * @param amount amount to request
     * @param quote ID of mint quote
     * @returns proofs
     */
    mintTokens(amount: number, quote: string, keysetId?: string, AmountPreference?: Array<AmountPreference>, counter?: number): Promise<{
        proofs: Array<Proof>;
    }>;
    /**
     * Requests a melt quote from the mint. Response returns amount and fees for a given unit in order to pay a Lightning invoice.
     * @param invoice LN invoice that needs to get a fee estimate
     * @returns estimated Fee
     */
    getMeltQuote(invoice: string): Promise<MeltQuoteResponse>;
    /**
     * Melt tokens for a melt quote. proofsToSend must be at least amount+fee_reserve form the melt quote.
     * Returns payment proof and change proofs
     * @param meltQuote ID of the melt quote
     * @param proofsToSend proofs to melt
     * @returns
     */
    meltTokens(meltQuote: MeltQuoteResponse, proofsToSend: Array<Proof>, keysetId?: string, counter?: number): Promise<MeltTokensResponse>;
    /**
     * Helper function that pays a Lightning invoice directly without having to create a melt quote before
     * The combined amount of Proofs must match the payment amount including fees.
     * @param invoice
     * @param proofsToSend the exact amount to send including fees
     * @param meltQuote melt quote for the invoice
     * @param keysetId? optionally set keysetId for blank outputs for returned change.
     * @param counter? optionally set counter to derive secret deterministically. CashuWallet class must be initialized with seed phrase to take effect
     * @returns
     */
    payLnInvoice(invoice: string, proofsToSend: Array<Proof>, meltQuote?: MeltQuoteResponse, keysetId?: string, counter?: number): Promise<MeltTokensResponse>;
    /**
     * Helper function to ingest a Cashu token and pay a Lightning invoice with it.
     * @param invoice Lightning invoice
     * @param token cashu token
     * @param meltQuote melt quote for the invoice
     * @param keysetId? optionally set keysetId for blank outputs for returned change.
     * @param counter? optionally set counter to derive secret deterministically. CashuWallet class must be initialized with seed phrase to take effect
     */
    payLnInvoiceWithToken(invoice: string, token: string, meltQuote?: MeltQuoteResponse, keysetId?: string, counter?: number): Promise<MeltTokensResponse>;
    /**
     * Creates a split payload
     * @param amount amount to send
     * @param proofsToSend proofs to split*
     * @param preference optional preference for splitting proofs into specific amounts. overrides amount param
     * @param counter? optionally set counter to derive secret deterministically. CashuWallet class must be initialized with seed phrase to take effect
     * @returns
     */
    private createSplitPayload;
    /**
     * returns proofs that are already spent (use for keeping wallet state clean)
     * @param proofs (only the 'secret' field is required)
     * @returns
     */
    checkProofsSpent<T extends {
        secret: string;
    }>(proofs: Array<T>): Promise<Array<T>>;
    private splitReceive;
    /**
     * Creates blinded messages for a given amount
     * @param amount amount to create blinded messages for
     * @param amountPreference optional preference for splitting proofs into specific amounts. overrides amount param
     * @param counter? optionally set counter to derive secret deterministically. CashuWallet class must be initialized with seed phrase to take effect
     * @returns blinded messages, secrets, rs, and amounts
     */
    private createRandomBlindedMessages;
    /**
     * Creates blinded messages for a according to @param amounts
     * @param amount array of amounts to create blinded messages for
     * @param counter? optionally set counter to derive secret deterministically. CashuWallet class must be initialized with seed phrase to take effect
     * @param keyksetId? override the keysetId derived from the current mintKeys with a custom one. This should be a keyset that was fetched from the `/keysets` endpoint
     * @returns blinded messages, secrets, rs, and amounts
     */
    private createBlindedMessages;
    /**
     * Creates NUT-08 blank outputs (fee returns) for a given fee reserve
     * See: https://github.com/cashubtc/nuts/blob/main/08.md
     * @param feeReserve amount to cover with blank outputs
     * @param counter? optionally set counter to derive secret deterministically. CashuWallet class must be initialized with seed phrase to take effect
     * @returns blinded messages, secrets, and rs
     */
    private createBlankOutputs;
}
export { CashuWallet };
