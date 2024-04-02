import type { CheckStatePayload, CheckStateResponse, GetInfoResponse, MeltPayload, MeltResponse, MintActiveKeys, MintAllKeysets, PostRestoreResponse, RequestMintResponse, SerializedBlindedMessage, SplitPayload, SplitResponse, RequestMintPayload, PostMintPayload, PostMintResponse, PostRestorePayload, MeltQuotePayload, MeltQuoteResponse } from './model/types/index.js';
import request from './request.js';
/**
 * Class represents Cashu Mint API. This class contains Lower level functions that are implemented by CashuWallet.
 */
declare class CashuMint {
    private _mintUrl;
    private _customRequest?;
    /**
     * @param _mintUrl requires mint URL to create this object
     * @param _customRequest if passed, use custom request implementation for network communication with the mint
     */
    constructor(_mintUrl: string, _customRequest?: typeof request);
    get mintUrl(): string;
    /**
     * fetches mints info at the /info endpoint
     * @param mintUrl
     * @param customRequest
     */
    static getInfo(mintUrl: string, customRequest?: typeof request): Promise<GetInfoResponse>;
    /**
     * fetches mints info at the /info endpoint
     */
    getInfo(): Promise<GetInfoResponse>;
    /**
     * Starts a minting process by requesting an invoice from the mint
     * @param mintUrl
     * @param amount Amount requesting for mint.
     * @param customRequest
     * @returns the mint will create and return a Lightning invoice for the specified amount
     */
    static mintQuote(mintUrl: string, requestMintPayload: RequestMintPayload, customRequest?: typeof request): Promise<RequestMintResponse>;
    /**
     * Starts a minting process by requesting an invoice from the mint
     * @param amount Amount requesting for mint.
     * @returns the mint will create and return a Lightning invoice for the specified amount
     */
    mintQuote(requestMintPayload: RequestMintPayload): Promise<RequestMintResponse>;
    /**
     * Requests the mint to perform token minting after the LN invoice has been paid
     * @param mintUrl
     * @param payloads outputs (Blinded messages) that can be written
     * @param hash hash (id) used for by the mint to keep track of wether the invoice has been paid yet
     * @param customRequest
     * @returns serialized blinded signatures
     */
    static mint(mintUrl: string, mintPayload: PostMintPayload, customRequest?: typeof request): Promise<PostMintResponse>;
    /**
     * Requests the mint to perform token minting after the LN invoice has been paid
     * @param payloads outputs (Blinded messages) that can be written
     * @param hash hash (id) used for by the mint to keep track of wether the invoice has been paid yet
     * @returns serialized blinded signatures
     */
    mint(mintPayload: PostMintPayload): Promise<PostMintResponse>;
    /**
     * Get the mints public keys
     * @param mintUrl
     * @param keysetId optional param to get the keys for a specific keyset. If not specified, the keys from the active keyset are fetched
     * @param customRequest
     * @returns
     */
    static getKeys(mintUrl: string, keysetId?: string, customRequest?: typeof request): Promise<MintActiveKeys>;
    /**
     * Get the mints public keys
     * @param keysetId optional param to get the keys for a specific keyset. If not specified, the keys from the active keyset are fetched
     * @returns the mints public keys
     */
    getKeys(keysetId?: string, mintUrl?: string): Promise<MintActiveKeys>;
    /**
     * Get the mints keysets in no specific order
     * @param mintUrl
     * @param customRequest
     * @returns all the mints past and current keysets.
     */
    static getKeySets(mintUrl: string, customRequest?: typeof request): Promise<MintAllKeysets>;
    /**
     * Get the mints keysets in no specific order
     * @returns all the mints past and current keysets.
     */
    getKeySets(): Promise<MintAllKeysets>;
    /**
     * Ask mint to perform a split operation
     * @param mintUrl
     * @param splitPayload data needed for performing a token split
     * @param customRequest
     * @returns split tokens
     */
    static split(mintUrl: string, splitPayload: SplitPayload, customRequest?: typeof request): Promise<SplitResponse>;
    /**
     * Ask mint to perform a split operation
     * @param splitPayload data needed for performing a token split
     * @returns split tokens
     */
    split(splitPayload: SplitPayload): Promise<SplitResponse>;
    /**
     * Asks the mint for a melt quote
     * @param mintUrl
     * @param MeltQuotePayload
     * @returns
     */
    static meltQuote(mintUrl: string, meltQuotePayload: MeltQuotePayload, customRequest?: typeof request): Promise<MeltQuoteResponse>;
    /**
     * Asks the mint for a melt quote
     * @param MeltQuotePayload
     * @returns
     */
    meltQuote(meltQuotePayload: MeltQuotePayload): Promise<MeltQuoteResponse>;
    /**
     * Ask mint to perform a melt operation. This pays a lightning invoice and destroys tokens matching its amount + fees
     * @param mintUrl
     * @param meltPayload
     * @param customRequest
     * @returns
     */
    static melt(mintUrl: string, meltPayload: MeltPayload, customRequest?: typeof request): Promise<MeltResponse>;
    /**
     * Ask mint to perform a melt operation. This pays a lightning invoice and destroys tokens matching its amount + fees
     * @param meltPayload
     * @returns
     */
    melt(meltPayload: MeltPayload): Promise<MeltResponse>;
    /**
     * Checks if specific proofs have already been redeemed
     * @param mintUrl
     * @param checkPayload
     * @param customRequest
     * @returns redeemed and unredeemed ordered list of booleans
     */
    static check(mintUrl: string, checkPayload: CheckStatePayload, customRequest?: typeof request): Promise<CheckStateResponse>;
    /**
     * Checks if specific proofs have already been redeemed
     * @param checkPayload
     * @returns redeemed and unredeemed ordered list of booleans
     */
    check(checkPayload: CheckStatePayload): Promise<CheckStateResponse>;
    static restore(mintUrl: string, restorePayload: PostRestorePayload, customRequest?: typeof request): Promise<PostRestoreResponse>;
    restore(restorePayload: {
        outputs: Array<SerializedBlindedMessage>;
    }): Promise<PostRestoreResponse>;
}
export { CashuMint };
