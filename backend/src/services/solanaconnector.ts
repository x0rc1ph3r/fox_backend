import {
    Connection,
    PublicKey,
    Transaction,
    Keypair,
    sendAndConfirmTransaction,
} from "@solana/web3.js";
import { Program, AnchorProvider, Wallet } from "@coral-xyz/anchor";
import { getAssociatedTokenAddress, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import * as anchor from "@coral-xyz/anchor";
import raffleIdl from "../types/raffle.json";

const connection = new Connection(
    process.env.SOLANA_RPC_URL || "https://api.devnet.solana.com",
    "confirmed"
);

const RAFFLE_ADMIN_KEYPAIR = Keypair.fromSecretKey(
    Uint8Array.from(JSON.parse(process.env.RAFFLE_ADMIN_PRIVATE_KEY || "[]"))
);

const wallet = new Wallet(RAFFLE_ADMIN_KEYPAIR);
const provider = new AnchorProvider(connection, wallet, {
    commitment: "confirmed",
});

// Your raffle program (replace with your actual program ID and IDL)
const RAFFLE_PROGRAM_ID = new anchor.web3.PublicKey(raffleIdl.address);
const raffleProgram = new Program(raffleIdl as anchor.Idl, provider);

// Placeholder addresses
const FAKE_MINT = new PublicKey("So11111111111111111111111111111111111111112");
const FAKE_ATA = new PublicKey("B9W4wPFWjTbZ9ab1okzB4D3SsGY7wntkrBKwpp5RC1Uv");

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Derives the raffle PDA
 */
function rafflePda(raffleId: number): PublicKey {
    const [pda] = PublicKey.findProgramAddressSync(
        [
            Buffer.from("raffle"),
            Buffer.from(new Uint8Array(new BigUint64Array([BigInt(raffleId)]).buffer)),
        ],
        RAFFLE_PROGRAM_ID
    );
    return pda;
}

/**
 * Derives the raffle config PDA
 */
function getRaffleConfigPda(): PublicKey {
    const [pda] = PublicKey.findProgramAddressSync(
        [Buffer.from("raffle_config")],
        RAFFLE_PROGRAM_ID
    );
    return pda;
}

/**
 * Gets the token program from a mint (Token or Token-2022)
 */
async function getTokenProgramFromMint(
    connection: Connection,
    mint: PublicKey
): Promise<PublicKey> {
    const accountInfo = await connection.getAccountInfo(mint);
    
    if (!accountInfo) {
        throw new Error("Mint account not found");
    }

    // Check if it's Token-2022 program
    const TOKEN_2022_PROGRAM_ID = new PublicKey(
        "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb"
    );
    
    if (accountInfo.owner.equals(TOKEN_2022_PROGRAM_ID)) {
        return TOKEN_2022_PROGRAM_ID;
    }
    
    return TOKEN_PROGRAM_ID;
}

/**
 * Ensures an ATA exists and returns instruction if creation needed
 */
async function ensureAtaIx(params: {
    connection: Connection;
    mint: PublicKey;
    owner: PublicKey;
    payer: PublicKey;
    tokenProgram: PublicKey;
    allowOwnerOffCurve?: boolean;
}): Promise<{ ata: PublicKey; ix: any | null }> {
    const { connection, mint, owner, payer, tokenProgram, allowOwnerOffCurve } = params;

    const ata = await getAssociatedTokenAddress(
        mint,
        owner,
        allowOwnerOffCurve,
        tokenProgram
    );

    const accountInfo = await connection.getAccountInfo(ata);

    if (accountInfo) {
        return { ata, ix: null };
    }

    // Create ATA instruction
    const { createAssociatedTokenAccountInstruction } = await import("@solana/spl-token");
    
    const ix = createAssociatedTokenAccountInstruction(
        payer,
        ata,
        owner,
        mint,
        tokenProgram
    );

    return { ata, ix };
}

// ============================================================================
// Main Function: Announce Winners
// ============================================================================

async function announceWinners(
    raffleProgram: Program,
    args: {
        raffleId: number;
        winners: PublicKey[];
    }
): Promise<string> {
    try {
        const tx = new Transaction();

        // ---------------- PDAs ----------------
        const raffleAccountPda = rafflePda(args.raffleId);
        const raffleConfigPda = getRaffleConfigPda();

        const raffleData = await (raffleProgram.account as any).raffle.fetch(
            raffleAccountPda
        );

        // ---------------- Ticket mint ----------------
        const ticketMint = raffleData.ticketMint ?? FAKE_MINT;

        // ---------------- Token program ----------------
        const ticketTokenProgram = await getTokenProgramFromMint(
            connection,
            ticketMint
        );

        // ---------------- Escrow & Treasury ----------------
        let ticketEscrow = FAKE_ATA;
        let ticketFeeTreasury = FAKE_ATA;

        if (raffleData.ticketMint !== null) {
            // Ticket escrow ATA (owner = raffle PDA)
            const escrowRes = await ensureAtaIx({
                connection,
                mint: ticketMint,
                owner: raffleAccountPda,
                payer: RAFFLE_ADMIN_KEYPAIR.publicKey,
                tokenProgram: ticketTokenProgram,
                allowOwnerOffCurve: true,
            });

            ticketEscrow = escrowRes.ata;
            if (escrowRes.ix) tx.add(escrowRes.ix);

            // Fee treasury ATA (owner = raffle config PDA)
            const treasuryRes = await ensureAtaIx({
                connection,
                mint: ticketMint,
                owner: raffleConfigPda,
                payer: RAFFLE_ADMIN_KEYPAIR.publicKey,
                tokenProgram: ticketTokenProgram,
                allowOwnerOffCurve: true,
            });

            ticketFeeTreasury = treasuryRes.ata;
            if (treasuryRes.ix) tx.add(treasuryRes.ix);
        }

        // ---------------- Anchor Instruction ----------------
        const ix = await raffleProgram.methods
            .announceWinners(args.raffleId, args.winners)
            .accounts({
                raffleAdmin: RAFFLE_ADMIN_KEYPAIR.publicKey,
                ticketMint,
                ticketEscrow,
                ticketFeeTreasury,
                ticketTokenProgram,
            })
            .instruction();

        tx.add(ix);

        // ---------------- Send TX ----------------
        const signature = await sendAndConfirmTransaction(
            connection,
            tx,
            [RAFFLE_ADMIN_KEYPAIR],
            { commitment: "confirmed" }
        );

        console.log("Winners announced:", signature);
        return signature;

    } catch (error) {
        console.error("Announce winners failed:", error);
        throw error;
    }
}

// ============================================================================
// Usage Example
// ============================================================================

async function main() {
    // Example usage
    const raffleId = 1;
    const winners = [
        new PublicKey("Winner1PublicKey..."),
        new PublicKey("Winner2PublicKey..."),
        new PublicKey("Winner3PublicKey..."),
    ];

    try {
        // Uncomment once you have your program initialized
        // const signature = await announceWinners(raffleProgram, {
        //     raffleId,
        //     winners,
        // });
        // console.log("Transaction signature:", signature);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
}

// Run if this is the main module
if (require.main === module) {
    main();
}

export { announceWinners, connection, provider, RAFFLE_ADMIN_KEYPAIR };